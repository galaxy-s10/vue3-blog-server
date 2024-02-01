import Sequelize from 'sequelize';

import articleTagService from './articleTag.service';
import tagService from './tag.service';

import sequelize from '@/config/mysql';
import { IArticle, IList } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import starModel from '@/model/star.model';
import tagModel from '@/model/tag.model';
import typeModel from '@/model/type.model';
import userModel from '@/model/user.model';
import { arrayUnique, handlePaging } from '@/utils';

const { Op, literal } = Sequelize;

class ArticleService {
  /** 文章是否存在 */
  async isExist(ids: number[]) {
    const res = await articleModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 查找文章 */
  async find(id: number) {
    const result = await articleModel.findOne({ where: { id } });
    return result;
  }

  /** 查找文章详情 */
  async findArticleDetail(id: number, from_user_id = -1) {
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
          through: {
            attributes: [],
          },
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
          through: {
            attributes: [],
          },
        },
      ],
      where: { id },
    });
    if (!result) return null;
    const starPromise = starModel.findAndCountAll({
      attributes: [
        [Sequelize.col('star.id'), 'star_id'],
        [Sequelize.col('user.id'), 'id'],
        [Sequelize.col('user.avatar'), 'avatar'],
        [Sequelize.col('user.username'), 'username'],
      ],
      include: [
        {
          model: userModel,
          attributes: [],
          required: true,
        },
      ],
      // limit: 5,
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
    const isStarPromise = starModel.findOne({
      where: {
        article_id: id,
        from_user_id,
      },
    });
    const [star_info, comment_total, is_star]: any = await Promise.all([
      starPromise,
      commentTotalPromise,
      isStarPromise,
    ]);
    return {
      ...result.get(),
      is_star: Boolean(is_star),
      is_star_id: is_star?.id,
      star_info,
      comment_total,
    };
  }

  /** 创建文章 */
  async create({
    title,
    desc,
    head_img,
    is_comment,
    status,
    content,
    priority,
  }: IArticle) {
    const result = await articleModel.create({
      title,
      desc,
      head_img,
      is_comment,
      status,
      content,
      priority,
    });
    return result;
  }

  /** 获取文章列表 */
  async getList({
    id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    tags,
    types,
    users,
    status,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IArticle>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    let idWhere: any;
    let typeWhere: any;
    let tagWhere: any;
    let userWhere: any;
    let statusWhere: any;
    const allWhere: any = {};
    if (status) {
      statusWhere = {};
      statusWhere.status = status;
    }
    if (id) {
      idWhere = {};
      idWhere.id = id;
    }
    if (keyWord) {
      allWhere[Op.or] = [
        {
          title: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          desc: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          content: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
    }
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(+rangTimeStart!),
        [Op.lt]: new Date(+rangTimeEnd!),
      };
    }
    if (types?.length) {
      typeWhere = {};
      typeWhere.id = types;
    }
    if (tags?.length) {
      tagWhere = {};
      tagWhere.id = tags;
    }
    if (users?.length) {
      userWhere = {};
      userWhere.id = users;
    }
    // @ts-ignore
    const result = await articleModel.findAndCountAll({
      include: [
        // {
        //   model: commentModel,
        //   attributes: ['id'],
        //   required: false,
        // },
        // {
        //   model: starModel,
        //   attributes: ['id'],
        //   where: {
        //     comment_id: -1,
        //   },
        //   // 这个required: false不能省，否则article/list?orderName=click&orderBy=desc&nowPage=1&pageSize=5时，缺失数据
        //   required: false,
        // },
        {
          attributes: { exclude: ['password', 'token'] },
          model: userModel,
          where: userWhere,
          through: { attributes: [] },
        },
        {
          model: typeModel,
          where: typeWhere,
          through: { attributes: [] },
        },
        // {
        //   model: tagModel,
        //   where: tagWhere,
        //   through: { attributes: [] },
        // },
      ],
      attributes: {
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
      where: { ...statusWhere, ...idWhere, ...allWhere },
      distinct: true,
      order: [
        ['priority', 'desc'],
        [orderName, orderBy],
      ],
      limit,
      offset,
      // subQuery: false, // 非常关键！！！
    });
    const article_ids: number[] = [];
    result.rows.forEach((item) => {
      article_ids.push(item.id!);
    });
    const [commentNumsRes] = await sequelize.query(
      `SELECT article_id, COUNT(*) as count FROM ${
        commentModel.name
      } WHERE article_id IN (${article_ids.join()}) GROUP BY article_id`
    );
    const commentNumsMap: any = {};
    commentNumsRes.forEach((item: any) => {
      commentNumsMap[item.article_id] = item.count;
    });
    const [starNumsRes] = await sequelize.query(
      `SELECT article_id, COUNT(*) as count FROM ${
        starModel.name
      } WHERE article_id IN (${article_ids.join()}) AND comment_id = -1 GROUP BY article_id`
    );
    const starNumsMap: any = {};
    starNumsRes.forEach((item: any) => {
      starNumsMap[item.article_id] = item.count;
    });

    const res1 = await articleTagService.findArticleTag(article_ids);
    let tagids: number[] = [];
    res1.forEach((item) => {
      tagids.push(item.tag_id!);
    });
    tagids = arrayUnique(tagids);
    const res2 = await tagService.findRangTag(tagids);
    const tagMap = {};
    res2.forEach((item) => {
      tagMap[item.id!] = item;
    });
    const articleTagRes = {};
    res1.forEach((item) => {
      const old = articleTagRes[item.article_id!];
      if (old) {
        old.push(tagMap[item.tag_id!]);
      } else {
        articleTagRes[item.article_id!] = [tagMap[item.tag_id!]];
      }
    });
    result.rows.forEach((item) => {
      const v: any = item.get();
      v.tags = articleTagRes[item.id!];
      v.star_total = starNumsMap[item.id!] || 0;
      v.comment_total = commentNumsMap[item.id!] || 0;
      // v.comment_total = v.comments.length;
      // v.star_total = v.stars.length;
      delete v.stars;
      delete v.comments;
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 搜索文章 */
  async getKeyWordList({
    keyWord,
    nowPage,
    pageSize,
    status,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IArticle>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = {};
    if (status) {
      allWhere.status = status;
    }
    if (keyWord) {
      allWhere[Op.or] = [
        {
          title: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          desc: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          content: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
    }
    if (rangTimeType) {
      allWhere[rangTimeType] = {
        [Op.gt]: new Date(rangTimeStart!),
        [Op.lt]: new Date(rangTimeEnd!),
      };
    }
    const result = await articleModel.findAndCountAll({
      where: { ...allWhere },
      distinct: true,
      limit,
      offset,
    });
    return handlePaging(result, nowPage, pageSize);
  }

  async update({
    id,
    title,
    desc,
    is_comment,
    priority,
    status,
    head_img,
    content,
  }: IArticle) {
    const result = await articleModel.update(
      {
        title,
        desc,
        is_comment,
        priority,
        status,
        head_img,
        content,
      },
      { where: { id } }
    );
    return result;
  }

  /** 删除文章 */
  async delete(id: number) {
    const result = await articleModel.destroy({
      where: { id },
    });
    return result;
  }
}

export default new ArticleService();
