import Joi from 'joi';
import { Context } from 'koa';

import emitError from '@/app/handler/emit-error';

const schema = Joi.object({
  article_id: Joi.number(),
  parent_comment_id: Joi.number(),
  reply_comment_id: Joi.number(),
  from_user_id: Joi.number(),
  to_user_id: Joi.number(),
  content: Joi.string().min(5).max(50).required(),
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
