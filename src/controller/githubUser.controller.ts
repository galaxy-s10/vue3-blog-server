import { ParameterizedContext } from 'koa';
import request from 'request';

import redisController from './redis.controller';

import { authJwt, signJwt } from '@/app/auth/authJwt';
import {
  REDIS_PREFIX,
  THIRD_PLATFORM,
  VERIFY_EMAIL_RESULT_CODE,
} from '@/app/constant';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_REDIRECT_URI,
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
    params.client_id = GITHUB_CLIENT_ID;
    params.client_secret = GITHUB_CLIENT_SECRET;
    params.redirect_uri = GITHUB_REDIRECT_URI;
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

  /** https://docs.github.com/cn/rest/reference/users#get-the-authenticated-user */
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

  userBindGithub = async (ctx: ParameterizedContext, next) => {
    try {
      const { email, code } = ctx.request.body;
      const { userInfo } = await authJwt(ctx.request);
      const result: any[] = await thirdUserService.findByUserId(userInfo.id);
      const ownIsBind = result.filter(
        (v) => v.third_platform === THIRD_PLATFORM.email
      );
      if (ownIsBind.length) {
        emitError({
          ctx,
          code: 401,
          message: '你已经绑定过邮箱，请先解绑原邮箱!',
        });
        return;
      }
      const otherIsBind = await githubUserService.findByGithubId(email);
      if (otherIsBind) {
        emitError({
          ctx,
          code: 401,
          message: '该邮箱已被其他人绑定!',
        });
        return;
      }
      const key = {
        prefix: REDIS_PREFIX.userBindEmail,
        key: email,
      };
      const redisData = await redisController.getVal({
        ...key,
      });
      if (redisData !== code || !redisData) {
        emitError({
          ctx,
          code: 401,
          message: VERIFY_EMAIL_RESULT_CODE.err,
        });
        return;
      }
      const createEmailRes: any = await githubUserService.create({ email });
      await thirdUserService.create({
        user_id: userInfo.id,
        third_platform: THIRD_PLATFORM.email,
        third_user_id: createEmailRes.id,
      });
      successHandler({ ctx, message: '绑定邮箱成功!' });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };

  login = async (ctx: ParameterizedContext, next) => {
    try {
      const { code } = ctx.request.query; // 注意此code会在10分钟内过期。
      const exp = 24; // token过期时间：24小时
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
        const githubUser: any = await githubUserService.create({
          ...OauthInfo,
          client_id: GITHUB_CLIENT_ID,
        });
        const userInfo: any = await userService.create({
          username: OauthInfo.name || OauthInfo.login,
          password: randomString(8),
          avatar: OauthInfo.avatar_url,
          title: OauthInfo.bio,
        });
        await thirdUserModel.create({
          user_id: userInfo?.id,
          third_user_id: githubUser.id,
          third_platform: THIRD_PLATFORM.github,
        });
        const token = signJwt({
          userInfo: {
            ...JSON.parse(JSON.stringify(userInfo)),
            github_users: undefined,
          },
          exp,
        });
        await userService.update({
          id: userInfo?.id,
          token,
        });
        ctx.cookies.set('token', token, { httpOnly: false });
        successHandler({ ctx, data: token, message: 'github登录成功!' });
      } else {
        await githubUserService.update(OauthInfo);
        const thirdUserInfo: any = await thirdUserService.findUser({
          third_platform: THIRD_PLATFORM.github,
          third_user_id: OauthInfo.github_id,
        });
        const userInfo: any = await userService.find(thirdUserInfo.user_id);
        const token = signJwt({
          userInfo: {
            ...JSON.parse(JSON.stringify(userInfo)),
            github_users: undefined,
          },
          exp,
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
