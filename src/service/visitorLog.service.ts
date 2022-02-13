import Sequelize from 'sequelize';

import visitorLogModel from '@/model/visitorLog.model';
import { formateDate, handlePaging } from '@/utils';

const { Op } = Sequelize;

class VisitorLogService {
  /** 访客日志是否存在 */
  async isExist(user_ids: number[]) {
    const res = await visitorLogModel.findAll({
      where: {
        id: {
          [Op.or]: user_ids,
        },
      },
    });
    return res.length === user_ids.length;
  }

  /** 获取访客日志列表 */
  async getList({ nowPage, pageSize, orderBy, orderName }) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const result = await visitorLogModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 获取一秒内ip的访问次数 */
  async getOneSecondApiNums(ip: string) {
    const nowDate = new Date().getTime();
    const beforeDate = nowDate - 1000;
    const apiNum = await visitorLogModel.count({
      where: {
        ip,
        created_at: {
          [Op.between]: [formateDate(beforeDate), formateDate(nowDate)],
        },
      },
    });
    return apiNum;
  }

  /** 新增访客日志 */
  async create({ ip, user_id, ip_data }) {
    const result = await visitorLogModel.create({
      ip,
      ip_data: JSON.stringify(ip_data),
      user_id,
    });
    return result;
  }

  /** 修改访客日志 */
  async update({ ip, user_id, status }) {
    const result = await visitorLogModel.update(
      { user_id, status },
      {
        where: { ip },
      }
    );
    return result;
  }

  /** 删除访客日志 */
  async delete(id: number) {
    const result = await visitorLogModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new VisitorLogService();
