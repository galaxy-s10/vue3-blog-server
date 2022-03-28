import Joi from 'joi';
import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';

const schema = Joi.object({
  email: Joi.string().pattern(
    /^[A-Za-z0-9\u4E00-\u9FA5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
  ),
});

const verifyProp = async (ctx: ParameterizedContext, next) => {
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

export { verifyProp };
