import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { ILink, IList } from '@/interface';
import linkModel from '@/model/link.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class LinkService {
  /** 友链是否存在 */
  async isExist(ids: number[]) {
    const res = await linkModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取友链列表 */
  async getList({
    id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    status,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<ILink>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere = deleteUseLessObjectKey({ id, status });
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
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // @ts-ignore
    const result = await linkModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找友链 */
  async find(id: number) {
    const result = await linkModel.findOne({ where: { id } });
    return result;
  }

  /** 创建友链 */
  async create(data: ILink) {
    const result = await linkModel.create(data);
    return result;
  }

  /** 修改友链 */
  async update(data: ILink) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await linkModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 删除友链 */
  async delete(id: number) {
    const result = await linkModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new LinkService();
