import { Context } from 'koa';
import Joi from 'joi';
import emitError from '@/app/handler/emit-error';

const schema = Joi.object({
  name: Joi.string().min(1).max(30),
  cover_pic: Joi.string().min(3).max(80),
  author: Joi.string().min(1).max(30),
  audio_url: Joi.string().min(3).max(30),
  status: Joi.string().min(3).max(30),
});

export const verifyProp = async (ctx: Context, next) => {
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
