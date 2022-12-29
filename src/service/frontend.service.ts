import Sequelize from 'sequelize';

import { IFrontend, IList } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import frontendModel from '@/model/frontend.model';
import qqUserModel from '@/model/qqUser.model';
import userModel from '@/model/user.model';
import VisitorLogModel from '@/model/visitorLog.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class FrontendService {
  /** 统计 */
  async static() {
    const article_total = await articleModel.count();
    const article_read_total = await articleModel.sum('click');
    const comment_total = await commentModel.count();
    const user_total = await userModel.count();
    const qq_user_total = await qqUserModel.count();
    const visit_total = await VisitorLogModel.count();
    return {
      user: {
        total: user_total,
      },
      qq_user: {
        total: qq_user_total,
      },
      article: {
        total: article_total,
        read: article_read_total,
      },
      comment: {
        total: comment_total,
      },
      visit: {
        total: visit_total,
      },
    };
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

  async create({ type, key, value, desc }: IFrontend) {
    const result = await frontendModel.create({
      type,
      key,
      value,
      desc,
    });
    return result;
  }

  /** 修改前端设置 */
  async update({ id, key, value, desc }: IFrontend) {
    const result = await frontendModel.update(
      {
        key,
        value,
        desc,
      },
      { where: { id } }
    );
    return result;
  }
}

export default new FrontendService();
