import Sequelize from 'sequelize';

import { THIRD_PLATFORM } from '@/app/constant';
import sequelize from '@/config/db';
import { IEmail } from '@/interface';
import commentModel from '@/model/comment.model';
import emailModel from '@/model/emailUser.model';
import thirdUserModel from '@/model/thirdUser.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
class EmailService {
  /** 邮箱用户是否存在 */
  async isExist(emails: string[]) {
    const res = await emailModel.count({
      where: {
        email: {
          [Op.or]: [...new Set(emails)],
        },
      },
    });
    return res === emails.length;
  }

  /** 是否存在 */
  async idIsExist(ids: number[]) {
    const res = await emailModel.count({
      where: {
        id: {
          [Op.or]: [...new Set(ids)],
        },
      },
    });
    return res === ids.length;
  }

  /** 获取邮箱用户列表 */
  async getList({ nowPage, pageSize, orderBy, orderName }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await emailModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 根据email在第三方用户里面找到对应的用户 */
  async findThirdUser(email: string) {
    const result = await emailModel.findOne({
      include: [
        {
          model: userModel,
          through: {
            attributes: [],
            where: {
              third_platform: THIRD_PLATFORM.email,
            },
          },
          attributes: {
            exclude: ['password', 'token'],
          },
        },
      ],
      where: { email },
    });
    return result;
  }

  /** 根据email查找邮箱用户 */
  async findByEmail(email: string) {
    const result = await emailModel.findOne({
      where: { email },
    });
    return result;
  }

  /** 根据id查找邮箱用户 */
  async findById(id: number) {
    const result = await emailModel.findOne({ where: { id } });
    return result;
  }

  /** 修改邮箱用户 */
  async update({ id, email }: IEmail) {
    const result = await emailModel.update({ email }, { where: { id } });
    return result;
  }

  /** 创建邮箱用户 */
  async create({ email }: IEmail) {
    const result = await emailModel.create({ email });
    return result;
  }

  /** 删除邮箱用户 */
  async delete(id: number) {
    const result = await emailModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new EmailService();
