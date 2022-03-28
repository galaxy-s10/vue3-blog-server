import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { chalkINFO } from '@/app/chalkTip';
import emitError from '@/app/handler/emit-error';

const csrf = async (ctx: ParameterizedContext, next) => {
  /**
   * 1，验证referer
   * 2，验证origin
   */
};

export default csrf;
