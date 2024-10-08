import { filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IFrontend, IList } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import frontendModel from '@/model/frontend.model';
import userModel from '@/model/user.model';
import visitorLogModel from '@/model/visitorLog.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class FrontendService {
  /** 统计 */
  async static() {
    const [
      article_total,
      article_click_total,
      article_visit_total,
      comment_total,
      user_total,
      visit_total,
    ] = await Promise.all([
      articleModel.count(),
      articleModel.sum('click'),
      articleModel.sum('visit'),
      commentModel.count(),
      userModel.count(),
      visitorLogModel.count(),
    ]);
    return {
      user: {
        total: user_total,
      },
      article: {
        total: article_total,
        click: article_click_total,
        visit: article_visit_total,
      },
      comment: {
        total: comment_total,
      },
      visit: {
        total: visit_total,
      },
    };
  }

  async isExist(ids: number[]) {
    const res = await frontendModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  async find(id: number) {
    const result = await frontendModel.findOne({ where: { id } });
    return result;
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
  }: IList<IFrontend>) {
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
          email: {
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
    const result = await frontendModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  async findAll() {
    const result = await frontendModel.findAll();
    return result;
  }

  async create(data: IFrontend) {
    const result = await frontendModel.create(data);
    return result;
  }

  async update(data: IFrontend) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await frontendModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  async delete(id: number) {
    const result = await frontendModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new FrontendService();
