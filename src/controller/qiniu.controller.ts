import dayjs from 'dayjs';
import { ParameterizedContext } from 'koa';

import { chalkINFO, chalkWRAN } from '@/app/chalkTip';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { QINIU_BUCKET } from '@/constant';
import qiniuDataModel from '@/model/qiniuData.model';
import qiniuDataService from '@/service/qiniuData.service';
import { formatMemorySize, getLastestWeek } from '@/utils';
import qiniuModel from '@/utils/qiniu';

class QiniuController {
  async getToken(ctx: ParameterizedContext, next) {
    try {
      const token = qiniuModel.getQiniuToken();
      successHandler({
        ctx,
        data: token,
        message: '获取七牛云token成功，有效期1小时？',
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 获取七牛云文件
  async initSyncQiniuData(ctx: ParameterizedContext, next) {
    try {
      const count = await qiniuDataModel.count();
      // if (count) {
      //   successHandler({ ctx, message: '已经同步过七牛云数据了！' });
      //   return;
      // }
      const list = [];
      const limit = 1000;
      const { respInfo, respBody }: any = await qiniuModel.getAllList({
        limit,
      });
      let { marker } = respBody;
      const { items } = respInfo.data;
      list.push(...items);
      while (marker) {
        // eslint-disable-next-line no-await-in-loop
        const res: any = await qiniuModel.getAllList({
          marker,
          limit,
        });
        list.push(...res.respInfo.data.items);
        marker = res.respBody.marker;
      }
      list.forEach((v) => {
        const obj = { ...v };
        Object.keys(obj).forEach((key) => {
          obj[`qiniu_${key}`] = `${obj[key]}`;
          delete obj[key];
        });
        qiniuDataService.create({
          ...obj,
          qiniu_bucket: QINIU_BUCKET,
          user_id: -1,
        });
      });

      successHandler({
        ctx,
        data: '同步七牛云数据成功！',
      });
    } catch (error) {
      console.log(111, error, 111);
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 获取所有七牛云文件
  async getList(ctx: ParameterizedContext, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
        qiniu_bucket,
        qiniu_fsize,
        qiniu_hash,
        qiniu_key,
        qiniu_md5,
        qiniu_mimeType,
        qiniu_putTime,
        qiniu_status,
        qiniu_type,
        keyWord,
        id,
      }: any = ctx.request.query;
      const result = await qiniuDataService.getList({
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
        keyWord,
        id,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 获取所有七牛云文件
  async getAllList(ctx: ParameterizedContext, next) {
    try {
      // const { prefix, limit, marker } = ctx.request.query;
      const list = [];
      const limit = 1000;
      const { respInfo, respBody }: any = await qiniuModel.getAllList({
        limit,
      });
      let { marker } = respBody;
      const { items } = respInfo.data;
      list.push(...items);
      while (marker) {
        // eslint-disable-next-line no-await-in-loop
        const res: any = await qiniuModel.getAllList({
          marker,
          limit,
        });
        list.push(...res.respInfo.data.items);
        marker = res.respBody.marker;
      }
      successHandler({
        ctx,
        data: { list },
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  /**
   * 备份数据库
   */
  async uploadBackupsDb(ctx: ParameterizedContext, next) {
    try {
      const res = await qiniuModel.uploadBackupsDb();
      successHandler({
        ctx,
        data: res,
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  /**
   * 监控cdn流量
   */
  monitCDN() {
    const cdnManager = qiniuModel.getQiniuCdnManager();
    // 域名列表
    const domains = [
      'img.cdn.hsslive.cn',
      'resoure.cdn.hsslive.cn',
      'resource.hsslive.cn',
    ];
    const { startDate, endDate } = getLastestWeek();
    const granularity = 'day'; // 粒度，取值：5min ／ hour ／day
    return new Promise((resolve, reject) => {
      const start = dayjs(startDate).format('YYYY-MM-DD');
      const end = dayjs(endDate).format('YYYY-MM-DD');
      // 获取域名流量
      cdnManager.getFluxData(
        start,
        end,
        granularity,
        domains,
        // eslint-disable-next-line consistent-return
        (err, respBody) => {
          if (err) {
            reject(err);
            return;
          }
          const fluxData = respBody.data;
          let allDomainNameFlux = 0;

          domains.forEach((domain) => {
            const fluxDataOfDomain = fluxData[domain];
            if (fluxDataOfDomain != null) {
              // console.log(`域名: ${domain} 使用的流量情况:`);
              const fluxChina = (fluxDataOfDomain.china || []).reduce(
                (pre, val) => pre + val,
                0
              );
              const fluxOversea = (fluxDataOfDomain.oversea || []).reduce(
                (pre, val) => pre + val,
                0
              );
              // console.log(`域名: ${domain}使用的国内流量:`, fluxChina);
              // console.log(`域名: ${domain}使用的海外流量:`, fluxOversea);
              console.log(
                chalkWRAN(
                  `域名:${domain}最近一周使用的总流量:${formatMemorySize(
                    fluxChina + fluxOversea
                  )}`
                )
              );
              allDomainNameFlux += fluxChina + fluxOversea;
            } else {
              console.log(chalkWRAN(`域名: ${domain}最近一周没有流量数据`));
            }
          });
          console.log(
            chalkWRAN(
              `所有域名最近一周使用的总流量: ${formatMemorySize(
                allDomainNameFlux
              )}`
            )
          );
          resolve({ allDomainNameFlux, start, end });
        }
      );
    });
  }
}

export default new QiniuController();
