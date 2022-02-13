import Sequelize from 'sequelize';

import { IArticle } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import starModel from '@/model/star.model';
import tagModel from '@/model/tag.model';
import typeModel from '@/model/type.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op, literal } = Sequelize;

class ArticleService {
  /** 文章是否存在 */
  async isExist(article_ids: number[]) {
    const res = await articleModel.findAll({
      where: {
        id: {
          [Op.or]: article_ids,
        },
      },
    });
    return res.length === article_ids.length;
  }

  /** 查找文章 */
  async find(id: number) {
    await articleModel.update(
      { click: literal('`click` +1') },
      {
        where: { id },
        silent: true, // silent如果为true，则不会更新updateAt时间戳。
      }
    );
    const result = await articleModel.findOne({
      include: [
        {
          model: typeModel,
        },
        {
          model: starModel,
        },
        {
          attributes: { exclude: ['password', 'token'] },
          model: userModel,
        },
        {
          model: commentModel,
        },
        {
          model: tagModel,
        },
      ],
      where: { id },
    });
    return result;
  }

  /** 创建文章 */
  async create({
    title,
    desc,
    header_img,
    is_comment,
    status,
    content,
    click,
    tag_ids = [],
    type_ids = [],
    user_ids = [],
  }: IArticle) {
    const add_article = await articleModel.create({
      title,
      desc,
      header_img,
      is_comment,
      status,
      content,
      click,
      tag_ids,
      type_ids,
      user_ids,
    });
    // @ts-ignore
    tag_ids && (await add_article.setTags(tag_ids));
    // @ts-ignore
    type_ids && (await add_article.setTypes(type_ids));
    // @ts-ignore
    user_ids && (await add_article.setUsers(user_ids));
    return true;
  }

  /** 获取文章列表 */
  async getList({
    tag_ids,
    type_ids,
    user_ids,
    nowPage,
    pageSize,
    orderBy,
    orderName,
  }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    let typeWhere: any = null;
    let tagWhere: any = null;
    let userWhere: any = null;
    if (type_ids.length) {
      typeWhere = {};
      typeWhere.id = type_ids.split(',');
      console.log(typeWhere, 32235);
    }
    if (tag_ids.length) {
      tagWhere = {};
      tagWhere.id = tag_ids.split(',');
    }
    if (user_ids.length) {
      userWhere = {};
      userWhere.id = user_ids.split(',');
    }
    const result = await articleModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      include: [
        {
          model: typeModel,
          where: typeWhere,
        },
        {
          model: starModel,
          // required: false,
        },
        {
          attributes: { exclude: ['password', 'token'] },
          model: userModel,
          where: userWhere,
        },
        {
          model: commentModel,
        },
        {
          model: tagModel,
          where: tagWhere,
        },
      ],
      distinct: true,
    });
    return handlePaging(nowPage, pageSize, result);
  }
}

export default new ArticleService();
