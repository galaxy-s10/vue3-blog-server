import { ParameterizedContext } from 'koa';

import { signJwt } from '@/app/auth/authJwt';
import { THIRD_PLATFORM } from '@/app/constant';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import {
  WWW_QQ_CLIENT_ID,
  WWW_QQ_CLIENT_SECRET,
  WWW_QQ_REDIRECT_URI,
  ADMIN_QQ_CLIENT_ID,
  ADMIN_QQ_CLIENT_SECRET,
  ADMIN_QQ_REDIRECT_URI,
} from '@/config/secret';
import { IList, IQqUser } from '@/interface';
import thirdUserModel from '@/model/thirdUser.model';
import qqUserService from '@/service/qqUser.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';
import { randomString } from '@/utils';
import axios from '@/utils/request';

export interface IQqUserList extends IList {
  nickname: string;
  gender: string;
  created_at?: string;
  updated_at?: string;
}

class QqUserController {
  async create(ctx: ParameterizedContext, next) {
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
      return;
    }
    await next();
  }

  async getAccessToken(code, isAdmin: boolean) {
    // 注意此code会在10分钟内过期。
    const params: any = {};
    params.code = code;
    params.client_id = !isAdmin ? WWW_QQ_CLIENT_ID : ADMIN_QQ_CLIENT_ID;
    params.client_secret = !isAdmin
      ? WWW_QQ_CLIENT_SECRET
      : ADMIN_QQ_CLIENT_SECRET;
    params.redirect_uri = !isAdmin
      ? WWW_QQ_REDIRECT_URI
      : ADMIN_QQ_REDIRECT_URI;
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
    // const accessToken: any = await new Promise((resolve) => {
    //   request(
    //     {
    //       url: `https://graph.qq.com/oauth2.0/token`,
    //       method: 'GET',
    //       qs: {
    //         ...params,
    //       },
    //     },
    //     (error, response, body) => {
    //       resolve(JSON.parse(body));
    //     }
    //   );
    // });
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
    // const UserInfo: any = await new Promise((resolve) => {
    //   request(
    //     {
    //       url: `https://graph.qq.com/user/get_user_info`,
    //       method: 'GET',
    //       qs: {
    //         access_token,
    //         oauth_consumer_key,
    //         openid,
    //       },
    //     },
    //     (error, response, body) => {
    //       resolve(JSON.parse(body));
    //     }
    //   );
    // });
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
    // const OauthInfo: any = await new Promise((resolve) => {
    //   request(
    //     {
    //       url: `https://graph.qq.com/oauth2.0/me`,
    //       method: 'GET',
    //       qs: {
    //         access_token,
    //         unionid,
    //         fmt,
    //       },
    //     },
    //     (error, response, body) => {
    //       resolve(JSON.parse(body));
    //     }
    //   );
    // });
    return OauthInfo;
  }

  /**
   * qq登录逻辑：
   * 1，调用getAccessToken(code),拿到access_token
   * 2，根据access_token，调用getMeOauth()拿到openid和unionid
   * 3，判断qq_user表里面有没有存在相同的unionid，
   *  3.1，如果没有存在相同的unionid，即代表是首次登录，在qq_user表里面给他新增一条记录,并
   * 且默认给他新建并且绑定一个用户。
   *  3.2，存在相同的unionid代表已经在本站登录注册过了，
   *    3.2.1，判断有没有openid，qq表里面没用openid的话在qq_user表里面给他新增一条记录，并且绑定再到third_user里面绑定
   * 原本的用户，最好再更新一下该用户的token即可。
   */
  login = async (ctx: ParameterizedContext, next) => {
    try {
      const { code } = ctx.request.query; // 注意此code会在10分钟内过期。
      const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
      const accessToken = await this.getAccessToken(code, isAdmin);
      if (accessToken.error) throw new Error(JSON.stringify(accessToken));
      const OauthInfo: any = await this.getMeOauth({
        access_token: accessToken.access_token,
        unionid: 1,
        fmt: 'json',
      });
      const qqUserInfo: IQqUser = await this.getUserInfo({
        access_token: accessToken.access_token,
        oauth_consumer_key: OauthInfo.client_id, // oauth_consumer_key参数要求填appid，OauthInfo.client_id其实就是appid
        openid: OauthInfo.openid,
      });
      console.log('llllllll');
      if (qqUserInfo.ret < 0) throw new Error(JSON.stringify(qqUserInfo));
      // 先判断当前的应用是否存在这个qq用户
      const isExist = await qqUserService.isExistClientIdUnionid(
        isAdmin ? ADMIN_QQ_CLIENT_ID : WWW_QQ_CLIENT_ID,
        OauthInfo.unionid
      );
      console.log(isExist, 333);
      if (!isExist) {
        // 如果当前的应用不存在这个qq用户，再判断所有应用里面存不存在这个qq用户
        const isExist2 = await qqUserService.isExistUnionid(OauthInfo.unionid);
        // 如果所有应用里也不存在这个qq用户，则在qq表和user表都插入一条记录，并在third_user绑定
        if (!isExist2) {
          const createQqUserRes: any = await qqUserService.create({
            ...qqUserInfo,
            client_id: OauthInfo.client_id,
            unionid: OauthInfo.unionid,
            openid: OauthInfo.openid,
          });
          const createUserRes: any = await userService.create({
            username: `qq_${createQqUserRes.nickname}`,
            password: randomString(8),
            avatar: createQqUserRes.figureurl_2,
          });
          await thirdUserService.create({
            user_id: createUserRes?.id,
            third_user_id: createQqUserRes.id,
            third_platform: !isAdmin
              ? THIRD_PLATFORM.qq_www
              : THIRD_PLATFORM.qq_admin,
          });
          const token = signJwt({
            userInfo: {
              ...JSON.parse(JSON.stringify(createUserRes)),
              qq_users: undefined,
              password: undefined,
            },
            exp: 24,
          });
          await userService.update({
            id: createUserRes?.id,
            token,
          });
          ctx.cookies.set('token', token, { httpOnly: false });
          successHandler({ ctx, data: token, message: 'qq登录成功!' });
        } else {
          // qq_user表里面找这个用户原本绑定的qq用户
          const oldQqUser: any = await qqUserService.findByUnionid(
            OauthInfo.unionid
          );
          console.log('qq_user表里面找这个用户原本绑定的qq用户', oldQqUser);
          console.log('qq_user表里面找这个用户原本绑定的qq用户', oldQqUser.id);
          // third_user里面找这个用户原本绑定的user表里的用户
          const oldThirdUser: any = await thirdUserService.findUser({
            third_user_id: oldQqUser.id,
            third_platform: isAdmin
              ? THIRD_PLATFORM.qq_www
              : THIRD_PLATFORM.qq_admin, // 如果当前是admin接口，则代表这个用户是在www接口绑定过。
          });
          // 如果在所有应用里面，存在这个qq用户，则代表third_user里面肯定有他的记录
          // 因为当前应用没有该qq用户（只是所有应用里面有它而已），所以先在qq表插入记录
          const createQqUserRes: any = await qqUserService.create({
            ...qqUserInfo,
            client_id: OauthInfo.client_id,
            unionid: OauthInfo.unionid,
            openid: OauthInfo.openid,
          });
          console.log('third_user里面新建', createQqUserRes.id);
          // third_user里面新建
          await thirdUserService.create({
            user_id: oldThirdUser?.user_id,
            third_user_id: createQqUserRes.id,
            third_platform: !isAdmin
              ? THIRD_PLATFORM.qq_www
              : THIRD_PLATFORM.qq_admin,
          });
          const userInfo: any = await userService.find(oldThirdUser.user_id);

          const token = signJwt({
            userInfo: {
              ...JSON.parse(JSON.stringify(userInfo)),
              qq_users: undefined,
              password: undefined,
            },
            exp: 24,
          });
          await userService.update({
            id: userInfo.id,
            token,
          });
          ctx.cookies.set('token', token, { httpOnly: false });
          successHandler({ ctx, data: token, message: 'qq登录成功!' });
        }
      } else {
        // 如果当前的应用存在这个qq用户
        await qqUserService.update({
          ...qqUserInfo,
          client_id: OauthInfo.client_id,
          unionid: OauthInfo.unionid,
          openid: OauthInfo.openid,
        });
        const oldQqUser: any = await qqUserService.findByUnionid(
          OauthInfo.unionid
        );
        console.log(oldQqUser.id, 3333);
        const thirdUserInfo: any = await thirdUserService.findUserByThirdUserId(
          oldQqUser.id
        );
        console.log(thirdUserInfo, 777);
        const userInfo: any = await userService.find(thirdUserInfo.user_id);
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
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const result = await qqUserService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
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
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await qqUserService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的qq用户!` });
        return;
      }
      const result = await qqUserService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  }
}
export default new QqUserController();
