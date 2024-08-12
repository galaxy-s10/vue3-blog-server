import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, IWorks } from '@/interface';
import worksModel from '@/model/works.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class WorksService {
  /** 作品是否存在 */
  async isExist(ids: number[]) {
    const res = await worksModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取作品列表 */
  async getList({
    id,
    status,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IWorks>) {
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
          desc: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          url: {
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
    const result = await worksModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找作品 */
  async find(id: IWorks['id']) {
    const result = await worksModel.findOne({ where: { id } });
    return result;
  }

  /** 修改作品 */
  async update(data: IWorks) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await worksModel.update(data2, { where: { id } });
    return result;
  }

  /** 创建作品 */
  async create(data: IWorks) {
    const result = await worksModel.create(data);
    return result;
  }

  /** 删除作品 */
  async delete(id: IWorks['id']) {
    const result = await worksModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new WorksService();
