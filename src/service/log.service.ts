import { deleteUseLessObjectKey, filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, ILog } from '@/interface';
import logModel from '@/model/log.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class LogService {
  /** 日志是否存在 */
  async isExist(ids: number[]) {
    const res = await logModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取日志列表 */
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
  }: IList<ILog>) {
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
          api_user_agent: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          api_from: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          api_real_ip: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          api_host: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          api_hostname: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          api_path: {
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
    const result = await logModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  async getCount({ api_real_ip, startTime, endTime }) {
    const count = await logModel.count({
      where: {
        api_real_ip,
        created_at: {
          [Op.between]: [startTime, endTime],
        },
      },
    });
    return count;
  }

  /** 查找日志 */
  async find(id: number) {
    const result = await logModel.findOne({ where: { id } });
    return result;
  }

  /** 创建日志 */
  async create(data: ILog) {
    const result = await logModel.create(data);
    return result;
  }

  /** 修改日志 */
  async update(data: ILog) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await logModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 删除n天前的日志 */
  async deleteRang(day: number) {
    const nowDate = new Date().getTime();
    const result = await logModel.destroy({
      where: {
        status: 1,
        created_at: {
          [Op.lt]: new Date(nowDate - 1000 * 60 * 60 * 24 * Number(day || 1)),
        },
      },
      force: true, // WARN 不用软删除，直接硬性删除数据库的记录
      individualHooks: false,
    });
    return result;
  }

  /** 删除日志 */
  async delete(id: number) {
    const result = await logModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new LogService();
