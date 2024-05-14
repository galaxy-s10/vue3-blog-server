import { filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IInteraction, IList } from '@/interface';
import interactionModel from '@/model/interaction.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class InteractionService {
  async isExist(ids: number[]) {
    const res = await interactionModel.count({
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
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IInteraction>) {
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
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    // @ts-ignore
    const result = await interactionModel.findAndCountAll({
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
    const result = await interactionModel.findOne({ where: { id } });
    return result;
  }

  async create(data: IInteraction) {
    const result = await interactionModel.create(data);
    return result;
  }

  async update(data: IInteraction) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await interactionModel.update(data2, { where: { id } });
    return result;
  }

  async delete(id: number) {
    const result = await interactionModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new InteractionService();
