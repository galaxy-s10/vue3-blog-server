import { ParameterizedContext } from 'koa';

import { authJwt, signJwt } from '@/app/auth/authJwt';
import successHandler from '@/app/handler/success-handle';
import {
  ADMIN_QQ_CLIENT_ID,
  ADMIN_QQ_CLIENT_SECRET,
  ADMIN_QQ_REDIRECT_URI,
} from '@/config/secret';
import { ALLOW_HTTP_CODE, THIRD_PLATFORM } from '@/constant';
import { IList, IQqUser } from '@/interface';
import { CustomError } from '@/model/customError.model';
import thirdUserModel from '@/model/thirdUser.model';
import qqUserService from '@/service/qqUser.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';
import { getRandomString } from '@/utils';
import axios from '@/utils/request';

class QqUserController {
  async create(ctx: ParameterizedContext, next) {
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

    await next();
  }

  async getAccessToken(code) {
    // 注意此code会在10分钟内过期。
    const params: any = {};
    params.code = code;
    params.client_id = ADMIN_QQ_CLIENT_ID;
    params.client_secret = ADMIN_QQ_CLIENT_SECRET;
    params.redirect_uri = ADMIN_QQ_REDIRECT_URI;
    params.grant_type = 'authorization_code';
    params.fmt = 'json';
    // https://wiki.connect.qq.com/%E4%BD%BF%E7%94%A8authorization_code%E8%8E%B7%E5%8F%96access_token
    const accessToken: any = await axios.get(
      'https://graph.qq.com/oauth2.0/token',
      {
        headers: { Accept: 'application/json' },
        params: { ...params },
      }
    );
    return accessToken;
  }

  /**
   * https://wiki.connect.qq.com/get_user_info
   * ret	返回码
   * msg	如果ret<0，会有相应的错误信息提示，返回数据全部用UTF-8编码。
   * nickname	用户在QQ空间的昵称。
   * figureurl	大小为30×30像素的QQ空间头像URL。
   * figureurl_1	大小为50×50像素的QQ空间头像URL。
   * figureurl_2	大小为100×100像素的QQ空间头像URL。
   * figureurl_qq_1	大小为40×40像素的QQ头像URL。
   * figureurl_qq_2	大小为100×100像素的QQ头像URL。需要注意，不是所有的用户都拥有QQ的100x100的头像，但40x40像素则是一定会有。
   * gender	性别。 如果获取不到则默认返回"男"
   */
  async getUserInfo({ access_token, oauth_consumer_key, openid }) {
    const UserInfo: any = await axios.get(
      'https://graph.qq.com/user/get_user_info',
      {
        headers: { Accept: 'application/json' },
        params: { access_token, oauth_consumer_key, openid },
      }
    );
    return UserInfo;
  }

  /**
   * 获取用户OpenID_OAuth2.0，即获取openid和unionid
   * 此接口用于获取个人信息。开发者可通过openID来获取用户的基本信息。
   * 特别需要注意的是，如果开发者拥有多个移动应用、网站应用，
   * 可通过获取用户的unionID来区分用户的唯一性，
   * 因为只要是同一QQ互联平台下的不同应用，unionID是相同的。
   * 换句话说，同一用户，对同一个QQ互联平台下的不同应用，unionID是相同的。
   * https://wiki.connect.qq.com/%e8%8e%b7%e5%8f%96%e7%94%a8%e6%88%b7openid_oauth2-0
   * https://wiki.connect.qq.com/unionid%e4%bb%8b%e7%bb%8d
   */
  async getMeOauth({ access_token, unionid, fmt }) {
    const OauthInfo: any = await axios.get('https://graph.qq.com/oauth2.0/me', {
      headers: { Accept: 'application/json' },
      params: { access_token, unionid, fmt },
    });
    return OauthInfo;
  }

  login = async (ctx: ParameterizedContext, next) => {
    const { code } = ctx.request.body; // 注意此code会在10分钟内过期。
    const exp = 24; // token过期时间：24小时
    const accessToken = await this.getAccessToken(code);
    if (accessToken.error) throw new Error(JSON.stringify(accessToken));
    const OauthInfo: any = await this.getMeOauth({
      access_token: accessToken.access_token,
      unionid: 1,
      fmt: 'json',
    });
    const getUserInfoRes: IQqUser = await this.getUserInfo({
      access_token: accessToken.access_token,
      oauth_consumer_key: OauthInfo.client_id, // oauth_consumer_key参数要求填appid，OauthInfo.client_id其实就是appid
      openid: OauthInfo.openid,
    });
    const qqUserInfo = {
      ...getUserInfoRes,
      client_id: OauthInfo.client_id,
      unionid: OauthInfo.unionid,
      openid: OauthInfo.openid,
    };
    const isExist = await qqUserService.isExistUnionid(OauthInfo.unionid);
    if (!isExist) {
      const qqUser: any = await qqUserService.create(qqUserInfo);
      const userInfo: any = await userService.create({
        username: qqUserInfo.nickname,
        password: getRandomString(8),
        avatar: qqUserInfo.figureurl_2,
      });
      await thirdUserModel.create({
        user_id: userInfo?.id,
        third_user_id: qqUser.id,
        third_platform: THIRD_PLATFORM.qq_admin,
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
      successHandler({ ctx, data: token, message: 'qq登录成功！' });
    } else {
      await qqUserService.update(qqUserInfo);
      const oldQqUser: any = await qqUserService.findByUnionid(
        OauthInfo.unionid
      );
      const thirdUserInfo: any = await thirdUserService.findUser({
        third_platform: THIRD_PLATFORM.qq_admin,
        third_user_id: oldQqUser.id,
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
      successHandler({ ctx, data: token, message: 'qq登录成功！' });
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
      nickname,
      gender,
      created_at,
      updated_at,
    }: IList<IQqUser> = ctx.request.query;
    const result = await qqUserService.getList({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      nickname,
      gender,
      created_at,
      updated_at,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  /**
   * 绑定github
   * 1，如果已经绑定过github，则不能绑定，只能先解绑了再绑定
   * 2，如果要绑定的github已经被别人绑定了，则不能绑定
   */
  bindQQ = async (ctx: ParameterizedContext, next) => {
    const { code } = ctx.request.body; // 注意此code会在10分钟内过期。

    const { code: authCode, userInfo, message } = await authJwt(ctx);
    if (authCode !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, authCode, authCode);
    }
    const result: any = await thirdUserService.findByUserId(userInfo!.id!);
    const ownIsBind = result.filter(
      (v) => v.third_platform === THIRD_PLATFORM.qq_admin
    );
    if (ownIsBind.length) {
      throw new CustomError(
        `你已经绑定过qq，请先解绑原qq！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const accessToken = await this.getAccessToken(code);
    if (accessToken.error) throw new Error(JSON.stringify(accessToken));
    const OauthInfo: any = await this.getMeOauth({
      access_token: accessToken.access_token,
      unionid: 1,
      fmt: 'json',
    });
    const getUserInfoRes: IQqUser = await this.getUserInfo({
      access_token: accessToken.access_token,
      oauth_consumer_key: OauthInfo.client_id, // oauth_consumer_key参数要求填appid，OauthInfo.client_id其实就是appid
      openid: OauthInfo.openid,
    });
    const qqUserInfo = {
      ...getUserInfoRes,
      client_id: OauthInfo.client_id,
      unionid: OauthInfo.unionid,
      openid: OauthInfo.openid,
    };
    const isExist = await qqUserService.isExistClientIdUnionid(
      OauthInfo.client_id,
      OauthInfo.unionid
    );
    if (isExist) {
      throw new CustomError(
        `该qq账号已被其他人绑定了！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const qqUser: any = await qqUserService.create(qqUserInfo);
    await thirdUserModel.create({
      user_id: userInfo?.id,
      third_user_id: qqUser.id,
      third_platform: THIRD_PLATFORM.qq_admin,
    });
    successHandler({ ctx, message: '绑定qq成功！' });

    await next();
  };

  /**
   * 取消绑定github
   */
  cancelBindQQ = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    const result: any[] = await thirdUserService.findByUserId(userInfo!.id!);
    const ownIsBind = result.filter(
      (v) => v.third_platform === THIRD_PLATFORM.qq_admin
    );
    if (!ownIsBind.length) {
      throw new CustomError(
        '你没有绑定过qq，不能解绑',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    await qqUserService.delete(ownIsBind[0].third_user_id);
    await thirdUserService.delete(ownIsBind[0].id);
    successHandler({ ctx, message: '解绑qq成功！' });
    await next();
  };

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await qqUserService.find(id);
    successHandler({ ctx, data: result });
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
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
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const isExist = await qqUserService.isExist([id]);
    if (!isExist) {
      throw new CustomError(
        `不存在id为${id}的qq用户！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const result = await qqUserService.delete(id);
    successHandler({ ctx, data: result });

    await next();
  }
}
export default new QqUserController();
