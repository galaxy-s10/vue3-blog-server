import userModel from '@/model/user.model';

const getUserStatus = async (id = -1) => {
  const userResult: any = await userModel.findOne({
    attributes: ['status'],
    where: {
      id,
    },
  });
  if (userResult.status === 1) {
    return { code: 200, message: '当前账号状态正常!' };
  }
  if (userResult.status === 2) {
    return { code: 403, message: '当前账号已被禁用!' };
  }
  return { code: 403, message: '当前账号状态非法!' };
};

export default getUserStatus;
