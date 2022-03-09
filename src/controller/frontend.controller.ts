import { Context } from 'koa';

import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import { IFrontend } from '@/interface';
import frontendService from '@/service/frontend.service';

class FrontendController {
  async getDetail(ctx: Context, next) {
    try {
      const result = await frontendService.find(1);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async getDetail1(ctx: Context, next) {
    try {
      successHandler({ ctx, data: 111 });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const {
        frontend_about,
        frontend_comment,
        frontend_link,
        frontend_login,
        frontend_register,
        frontend_qq_login,
        frontend_github_login,
      }: IFrontend = ctx.request.body;
      const result = await frontendService.update({
        id,
        frontend_about,
        frontend_comment,
        frontend_link,
        frontend_login,
        frontend_register,
        frontend_qq_login,
        frontend_github_login,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new FrontendController();
