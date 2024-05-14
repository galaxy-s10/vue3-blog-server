import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import { ALLOW_HTTP_CODE } from '@/constant';
import { CustomError } from '@/model/customError.model';

const schema = Joi.object({
  id: Joi.number(),
  email: Joi.string().min(2).max(100),
  name: Joi.string().min(2).max(100),
  avatar: Joi.string().min(2).max(300),
  desc: Joi.string().min(2).max(100),
  url: Joi.string().min(2).max(300),
  status: [1, 2],
  priority: [Joi.number(), null],
});

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  try {
    const props = ctx.request.body;
    await schema.validateAsync(props, {
      abortEarly: false,
      allowUnknown: false,
      convert: false,
    });
    await next();
  } catch (error: any) {
    throw new CustomError(
      error.message,
      ALLOW_HTTP_CODE.paramsError,
      ALLOW_HTTP_CODE.paramsError
    );
  }
};
