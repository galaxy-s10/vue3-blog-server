import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { IFrontend } from '@/interface';
import { CustomError } from '@/model/customError.model';
import frontendService from '@/service/frontend.service';

class FrontendController {
  async getDetail(ctx: ParameterizedContext, next) {
    const result = await frontendService.find(1);
    successHandler({ ctx, data: result });
    await next();
  }

  async getDetail1(ctx: ParameterizedContext, next) {
    successHandler({ ctx, data: 111 });
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError('权限不足！', 403, 403);
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
    await next();
  }
}

export default new FrontendController();
