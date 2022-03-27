import Sequelize from 'sequelize';

import { IThirdUser } from '@/interface';
import thirdUserModel from '@/model/thirdUser.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class TagService {
  /** 第三方用户记录是否存在 */
  async isExist(ids: number[]) {
    const res = await thirdUserModel.findAll({
      where: {
        id: {
          [Op.or]: ids,
        },
      },
    });
    return res.length === ids.length;
  }

  /** 获取第三方用户记录列表 */
  async getList({ nowPage, pageSize, orderBy, orderName }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await thirdUserModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找第三方用户记录 */
  async find(id: number) {
    const result = await thirdUserModel.findOne({ where: { id } });
    return result;
  }

  /** 查找第三方用户表里的用户 */
  async findUser({ third_platform, third_user_id }) {
    const result = await thirdUserModel.findOne({
      where: { third_platform, third_user_id },
    });
    return result;
  }

  /** 根据third_user_id查找第三方用户表里的用户 */
  async findUserByThirdUserId(third_user_id) {
    const result = await thirdUserModel.findOne({
      where: { third_user_id },
    });
    return result;
  }

  /** 修改第三方用户记录 */
  async update({ id, user_id, third_platform, third_user_id }: IThirdUser) {
    const result = await thirdUserModel.update(
      { user_id, third_platform, third_user_id },
      { where: { id } }
    );
    return result;
  }

  /** 创建第三方用户记录 */
  async create({ user_id, third_platform, third_user_id }: IThirdUser) {
    const result = await thirdUserModel.create({
      user_id,
      third_platform,
      third_user_id,
    });
    return result;
  }

  /** 删除第三方用户记录 */
  async delete(id: number) {
    const result = await thirdUserModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new TagService();
