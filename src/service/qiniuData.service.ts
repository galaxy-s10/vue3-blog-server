import Sequelize from 'sequelize';

import { IQiniuData, IList } from '@/interface';
import qiniuDataModel from '@/model/qiniuData.model';
import { handlePaging } from '@/utils';

interface ISearch extends IQiniuData, IList {}

const { Op } = Sequelize;
class QiniuDataService {
  /** 文件是否存在 */
  async isExist(ids: number[]) {
    const res = await qiniuDataModel.count({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });
    return res === ids.length;
  }

  /** 获取文件列表 */
  async getList({
    nowPage,
    pageSize,
    orderBy,
    orderName,
    qiniu_bucket,
    qiniu_fsize,
    qiniu_hash,
    qiniu_key,
    qiniu_md5,
    qiniu_mimeType,
    qiniu_putTime,
    qiniu_status,
    qiniu_type,
    user_id,
    keyWord,
  }: ISearch) {
    const offset = (parseInt(nowPage, 10) - 1) * parseInt(pageSize, 10);
    const limit = parseInt(pageSize, 10);
    const allWhere: any = {};
    if (user_id) {
      allWhere.user_id = user_id;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          name: {
            [Op.like]: `%${keyWord}%`,
          },
        },
        {
          author: {
            [Op.like]: `%${keyWord}%`,
          },
        },
      ];
      allWhere[Op.or] = keyWordWhere;
    }
    const result = await qiniuDataModel.findAndCountAll({
      order: [[orderName, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(nowPage, pageSize, result);
  }

  /** 查找文件 */
  async find(id: number) {
    const result = await qiniuDataModel.findOne({ where: { id } });
    return result;
  }

  /** 修改文件 */
  async update({
    id,
    qiniu_bucket,
    qiniu_fsize,
    qiniu_hash,
    qiniu_key,
    qiniu_md5,
    qiniu_mimeType,
    qiniu_putTime,
    qiniu_status,
    qiniu_type,
    user_id,
  }: IQiniuData) {
    const result = await qiniuDataModel.update(
      {
        qiniu_bucket,
        qiniu_fsize,
        qiniu_hash,
        qiniu_key,
        qiniu_md5,
        qiniu_mimeType,
        qiniu_putTime,
        qiniu_status,
        qiniu_type,
        user_id,
      },
      { where: { id } }
    );
    return result;
  }

  /** 创建文件 */
  async create({
    qiniu_bucket,
    qiniu_fsize,
    qiniu_hash,
    qiniu_key,
    qiniu_md5,
    qiniu_mimeType,
    qiniu_putTime,
    qiniu_status,
    qiniu_type,
    user_id,
  }: IQiniuData) {
    try {
      const result = await qiniuDataModel.create({
        qiniu_bucket,
        qiniu_fsize,
        qiniu_hash,
        qiniu_key,
        qiniu_md5,
        qiniu_mimeType,
        qiniu_putTime,
        qiniu_status,
        qiniu_type,
        user_id,
      });
      return result;
    } catch (error) {
      console.log(error);
    }
  }

  /** 删除文件 */
  async delete(id: number) {
    const result = await qiniuDataModel.destroy({
      where: { id },
      individualHooks: true,
    });
    return result;
  }
}

export default new QiniuDataService();
