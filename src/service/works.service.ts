import Sequelize from 'sequelize';

import { IWorks, IList } from '@/interface';
import worksModel from '@/model/works.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
interface ISearch extends IWorks, IList {}

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
  async getList({
    nowPage,
    pageSize,
    orderBy,
    orderName,
    status,
    keyWord,
    id,
  }: ISearch) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const allWhere: any = {};
    if (id) {
      allWhere.id = +id;
    }
    if (status) {
      allWhere.status = +status;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          url: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          desc: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    const result = await worksModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
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
