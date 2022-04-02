import { ParameterizedContext } from 'koa';

import redisController from './redis.controller';

import { authJwt, signJwt } from '@/app/auth/authJwt';
import { chalkINFO } from '@/app/chalkTip';
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
import axios from '@/utils/request';

export interface IGithubUserList extends IList {
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
    const accessToken: any = await axios.get(
      'https://github.com/login/oauth/access_token',
      {
        headers: { Accept: 'application/json' },
        params: { ...params },
      }
    );
    return accessToken;
  }

  /** https://docs.github.com/cn/rest/reference/users#get-the-authenticated-user */
  async getMeOauth({ access_token }) {
    const OauthInfo: any = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}` },
    });
    console.log('OauthInfoOauthInfo', access_token, OauthInfo);
    return OauthInfo;
  }

  /**
   * 绑定github
   * 1，如果已经绑定过github，则不能绑定，只能先解绑了再绑定
   * 2，如果要绑定的github已经被别人绑定了，则不能绑定
   */
  bindGithub = async (ctx: ParameterizedContext, next) => {
    const { code } = ctx.request.body; // 注意此code会在10分钟内过期。
    try {
      const { userInfo } = await authJwt(ctx.request);
      const result: any = await thirdUserService.findByUserId(userInfo.id);
      const ownIsBind = result.filter(
        (v) => v.third_platform === THIRD_PLATFORM.github
      );
      if (ownIsBind.length) {
        emitError({
          ctx,
          code: 401,
          message: '你已经绑定过github，请先解绑原github!',
        });
        return;
      }
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
      if (isExist) {
        emitError({
          ctx,
          code: 401,
          message: '该github账号已被其他人绑定了!',
        });
        return;
      }
      const githubUser: any = await githubUserService.create({
        ...OauthInfo,
        client_id: GITHUB_CLIENT_ID,
      });
      await thirdUserModel.create({
        user_id: userInfo.id,
        third_user_id: githubUser.id,
        third_platform: THIRD_PLATFORM.github,
      });
      console.log(userInfo, ownIsBind, 3333333);
      successHandler({ ctx, message: '绑定github成功!' });
    } catch (error) {
      console.log(error, 333133);
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };

  /**
   * 取消绑定github
   */
  cancelBindGithub = async (ctx: ParameterizedContext, next) => {
    try {
      const { userInfo } = await authJwt(ctx.request);
      const result: any[] = await thirdUserService.findByUserId(userInfo.id);
      const ownIsBind = result.filter(
        (v) => v.third_platform === THIRD_PLATFORM.github
      );
      if (!ownIsBind.length) {
        emitError({
          ctx,
          code: 400,
          message: '你没有绑定过github，不能解绑!',
        });
        return;
      }
      await githubUserService.delete(ownIsBind[0].third_user_id);
      await thirdUserService.delete(ownIsBind[0].id);
      successHandler({ ctx, message: '解绑github成功!' });
    } catch (error) {
      console.log(error, 333133);
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };

  /**
   * github登录
   */
  login = async (ctx: ParameterizedContext, next) => {
    try {
      const { code } = ctx.request.body; // 注意此code会在10分钟内过期。
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
          username: OauthInfo.login,
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
        await githubUserService.updateByGithubId(OauthInfo);
        const oldGithubUser: any = await githubUserService.findByGithubId(
          OauthInfo.github_id
        );
        const thirdUserInfo: any = await thirdUserService.findUser({
          third_platform: THIRD_PLATFORM.github,
          third_user_id: oldGithubUser.id,
        });
        console.log(thirdUserInfo, 777);
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
      emitError({ ctx, code: 400, error, message: error.message });
      return;
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
      }: IGithubUserList = ctx.request.query;
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
      const result = await githubUserService.updateByGithubId(githubProps);
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
