import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  try {
    await next();
  } catch (error) {
    emitError({ ctx, code: 400, error });
  }
};
