import path from 'path';

const getUserStatus = async (id) => {
  // eslint-disable-next-line
  const userModel = require(path.resolve(
    __dirname,
    `../model/user.model.ts`
  )).default;
  const userResult = await userModel.findOne({
    attributes: ['status'],
    where: {
      id,
    },
  });
  if (userResult.status === 2) {
    return { code: 403, message: '该账号已被禁用!' };
  }
  return { code: 200, message: '账号状态正常' };
};

export default getUserStatus;
