import { Context } from 'koa';
import request from 'request';

import { signJwt } from '@/app/authJwt';
import emitError from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import {
  github_client_id,
  github_client_secret,
  github_redirect_uri,
} from '@/config/secret';
import { IList, IQqUser } from '@/interface';
import thirdUserModel from '@/model/thirdUser.model';
import githubUserService from '@/service/githubUser.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';

export interface IQqUserList extends IList {
  nickname: string;
  gender: string;
  created_at?: string;
  updated_at?: string;
}
class GithubUserController {
  async create(ctx: Context, next) {
    try {
      const {
        client_id,
        openid,
        unionid,
        nickname,
        figureurl_qq,
        constellation,
        gender,
        city,
        province,
        year,
      }: IQqUser = ctx.request.body;
      const result = await githubUserService.create({
        client_id,
        openid,
        unionid,
        nickname,
        figureurl_qq,
        constellation,
        gender,
        city,
        province,
        year,
      });
      successHandler({ ctx, data: result });
      /**
       * 这个其实是最后一个中间件了，其实加不加调不调用next都没影响，但是为了防止后面要
       * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
       * 因此还是得在这调用一次await next()
       */
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getAccessToken(code) {
    const params: any = {};
    params.code = code;
    params.client_id = github_client_id;
    params.client_secret = github_client_secret;
    params.redirect_uri = github_redirect_uri;
    const accessToken: any = await new Promise((resolve) => {
      request(
        {
          url: `https://github.com/login/oauth/access_token`,
          method: 'GET',
          headers: {
            Accept: 'application/json',
          },
          qs: {
            ...params,
          },
        },
        (error, response, body) => {
          resolve(JSON.parse(body));
        }
      );
    });
    return accessToken;
  }

  /**
   * 获取用户OpenID_OAuth2.0，即获取openid和unionid
   * https://wiki.connect.qq.com/%e8%8e%b7%e5%8f%96%e7%94%a8%e6%88%b7openid_oauth2-0
   * https://wiki.connect.qq.com/unionid%e4%bb%8b%e7%bb%8d
   */
  async getMeOauth({ access_token }) {
    const OauthInfo: any = await new Promise((resolve) => {
      request(
        {
          url: `https://api.github.com/user`,
          method: 'GET',
          headers: {
            'User-Agent': 'PowerShellForGitHub',
          },
          auth: {
            bearer: access_token,
          },
        },
        (error, response, body) => {
          if (!error) {
            resolve(JSON.parse(body));
          }
        }
      );
    });
    return OauthInfo;
  }

  /**
   * github登录逻辑：
   * 1，调用getAccessToken(code),拿到access_token
   * 2，根据access_token，调用getMeOauth()拿到openid和unionid
   * 3，判断github_user表里面有没有存在相同的unionid，
   *  3.1，如果没有存在相同的unionid，即代表是首次登录，在github_user表里面给他新增一条记录,并
   * 且默认给他新建并且绑定一个用户。
   *  3.2，存在相同的unionid代表已经在本站登录注册过了，直接通过third_user表找到对应的user表的
   * 用户，更新一下该用户的token即可。
   */
  login = async (ctx: Context, next) => {
    try {
      const { code } = ctx.request.query; // 注意此code会在10分钟内过期。
      const accessToken = await this.getAccessToken(code);
      if (accessToken.error) throw new Error(JSON.stringify(accessToken));
      let OauthInfo: any = await this.getMeOauth({
        access_token: accessToken.access_token,
      });
      const isExist = await githubUserService.isExist([OauthInfo.id]);
      OauthInfo = {
        ...OauthInfo,
        github_id: OauthInfo.id,
        github_created_at: OauthInfo.created_at,
        github_updated_at: OauthInfo.updated_at,
      };
      delete OauthInfo.id;
      delete OauthInfo.created_at;
      delete OauthInfo.updated_at;
      if (!isExist) {
        await githubUserService.create({
          ...OauthInfo,
          client_id: github_client_id,
        });
        const userInfo: any = await userService.create({
          username: OauthInfo.name || OauthInfo.login,
          password: '123456abc',
          avatar: OauthInfo.avatar_url,
          title: OauthInfo.bio,
        });
        await thirdUserModel.create({
          user_id: userInfo?.id,
          third_user_id: OauthInfo.github_id,
          third_platform: 3,
        });
        const token = signJwt({
          userInfo: {
            ...JSON.parse(JSON.stringify(userInfo)),
            github_users: undefined,
          },
          exp: 24,
        });
        await userService.update({
          id: userInfo?.id,
          token,
        });
        ctx.cookies.set('token', token, { httpOnly: false });
        successHandler({ ctx, data: token, message: 'github登录成功!' });
      } else {
        await githubUserService.update({
          ...OauthInfo,
          client_id: OauthInfo.client_id,
        });
        const userInfo1: any = await thirdUserService.findUser({
          third_platform: 3,
          third_user_id: OauthInfo.github_id,
        });
        const userInfo: any = await userService.find(userInfo1.user_id);
        const token = signJwt({
          userInfo: {
            ...JSON.parse(JSON.stringify(userInfo)),
            github_users: undefined,
          },
          exp: 24,
        });
        await userService.update({
          id: userInfo?.id,
          token,
        });
        ctx.cookies.set('token', token, { httpOnly: false });
        successHandler({ ctx, data: token, message: 'github登录成功!' });
      }
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */
    await next();
  };

  async list(ctx: Context, next) {
    try {
      // @ts-ignore
      const {
        nickname,
        gender,
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
        created_at,
        updated_at,
      }: IQqUserList = ctx.request.query;
      const result = await githubUserService.getList({
        nickname,
        gender,
        nowPage,
        pageSize,
        orderBy,
        orderName,
        created_at,
        updated_at,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async find(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const result = await githubUserService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: Context, next) {
    try {
      const {
        client_id,
        openid,
        unionid,
        nickname,
        figureurl_qq,
        constellation,
        gender,
        city,
        province,
        year,
      }: IQqUser = ctx.request.body;
      const result = await githubUserService.update({
        client_id,
        openid,
        unionid,
        nickname,
        figureurl_qq,
        constellation,
        gender,
        city,
        province,
        year,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await githubUserService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的github用户!` });
        return;
      }
      const result = await githubUserService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}
export default new GithubUserController();
