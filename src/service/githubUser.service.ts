import Sequelize from 'sequelize';

import { IList, IGithubUser } from '@/interface';
import githubUserModel from '@/model/githubUser.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

export interface IGithubUserList extends IList {
  created_at?: string;
  updated_at?: string;
}
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
    nowPage,
    pageSize,
    orderBy,
    orderName,
    created_at,
    updated_at,
  }: IGithubUserList) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const where1: any = {};
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
    const result = await githubUserModel.findAndCountAll({
      attributes: {
        exclude: ['password', 'token'],
      },
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...where1,
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
  async update(githubProps: IGithubUser) {
    const result = await githubUserModel.update(
      {
        ...githubProps,
      },
      { where: { id: githubProps.id } }
    );
    return result;
  }

  /** 创建github用户 */
  async create(githubProps) {
    const result = await githubUserModel.create(githubProps);
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
