import Sequelize from 'sequelize';

import { IBlacklist, IList } from '@/interface';
import blacklistModel from '@/model/blacklist.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class LinkService {
  /** 黑名单是否存在 */
  async isExist(ids: number[]) {
    const res = await blacklistModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取黑名单列表 */
  async getList({
    nowPage,
    pageSize,
    orderBy,
    orderName,
    keyWord,
    id,
  }: IList<IBlacklist>) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const allWhere: any = {};
    if (id) {
      allWhere.id = +id;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          ip: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          user_id: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          msg: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    const result = await blacklistModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找黑名单 */
  async find(id: number) {
    const result = await blacklistModel.findOne({ where: { id } });
    return result;
  }

  /** 修改黑名单 */
  async update({ id, user_id, ip, msg }: IBlacklist) {
    const result = await blacklistModel.update(
      { user_id, ip, msg },
      { where: { id } }
    );
    return result;
  }

  /** 创建黑名单 */
  async create({ user_id, ip, msg }: IBlacklist) {
    const result = await blacklistModel.create({
      user_id,
      ip,
      msg,
    });
    return result;
  }

  /** 删除黑名单 */
  async delete(id: number) {
    const result = await blacklistModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new LinkService();
