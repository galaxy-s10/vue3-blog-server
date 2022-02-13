import Sequelize from 'sequelize';

import { ILink } from '@/interface';
import linkModel from '@/model/link.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class LinkService {
  /** 友链是否存在 */
  async isExist(link_ids: number[]) {
    const res = await linkModel.findAll({
      where: {
        id: {
          [Op.or]: link_ids,
        },
      },
    });
    return res.length === link_ids.length;
  }

  /** 获取友链列表 */
  async getList({ nowPage, pageSize, orderBy, orderName }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await linkModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找友链 */
  async find(id: number) {
    const result = await linkModel.findOne({ where: { id } });
    return result;
  }

  /** 修改友链 */
  async update({ id, email, name, avatar, desc, url, status }: ILink) {
    const result = await linkModel.update(
      { email, name, avatar, desc, url, status },
      { where: { id } }
    );
    return result;
  }

  /** 创建友链 */
  async create({ email, name, avatar, desc, url, status }: ILink) {
    const result = await linkModel.create({
      email,
      name,
      avatar,
      desc,
      url,
      status,
    });
    return result;
  }

  /** 删除友链 */
  async delete(id: number) {
    const result = await linkModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new LinkService();
