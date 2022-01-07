import User from '../model/user.model';

async function getUserStatus(id) {
  const userResult = await User.findOne({
    attributes: ['status'],
    where: {
      id,
    },
  });
  if (userResult.status === 2) {
    return { code: 403, message: '该账号已被禁用!' };
  }
  return { code: 200, message: '账号状态正常' };
}

export default getUserStatus;
