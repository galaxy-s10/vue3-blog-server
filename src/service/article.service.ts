import Sequelize from 'sequelize';

import { IArticle } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import starModel from '@/model/star.model';
import tagModel from '@/model/tag.model';
import typeModel from '@/model/type.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { fn, Op, col, literal } = Sequelize;

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
  async find(id: number, from_user_id: number) {
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
          attributes: { exclude: ['password', 'token'] },
          model: userModel,
          through: {
            attributes: [],
          },
        },
        {
          model: tagModel,
        },
      ],
      where: { id },
    });
    const starTotalPromise = starModel.count({
      where: {
        article_id: id,
        comment_id: -1,
      },
    });
    const commentTotalPromise = commentModel.count({
      where: {
        article_id: id,
      },
    });
    const isStarPromise = starModel.count({
      where: {
        article_id: id,
        from_user_id,
      },
    });
    const [star_total, comment_total, is_star] = await Promise.all([
      starTotalPromise,
      commentTotalPromise,
      isStarPromise,
    ]);
    return {
      ...result.get(),
      is_star: is_star === 1,
      star_total,
      comment_total,
    };
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
    status,
  }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    let typeWhere: any = null;
    let tagWhere: any = null;
    let userWhere: any = null;
    if (type_ids.length) {
      typeWhere = {};
      typeWhere.id = type_ids.split(',');
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
      include: [
        {
          model: commentModel,
          attributes: ['id'],
        },
        {
          model: starModel,
          attributes: ['id'],
          where: {
            comment_id: -1,
          },
          required: false, // 加了where条件后，需要添加required: false
        },
        {
          model: typeModel,
          where: typeWhere,
          // attributes: [[fn('GROUP_CONCAT', col('types.name')), 'dddd']],
          // attributes: {
          //   // exclude: ['types.id'],
          //   include: [[fn('GROUP_CONCAT', col('types.name')), 'dddd']],
          // },
          through: { attributes: [] },
          // required: false, // false:left join; true:inner join
        },
        {
          attributes: { exclude: ['password', 'token'] },
          model: userModel,
          where: userWhere,
          through: { attributes: [] },
        },
        {
          model: tagModel,
          where: tagWhere,
          through: { attributes: [] },
        },
      ],
      // attributes: ['title'],
      // attributes: [[fn('count', col('comments.id')), 'comment_total']],
      attributes: {
        // include: [[literal(`(select count(comments.id))`), 'comment_total']],
        exclude: ['content'],
        include: [
          // [fn('count', col('comments.id')), 'comment_total'],
          // [fn('count', col('stars.id')), 'star_total'],
          // [fn('GROUP_CONCAT', col('types.name')), 'type_arr'],
          // [literal(`(select count(distinct comments.id))`), 'comment_total'],
          // [literal(`(select count(distinct stars.id))`), 'star_total'],
          // [literal(`(select group_concat(distinct types.name))`), 'type_arr'],
          // [literal(`(select group_concat(distinct users.avatar))`), 'user_arr'],
          // [fn('count', col('types.id')), 'type_total'],
          // [
          //   literal(
          //     `(SELECT t.* ,aaa.id as article_id FROM type t LEFT JOIN article_type at ON at.type_id = t.id LEFT JOIN article aaa ON aaa.id = at.article_id)`
          //   ),
          //   'xxx_total',
          // ],
        ],
      },
      where: { status },
      distinct: true,
      order: [[orderName, orderBy]],
      // group: ['article.id'],
      limit,
      offset,
      // subQuery: false, // 非常关键！！！
    });
    result.rows.forEach((item) => {
      const v = item.get();
      v.star_total = v.stars.length;
      v.comment_total = v.comments.length;
      delete v.stars;
      delete v.comments;
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 搜索文章 */
  async getKeywordList({ keyword, nowPage, pageSize, status }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    let keywordWhere: any = null;
    if (keyword) {
      keywordWhere = [
        {
          title: {
            [Op.like]: `%${keyword}%`,
          },
        },
        {
          desc: {
            [Op.like]: `%${keyword}%`,
          },
        },
        {
          content: {
            [Op.like]: `%${keyword}%`,
          },
        },
      ];
    }
    const result = await articleModel.findAndCountAll({
      where: { [Op.or]: keywordWhere, status },
      distinct: true,
      limit,
      offset,
    });
    return handlePaging(nowPage, pageSize, result);
  }
}

export default new ArticleService();
