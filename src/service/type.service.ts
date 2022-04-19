import Sequelize from 'sequelize';

import { IType, IList } from '@/interface';
import typeModel from '@/model/type.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;
interface ISearch extends IType, IList {}

class TypeService {
  /** 分类是否存在 */
  async isExist(ids: number[]) {
    const res = await typeModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取分类列表 */
  async getList({
    nowPage,
    pageSize,
    orderBy,
    orderName,
    keyWord,
    id,
  }: ISearch) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const allWhere: any = {};
    if (id) {
      allWhere.id = +id;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    const result = await typeModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找分类 */
  async find(id: number) {
    const result = await typeModel.findOne({ where: { id } });
    return result;
  }

  /** 修改分类 */
  async update({ id, name }: IType) {
    const result = await typeModel.update({ name }, { where: { id } });
    return result;
  }

  /** 创建分类 */
  async create({ name }: IType) {
    const result = await typeModel.create({ name });
    return result;
  }

  /** 删除分类 */
  async delete(id: number) {
    const result = await typeModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new TypeService();
