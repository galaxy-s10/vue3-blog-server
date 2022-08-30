import Joi from 'joi';
import { ParameterizedContext } from 'koa';

const schema = Joi.object({
  article_id: Joi.number(),
  tag_id: Joi.number(),
});

export const verifyProp = async (ctx: ParameterizedContext, next) => {
  const props = ctx.request.body;
  await schema.validateAsync(props, {
    abortEarly: false,
    allowUnknown: false,
    convert: false,
  });
  await next();
};
