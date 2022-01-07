import { Context } from 'koa';
import Joi from 'joi';
import { emitError } from '../utils';

export const verifyProp = async (ctx: Context, next) => {
  const prop = ctx.request.body;
  try {
    console.log('joi验证通过');
    next();
  } catch (error) {
    // console.log('joi验证不通过', error); // "isComment" must be one of [1, 2]. "status" must be one of [1, 2]
    return emitError({
      ctx,
      code: 400,
      error,
      // error: error.message,
    });
  }
};
