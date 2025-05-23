import { filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IInteractionStatis, IList } from '@/interface';
import interactionStatisModel from '@/model/interactionStatis.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class InteractionStatisService {
  async isExist(ids: number[]) {
    const res = await interactionStatisModel.count({
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
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    type,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IInteractionStatis>) {
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
      allWhere.type = type;
    }
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(rangTimeStart!),
        [Op.lt]: new Date(rangTimeEnd!),
      };
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          author: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }

    // @ts-ignore
    const result = await interactionStatisModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  async find(id: number) {
    const result = await interactionStatisModel.findOne({ where: { id } });
    return result;
  }

  async create(data: IInteractionStatis) {
    const result = await interactionStatisModel.create(data);
    return result;
  }

  async update(data: IInteractionStatis) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await interactionStatisModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  async delete(id: number) {
    const result = await interactionStatisModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new InteractionStatisService();
