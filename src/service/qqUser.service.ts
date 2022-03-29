import Sequelize from 'sequelize';

import { IQqUserList } from '@/controller/qqUser.controller';
import { IQqUser } from '@/interface';
import qqUserModel from '@/model/qqUser.model';
import thirdUserModel from '@/model/thirdUser.model';
import userModel from '@/model/user.model';
import { handlePaging } from '@/utils';

const { Op } = Sequelize;

class UserService {
  /** 所有应用里面是否存在qq用户 */
  async isExistUnionid(unionid: any) {
    const res = await qqUserModel.count({
      where: {
        unionid,
      },
    });
    return res === 1;
  }

  /** 同一个应用里面是否存在qq用户 */
  async isExistClientIdUnionid(client_id: any, unionid: any) {
    const res = await qqUserModel.count({
      where: {
        client_id,
        unionid,
      },
    });
    return res === 1;
  }

  async isExist(ids: number[]) {
    const res = await qqUserModel.findAll({
      where: {
        id: {
          [Op.or]: ids,
        },
      },
    });
    return res.length === ids.length;
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

  /** 根据详细信息查找qq用户 */
  async findByUnionid(unionid) {
    const result = await qqUserModel.findOne({
      where: { unionid },
    });
    return result;
  }

  /** 根据unionid修改qq用户 */
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
        openid,
        client_id,
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
