import userModel from '../model/user.model';

class UserService {
  async create(user) {
    const res = await userModel.create(user);
    return res;
  }

  async getList(user) {
    const res = await userModel.findAndCountAll({});
    return res;
  }
}

export default new UserService();
