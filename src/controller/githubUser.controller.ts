import { ParameterizedContext } from 'koa';

import { authJwt, signJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import {
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_REDIRECT_URI,
} from '@/config/secret';
import { ALLOW_HTTP_CODE, THIRD_PLATFORM } from '@/constant';
import { IGithubUser, IList } from '@/interface';
import { CustomError } from '@/model/customError.model';
import thirdUserModel from '@/model/thirdUser.model';
import githubUserService from '@/service/githubUser.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';
import { getRandomString } from '@/utils';
import axios from '@/utils/request';

class GithubUserController {
  async create(ctx: ParameterizedContext, next) {
    const githubProps: IGithubUser = ctx.request.body;
    const result = await githubUserService.create(githubProps);
    successHandler({ ctx, data: result });
    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没影响，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */

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
  async getMeOauth({ access_token }: { access_token: string }) {
    const OauthInfo: any = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `token ${access_token}` },
    });
    return OauthInfo;
  }

  /**
   * 绑定github
   * 1，如果已经绑定过github，则不能绑定，只能先解绑了再绑定
   * 2，如果要绑定的github已经被别人绑定了，则不能绑定
   */
  bindGithub = async (ctx: ParameterizedContext, next) => {
    const { code } = ctx.request.body; // 注意此code会在10分钟内过期。
    const { code: authCode, userInfo, message } = await authJwt(ctx);
    if (authCode !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, authCode, authCode);
    }
    const result: any = await thirdUserService.findByUserId(userInfo!.id!);
    const ownIsBind = result.filter(
      (v) => v.third_platform === THIRD_PLATFORM.github
    );
    if (ownIsBind.length) {
      throw new CustomError(
        '你已经绑定过github，请先解绑原github！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
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
      throw new CustomError(
        '该github账号已被其他人绑定了！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const githubUser: any = await githubUserService.create({
      ...OauthInfo,
      client_id: GITHUB_CLIENT_ID,
    });
    await thirdUserModel.create({
      user_id: userInfo!.id,
      third_user_id: githubUser.id,
      third_platform: THIRD_PLATFORM.github,
    });
    successHandler({ ctx, message: '绑定github成功！' });

    await next();
  };

  /**
   * 取消绑定github
   */
  cancelBindGithub = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    const result: any[] = await thirdUserService.findByUserId(userInfo!.id!);
    const ownIsBind = result.filter(
      (v) => v.third_platform === THIRD_PLATFORM.github
    );
    if (!ownIsBind.length) {
      throw new CustomError(
        '你没有绑定过github，不能解绑！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await githubUserService.delete(ownIsBind[0].third_user_id);
    await thirdUserService.delete(ownIsBind[0].id);
    successHandler({ ctx, message: '解绑github成功！' });

    await next();
  };

  /**
   * github登录
   */
  login = async (ctx: ParameterizedContext, next) => {
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
        password: getRandomString(8),
        avatar: OauthInfo.avatar_url,
        desc: OauthInfo.bio,
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
          qq_users: undefined,
          email_users: undefined,
        },
        exp,
      });
      await userService.update({
        id: userInfo?.id,
        token,
      });
      ctx.cookies.set('token', token, { httpOnly: false });
      successHandler({ ctx, data: token, message: 'github登录成功！' });
    } else {
      await githubUserService.updateByGithubId(OauthInfo);
      const oldGithubUser: any = await githubUserService.findByGithubId(
        OauthInfo.github_id
      );
      const thirdUserInfo: any = await thirdUserService.findUser({
        third_platform: THIRD_PLATFORM.github,
        third_user_id: oldGithubUser.id,
      });
      const userInfo: any = await userService.findAccount(
        thirdUserInfo.user_id
      );
      const token = signJwt({
        userInfo: {
          ...JSON.parse(JSON.stringify(userInfo)),
          github_users: undefined,
          qq_users: undefined,
          email_users: undefined,
        },
        exp,
      });
      await userService.update({
        id: userInfo?.id,
        token,
      });
      ctx.cookies.set('token', token, { httpOnly: false });
      successHandler({ ctx, data: token, message: 'github登录成功！' });
    }

    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */
    await next();
  };

  async list(ctx: ParameterizedContext, next) {
    // @ts-ignore
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      created_at,
      updated_at,
    }: IList<IGithubUser> = ctx.request.query;
    const result = await githubUserService.getList({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      created_at,
      updated_at,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await githubUserService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const githubProps: IGithubUser = ctx.request.body;
    const result = await githubUserService.updateByGithubId(githubProps);
    successHandler({ ctx, data: result });

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await githubUserService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的github用户！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await githubUserService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}
export default new GithubUserController();
