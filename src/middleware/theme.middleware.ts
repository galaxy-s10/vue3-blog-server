import { Context } from 'koa';
import Joi from 'joi';
import { emitError } from '../utils';

export const verifyProp = async (ctx: Context, next) => {
  const prop = ctx.request.body;
  const schema = Joi.object({
    model: Joi.string().min(3).max(50).required(),
    // .error(new Error('model参数要求长度3-5')),
    // .error((err) => {
    //   // console.log('err', err);
    //   return new Error('model参数要求长度3-5');
    // }),
    key: Joi.string().min(3).max(50).required(),
    value: Joi.string().min(3).max(100).required(),
    lang: Joi.string().min(2).max(50).required(),
  });
  // .required();
  // .error(new Error('参数'));
  // .xor('id'); // 定义一组键之间的排他关系，其中一个是必需的，但不是同时需要：
  try {
    // const res = await schema.validateAsync(prop, {
    //   abortEarly: false, // when true，在第一个错误时停止验证，否则返回找到的所有错误。默认为true.
    //   allowUnknown: false, // 当true，允许对象包含被忽略的未知键。默认为false.
    //   presence: 'required', // schema加上required()或者设置presence: 'required'。防止prop为undefined时也能通过验证
    // });
    // console.log('joi验证通过', res);
    return next();
  } catch (error) {
    // console.log('joi验证不通过', error);
    next();

    return emitError({
      ctx,
      code: 400,
      error: error.message,
      // message: 'joi验证不通过',
    });
  }
};
