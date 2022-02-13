import { Context } from 'koa';
import Joi from 'joi';
import emitError from '@/app/handler/emit-error';

const schema = Joi.object({
  article_id: Joi.number(),
  tag_id: Joi.number(),
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
