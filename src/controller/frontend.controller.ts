import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IFrontend } from '@/interface';
import frontendService from '@/service/frontend.service';

class FrontendController {
  async getDetail(ctx: ParameterizedContext, next) {
    try {
      const result = await frontendService.find(1);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getDetail1(ctx: ParameterizedContext, next) {
    try {
      successHandler({ ctx, data: 111 });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    try {
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      const id = +ctx.params.id;
      const {
        frontend_about,
        frontend_comment,
        frontend_link,
        frontend_qq_login,
        frontend_github_login,
        frontend_email_login,
        frontend_dialog,
        frontend_dialog_content,
      }: IFrontend = ctx.request.body;
      console.log(
        id,
        frontend_about,
        frontend_comment,
        frontend_link,
        frontend_qq_login,
        frontend_github_login,
        frontend_email_login,
        frontend_dialog,
        frontend_dialog_content,
        1111
      );
      await frontendService.update({
        id,
        frontend_about,
        frontend_comment,
        frontend_link,
        frontend_qq_login,
        frontend_github_login,
        frontend_email_login,
        frontend_dialog,
        frontend_dialog_content,
      });
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new FrontendController();
