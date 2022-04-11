import Sequelize from 'sequelize';

import { IWorks } from '@/interface';
import worksModel from '@/model/works.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class WorksService {
  /** 作品是否存在 */
  async isExist(ids: number[]) {
    const res = await worksModel.findAll({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res.length === ids.length;
  }

  /** 获取作品列表 */
  async getList({ nowPage, pageSize, orderBy, orderName, status }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await worksModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        status,
      },
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找作品 */
  async find(id: number) {
    const result = await worksModel.findOne({ where: { id } });
    return result;
  }

  /** 修改作品 */
  async update({ id, email, name, avatar, desc, url, status }: IWorks) {
    const result = await worksModel.update(
      { email, name, avatar, desc, url, status },
      { where: { id } }
    );
    return result;
  }

  /** 创建作品 */
  async create(props: IWorks) {
    const result = await worksModel.create({
      ...props,
    });
    return result;
  }

  /** 删除作品 */
  async delete(id: number) {
    const result = await worksModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new WorksService();
