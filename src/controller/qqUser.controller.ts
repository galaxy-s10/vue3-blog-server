import { Context } from 'koa';
import request from 'request';

import { signJwt } from '@/app/authJwt';
import emitError from '@/app/handler/emit-error';
import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import {
  qq_client_id,
  qq_client_secret,
  qq_redirect_uri,
} from '@/config/secret';
import { IList, IQqUser } from '@/interface';
import thirdUserModel from '@/model/thirdUser.model';
import qqUserService from '@/service/qqUser.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';

export interface IQqUserList extends IList {
  nickname: string;
  gender: string;
  created_at?: string;
  updated_at?: string;
}
class QqUserController {
  async create(ctx: Context, next) {
    try {
      const {
        client_id,
        openid,
        unionid,
        nickname,
        figureurl,
        figureurl_1,
        figureurl_2,
        figureurl_qq_1,
        figureurl_qq_2,
        constellation,
        gender,
        city,
        province,
        year,
      }: IQqUser = ctx.request.body;
      const result = await qqUserService.create({
        client_id,
        openid,
        unionid,
        nickname,
        figureurl,
        figureurl_1,
        figureurl_2,
        figureurl_qq_1,
        figureurl_qq_2,
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
    // 注意此code会在10分钟内过期。
    const params: any = {};
    params.code = code;
    params.client_id = qq_client_id;
    params.client_secret = qq_client_secret;
    params.redirect_uri = qq_redirect_uri;
    params.grant_type = 'authorization_code';
    params.fmt = 'json';
    // https://wiki.connect.qq.com/%E4%BD%BF%E7%94%A8authorization_code%E8%8E%B7%E5%8F%96access_token
    const accessToken: any = await new Promise((resolve) => {
      request(
        {
          url: `https://graph.qq.com/oauth2.0/token`,
          method: 'GET',
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
   * https://wiki.connect.qq.com/get_user_info
   */
  async getUserInfo({ access_token, oauth_consumer_key, openid }) {
    const UserInfo: any = await new Promise((resolve) => {
      request(
        {
          url: `https://graph.qq.com/user/get_user_info`,
          method: 'GET',
          qs: {
            access_token,
            oauth_consumer_key,
            openid,
          },
        },
        (error, response, body) => {
          resolve(JSON.parse(body));
        }
      );
    });
    return UserInfo;
  }

  /**
   * 获取用户OpenID_OAuth2.0，即获取openid和unionid
   * https://wiki.connect.qq.com/%e8%8e%b7%e5%8f%96%e7%94%a8%e6%88%b7openid_oauth2-0
   * https://wiki.connect.qq.com/unionid%e4%bb%8b%e7%bb%8d
   */
  async getMeOauth({ access_token, unionid, fmt }) {
    const OauthInfo: any = await new Promise((resolve) => {
      request(
        {
          url: `https://graph.qq.com/oauth2.0/me`,
          method: 'GET',
          qs: {
            access_token,
            unionid,
            fmt,
          },
        },
        (error, response, body) => {
          resolve(JSON.parse(body));
        }
      );
    });
    return OauthInfo;
  }

  /**
   * qq登录逻辑：
   * 1，调用getAccessToken(code),拿到access_token
   * 2，根据access_token，调用getMeOauth()拿到openid和unionid
   * 3，判断qq_user表里面有没有存在相同的unionid，
   *  3.1，如果没有存在相同的unionid，即代表是首次登录，在qq_user表里面给他新增一条记录,并
   * 且默认给他新建并且绑定一个用户。
   *  3.2，存在相同的unionid代表已经在本站登录注册过了，直接通过third_user表找到对应的user表的
   * 用户，更新一下该用户的token即可。
   */
  login = async (ctx: Context, next) => {
    try {
      const { code } = ctx.request.query; // 注意此code会在10分钟内过期。
      const accessToken = await this.getAccessToken(code);
      if (accessToken.error) throw new Error(JSON.stringify(accessToken));
      const OauthInfo: any = await this.getMeOauth({
        access_token: accessToken.access_token,
        unionid: 1,
        fmt: 'json',
      });
      console.log(OauthInfo, 'Oauth222Info');
      const isExist = await qqUserService.isExist([OauthInfo.unionid]);
      const qqUserInfo: IQqUser = await this.getUserInfo({
        access_token: accessToken.access_token,
        oauth_consumer_key: OauthInfo.client_id, // oauth_consumer_key参数要求填appid，OauthInfo.client_id其实就是appid
        openid: OauthInfo.openid,
      });
      if (qqUserInfo.ret < 0) throw new Error(JSON.stringify(qqUserInfo));
      console.log(qqUserInfo, 'qqUserInfo');
      if (!isExist) {
        await qqUserService.create({
          ...qqUserInfo,
          client_id: OauthInfo.client_id,
          unionid: OauthInfo.unionid,
          openid: OauthInfo.openid,
        });
        const userInfo: any = await userService.create({
          username: qqUserInfo.nickname,
          password: '123456abc',
          avatar: qqUserInfo.figureurl_2,
        });
        await thirdUserModel.create({
          user_id: userInfo?.id,
          third_user_id: OauthInfo.unionid,
          third_platform: 2,
        });
        const token = signJwt({
          userInfo: {
            ...JSON.parse(JSON.stringify(userInfo)),
            qq_users: undefined,
          },
          exp: 24,
        });
        await userService.update({
          id: userInfo?.id,
          token,
        });
        ctx.cookies.set('token', token, { httpOnly: false });
        successHandler({ ctx, data: token, message: 'qq登录成功!' });
      } else {
        await qqUserService.update({
          ...qqUserInfo,
          client_id: OauthInfo.client_id,
          unionid: OauthInfo.unionid,
          openid: OauthInfo.openid,
        });
        const userInfo1: any = await thirdUserService.findUser({
          third_platform: 2,
          third_user_id: OauthInfo.unionid,
        });
        const userInfo: any = await userService.find(userInfo1.user_id);
        const token = signJwt({
          userInfo: {
            ...JSON.parse(JSON.stringify(userInfo)),
            qq_users: undefined,
          },
          exp: 24,
        });
        await userService.update({
          id: userInfo?.id,
          token,
        });
        ctx.cookies.set('token', token, { httpOnly: false });
        successHandler({ ctx, data: token, message: 'qq登录成功!' });
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
      const result = await qqUserService.getList({
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
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async find(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const result = await qqUserService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
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
        figureurl,
        figureurl_1,
        figureurl_2,
        figureurl_qq_1,
        figureurl_qq_2,
        constellation,
        gender,
        city,
        province,
        year,
      }: IQqUser = ctx.request.body;
      const result = await qqUserService.update({
        client_id,
        openid,
        unionid,
        nickname,
        figureurl,
        figureurl_1,
        figureurl_2,
        figureurl_qq_1,
        figureurl_qq_2,
        constellation,
        gender,
        city,
        province,
        year,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await qqUserService.isExist([id]);
      if (!isExist) {
        errorHandler({ ctx, code: 400, error: `不存在id为${id}的qq用户!` });
        return;
      }
      const result = await qqUserService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}
export default new QqUserController();
