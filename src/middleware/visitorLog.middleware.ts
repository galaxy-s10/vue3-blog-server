import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import { ALLOW_HTTP_CODE } from '@/constant';
import { CustomError } from '@/model/customError.model';

const schema = Joi.object({
  user_id: Joi.number(),
  ip: [Joi.string().min(1).max(200), '', null],
  ip_data: [Joi.string().min(1).max(200), '', null],
  page_url: [Joi.string().min(1).max(400), '', null],
  status: [1, 2],
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
