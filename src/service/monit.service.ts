import { filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, IMonit } from '@/interface';
import monitModel from '@/model/monit.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class MonitService {
  /** 监控是否存在 */
  async isExist(ids: number[]) {
    const res = await monitModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取监控列表 */
  async getList({
    id,
    type,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IMonit>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = {};
    if (id) {
      allWhere.id = +id;
    }
    if (type) {
      allWhere.type = +type;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          info: {
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
    const result = await monitModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找监控 */
  async find(id: number) {
    const result = await monitModel.findOne({ where: { id } });
    return result;
  }

  /** 创建监控 */
  async create(data: IMonit) {
    const result = await monitModel.create(data);
    return result;
  }

  /** 修改监控 */
  async update(data: IMonit) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await monitModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 删除监控 */
  async delete(id: number) {
    const result = await monitModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new MonitService();
