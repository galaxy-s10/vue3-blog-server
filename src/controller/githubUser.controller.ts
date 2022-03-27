import { ParameterizedContext } from 'koa';
import request from 'request';

import { signJwt } from '@/app/authJwt';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import {
  github_client_id,
  github_client_secret,
  github_redirect_uri,
} from '@/config/secret';
import { IList, IGithubUser } from '@/interface';
import thirdUserModel from '@/model/thirdUser.model';
import githubUserService from '@/service/githubUser.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';
import { randomString } from '@/utils';

export interface IQqUserList extends IList {
  nickname: string;
  gender: string;
  created_at?: string;
  updated_at?: string;
}
class GithubUserController {
  async create(ctx: ParameterizedContext, next) {
    try {
      const githubProps: IGithubUser = ctx.request.body;
      const result = await githubUserService.create(githubProps);
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

  login = async (ctx: ParameterizedContext, next) => {
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
          password: randomString(8),
          avatar: OauthInfo.avatar_url,
          title: OauthInfo.bio,
        });
        await thirdUserModel.create({
          user_id: userInfo?.id,
          third_user_id: OauthInfo.github_id,
          third_platform: 4,
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
          third_platform: 4,
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

  async list(ctx: ParameterizedContext, next) {
    try {
      // @ts-ignore
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
        created_at,
        updated_at,
      }: IQqUserList = ctx.request.query;
      const result = await githubUserService.getList({
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

  async find(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const result = await githubUserService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    try {
      const githubProps: IGithubUser = ctx.request.body;
      const result = await githubUserService.update(githubProps);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
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
