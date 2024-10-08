import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, IVisitorLog } from '@/interface';
import visitorLogModel from '@/model/visitorLog.model';
import { formatTime, handlePaging } from '@/utils';

const { fn, Op, col, literal } = Sequelize;

class VisitorLogService {
  /** 访客日志是否存在 */
  async isExist(ids: number[]) {
    const res = await visitorLogModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取当天访客访问数据 */
  async getDayVisitTotal({ orderBy, orderName, startTime, endTime }) {
    let timeWhere: any = null;
    const orderRes: any[] = [];
    if (startTime && startTime) {
      timeWhere = {
        [Op.between]: [
          formatTime(Number(startTime)),
          formatTime(Number(endTime)),
        ],
      };
    }
    if (orderName && orderBy) {
      orderRes.push([orderName, orderBy]);
    }
    const result = await visitorLogModel.findAll({
      attributes: [
        'ip',
        [fn('count', col('id')), 'total'],
        [
          literal(
            `(SELECT MIN(created_at) FROM ${
              visitorLogModel.name
            } AS t2 WHERE t2.created_at BETWEEN '${formatTime(
              Number(startTime)
            )}' AND '${formatTime(Number(endTime))}' and t2.ip = ${
              visitorLogModel.name
            }.ip)`
          ),
          'first_date',
        ],
      ],
      group: 'ip',
      order: [...orderRes, ['first_date', 'desc']],
      where: { created_at: timeWhere },
    });
    return {
      visitor_total: result.length,
      visit_total: result.reduce((pre, cur) => {
        return cur.get().total! + pre;
      }, 0),
    };
  }

  /** 获取历史访问数据 */
  async getHistoryVisitTotal({ orderBy, orderName }) {
    const result = await visitorLogModel.findAll({
      attributes: ['ip', [fn('count', col('id')), 'total']],
      group: 'ip',
      order: [[orderName, orderBy]],
    });
    return {
      visitor_total: result.length,
      visit_total: result.reduce((pre, cur) => {
        return cur.get().total! + pre;
      }, 0),
    };
  }

  /** 获取每个访客访问的次数 */
  async getIpVisitTotal({
    nowPage,
    pageSize,
    orderBy,
    orderName,
    startTime,
    endTime,
  }) {
    let timeWhere: any = null;
    if (startTime && startTime) {
      timeWhere = {
        [Op.between]: [new Date(startTime), new Date(endTime)],
      };
    }
    const offset = (nowPage - 1) * pageSize;
    const limit = pageSize;
    const result = await visitorLogModel.findAll({
      attributes: ['ip', [fn('count', col('id')), 'total']],
      group: 'ip',
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: { created_at: timeWhere },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取访客日志列表 */
  async getList({
    id,
    user_id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IVisitorLog>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere = deleteUseLessObjectKey({ id, user_id });
    if (keyWord) {
      const keyWordWhere = [
        {
          ip: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          ip_data: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          page_url: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          user_agent: {
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
    const result = await visitorLogModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 获取访客日志列表 */
  async getList2({
    id,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IVisitorLog>) {
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
          user_id: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          ip: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          ip_data: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          page_url: {
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
    const result = await visitorLogModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 新增访客日志 */
  async create(data: IVisitorLog) {
    const result = await visitorLogModel.create(data);
    return result;
  }

  /** 修改访客日志 */
  async update(data: IVisitorLog) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await visitorLogModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 删除访客日志 */
  async delete(id: number) {
    const result = await visitorLogModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new VisitorLogService();
