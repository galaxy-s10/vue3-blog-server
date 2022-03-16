import Joi from 'joi';
import { Context } from 'koa';

import emitError from '@/app/handler/emit-error';

const schema = Joi.object({
  email: Joi.string().min(3).max(50),
  name: Joi.string().min(3).max(50).required(),
  avatar: Joi.string().min(5).max(80).required(),
  desc: Joi.string().min(3).max(50).required(),
  url: Joi.string().min(5).max(80).required(),
  status: [1, 2],
});

const verifyProp = async (ctx: Context, next) => {
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
