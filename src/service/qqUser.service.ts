import Sequelize from 'sequelize';

import { IQqUserList } from '@/controller/qqUser.controller';
import { IQqUser } from '@/interface';
import qqUserModel from '@/model/qqUser.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class UserService {
  /** qq用户是否存在 */
  async isExist(unionids: number[]) {
    console.log(unionids, 22222);
    const res = await qqUserModel.findAll({
      where: {
        unionid: {
          [Op.or]: unionids,
        },
      },
    });
    return res.length === unionids.length;
  }

  /** 获取qq用户列表 */
  async getList({
    nickname,
    nowPage,
    pageSize,
    orderBy,
    orderName,
    created_at,
    updated_at,
  }: IQqUserList) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const where1: any = {};
    const where2 = [];
    if (created_at) {
      where1.created_at = {
        [Op.between]: [created_at, `${created_at} 23:59:59`],
      };
    }
    if (updated_at) {
      where1.updated_at = {
        [Op.between]: [updated_at, `${updated_at} 23:59:59`],
      };
    }
    if (nickname) {
      where2.push({
        nickname: {
          [Op.like]: `%${nickname}%`,
        },
      });
    }
    const result = await qqUserModel.findAndCountAll({
      attributes: {
        exclude: ['password', 'token'],
      },
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...where1,
        ...where2,
      },
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找qq用户 */
  async find(openid: number) {
    const result = await qqUserModel.findOne({ where: { openid } });
    return result;
  }

  /** 修改qq用户 */
  async update({
    client_id,
    openid,
    unionid,
    nickname,
    figureurl,
    figureurl_1,
    figureurl_2,
    figureurl_qq_1,
    figureurl_qq_2,
    constellation,
    gender,
    city,
    province,
    year,
  }: IQqUser) {
    const result = await qqUserModel.update(
      {
        client_id,
        openid,
        nickname,
        figureurl,
        figureurl_1,
        figureurl_2,
        figureurl_qq_1,
        figureurl_qq_2,
        constellation,
        gender,
        city,
        province,
        year,
      },
      { where: { unionid } }
    );
    return result;
  }

  /** 创建qq用户 */
  async create({
    nickname,
    client_id,
    openid,
    unionid,
    figureurl,
    figureurl_1,
    figureurl_2,
    figureurl_qq_1,
    figureurl_qq_2,
    gender,
    year,
    city,
    province,
    constellation,
  }: IQqUser) {
    const result = await qqUserModel.create({
      nickname,
      client_id,
      openid,
      unionid,
      figureurl,
      figureurl_1,
      figureurl_2,
      figureurl_qq_1,
      figureurl_qq_2,
      gender,
      year,
      city,
      province,
      constellation,
    });
    return result;
  }

  /** 删除qq用户 */
  async delete(id: number) {
    const result = await qqUserModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new UserService();
