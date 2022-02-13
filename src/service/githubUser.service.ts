import Sequelize from 'sequelize';

import { IQqUserList } from '@/controller/qqUser.controller';
import { IQqUser } from '@/interface';
import githubUserModel from '@/model/githubUser.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class UserService {
  /** github用户是否存在 */
  async isExist(github_ids: number[]) {
    const res = await githubUserModel.findAll({
      where: {
        github_id: {
          [Op.or]: github_ids,
        },
      },
    });
    return res.length === github_ids.length;
  }

  /** 获取github用户列表 */
  async getList({
    nickname,
    nowPage,
    pageSize,
    orderBy,
    orderName,
    created_at,
    updated_at,
  }: IQqUserList) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const where1: any = {};
    const where2 = [];
    if (created_at) {
      where1.created_at = {
        [Op.between]: [created_at, `${created_at} 23:59:59`],
      };
    }
    if (updated_at) {
      where1.updated_at = {
        [Op.between]: [updated_at, `${updated_at} 23:59:59`],
      };
    }
    if (nickname) {
      where2.push({
        nickname: {
          [Op.like]: `%${nickname}%`,
        },
      });
    }
    const result = await githubUserModel.findAndCountAll({
      attributes: {
        exclude: ['password', 'token'],
      },
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...where1,
        ...where2,
      },
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找github用户 */
  async find(openid: number) {
    const result = await githubUserModel.findOne({ where: { openid } });
    return result;
  }

  /** 修改github用户 */
  async update({
    client_id,
    openid,
    unionid,
    nickname,
    figureurl_qq,
    constellation,
    gender,
    city,
    province,
    year,
  }: IQqUser) {
    const result = await githubUserModel.update(
      {
        client_id,
        openid,
        nickname,
        figureurl_qq,
        constellation,
        gender,
        city,
        province,
        year,
      },
      { where: { unionid } }
    );
    return result;
  }

  /** 创建github用户 */
  async create(props) {
    const result = await githubUserModel.create(props);
    return result;
  }

  /** 删除github用户 */
  async delete(id: number) {
    const result = await githubUserModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new UserService();
