import { deleteUseLessObjectKey } from 'billd-utils';
import Sequelize from 'sequelize';

import { IBuryingPoint, IList } from '@/interface';
import buryingPointModel from '@/model/buryingPoint.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class BuryingPointService {
  async isExist(ids: number[]) {
    const res = await buryingPointModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  async getList({
    id,
    user_id,
    article_id,
    extend_field_a,
    extend_field_b,
    extend_field_c,
    extend_field_d,
    extend_field_e,
    extend_field_f,
    extend_field_g,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IBuryingPoint>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = deleteUseLessObjectKey({
      id,
      user_id,
      article_id,
      extend_field_a,
      extend_field_b,
      extend_field_c,
      extend_field_d,
      extend_field_e,
      extend_field_f,
      extend_field_g,
    });
    if (keyWord) {
      const keyWordWhere = [
        {
          ip: {
            [Op.like]: `%${keyWord}%`,
          },
          user_agent: {
            [Op.like]: `%${keyWord}%`,
          },
          remark: {
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
    const result = await buryingPointModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  async create(data: IBuryingPoint) {
    const result = await buryingPointModel.create(data);
    return result;
  }
}

export default new BuryingPointService();
