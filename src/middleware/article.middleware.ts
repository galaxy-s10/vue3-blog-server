import { Context } from 'koa';
import Joi from 'joi';
import { emitError } from '../utils';

export const verifyProp = async (ctx: Context, next) => {
  const prop = ctx.request.body;

  const schema = Joi.object({
    isComment: [1, 2],
    status: ['1', '2'],
    a: Joi.string(),
    v: Joi.string(),
    vs: Joi.string(),
  });
  try {
    const res = await schema.validateAsync(
      { isComment: '1', status: 1 },
      {
        abortEarly: false,
        allowUnknown: false,
        presence: 'required',
      }
    );
    console.log('joi验证通过', res);
  } catch (error) {
    // console.log('joi验证不通过', error); // "isComment" must be one of [1, 2]. "status" must be one of [1, 2]
    return emitError({
      ctx,
      code: 400,
      error,
      // error: error.message,
    });
  }
};
