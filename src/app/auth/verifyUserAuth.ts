import { ParameterizedContext } from 'koa';

import { authJwt } from './authJwt';

import roleService from '@/service/role.service';

export const verifyUserAuth = async (ctx: ParameterizedContext) => {
  const { userInfo } = await authJwt(ctx);
  const result: any = await roleService.getMyRole(userInfo.id);
  const roles = result.map((v) => v.role_value);
  if (roles.includes('SUPER_ADMIN')) {
    return true;
  }
  return false;
};
