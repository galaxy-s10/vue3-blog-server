import { Context } from 'koa';
import Joi from 'joi';
import emitError from '@/app/handler/emit-error';

export const verifyProp = async (ctx: Context, next) => {
  try {
    await next();
  } catch (error) {
    emitError({ ctx, code: 400, error });
  }
};
