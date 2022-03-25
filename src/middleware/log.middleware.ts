import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';

const schema = Joi.object({
  user_id: Joi.number(),
  api_user_agent: Joi.string(),
  api_from: Joi.number(),
  api_ip: Joi.string(),
  api_hostname: Joi.string(),
  api_method: Joi.string(),
  api_path: Joi.string(),
  api_query: Joi.string(),
  api_body: Joi.string(),
});

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  const props = ctx.request.body;
  try {
    await schema.validateAsync(props, {
      abortEarly: false,
      allowUnknown: false,
      convert: false,
    });
    await next();
  } catch (error) {
    emitError({ ctx, code: 400, error });
  }
};
