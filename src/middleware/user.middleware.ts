import { Context } from 'koa';
import Joi from 'joi';
import { emitError } from '@/app/handler/emit-error';

export const verifyProp = async (ctx: Context, next) => {
  const prop = ctx.request.body;
  try {
    console.log('joi验证通过');
    await next();
  } catch (error) {
    console.log('joi验证不通过', error);
    return emitError({
      ctx,
      code: 400,
      error,
      // error: error.message,
    });
  }
};
