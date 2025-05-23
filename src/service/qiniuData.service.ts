import { filterObj } from 'billd-utils';
import Sequelize from 'sequelize';

import { IList, IQiniuData } from '@/interface';
import qiniuDataModel from '@/model/qiniuData.model';
import { handlePaging } from '@/utils';

const { Op, cast, col } = Sequelize;
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

  async getPrefixList(prefix) {
    const result = await qiniuDataModel.findAndCountAll({
      where: {
        prefix,
      },
    });
    return result;
  }

  /** 获取文件列表 */
  async getList({
    id,
    user_id,
    prefix,
    orderBy,
    orderName,
    nowPage,
    pageSize,
    keyWord,
    rangTimeType,
    rangTimeStart,
    rangTimeEnd,
  }: IList<IQiniuData>) {
    let offset;
    let limit;
    if (nowPage && pageSize) {
      offset = (+nowPage - 1) * +pageSize;
      limit = +pageSize;
    }
    const allWhere: any = {};
    if (id) {
      allWhere.id = id;
    }
    if (user_id) {
      allWhere.user_id = user_id;
    }
    if (prefix) {
      allWhere.prefix = prefix;
    }
    if (keyWord) {
      const keyWordWhere = [
        {
          qiniu_key: {
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
    let orderNameRes = orderName;
    if (orderNameRes === 'qiniu_fsize') {
      // @ts-ignore
      orderNameRes = cast(col(orderNameRes), 'SIGNED');
    }
    // @ts-ignore
    const result = await qiniuDataModel.findAndCountAll({
      order: [[orderNameRes, orderBy]],
      limit,
      offset,
      where: {
        ...allWhere,
      },
    });
    return handlePaging(result, nowPage, pageSize);
  }

  /** 查找文件 */
  async find(id: number) {
    const result = await qiniuDataModel.findOne({ where: { id } });
    return result;
  }

  /** 查找文件 */
  async findByQiniuKey(qiniu_key: string) {
    const result = await qiniuDataModel.findOne({ where: { qiniu_key } });
    return result;
  }

  /** 创建文件 */
  async create(data: IQiniuData) {
    const result = await qiniuDataModel.create(data);
    return result;
  }

  /** 修改文件 */
  async update(data: IQiniuData) {
    const { id } = data;
    const data2 = filterObj(data, ['id']);
    const result = await qiniuDataModel.update(data2, {
      where: { id },
      limit: 1,
    });
    return result;
  }

  /** 删除文件 */
  async batchDelete(prefix: IQiniuData['prefix']) {
    const result = await qiniuDataModel.destroy({
      where: { prefix },
      individualHooks: true,
    });
    return result;
  }

  /** 删除文件 */
  async delete(id: number) {
    const result = await qiniuDataModel.destroy({
      where: { id },
      limit: 1,
      individualHooks: true,
    });
    return result;
  }
}

export default new QiniuDataService();
