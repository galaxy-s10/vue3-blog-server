import dayjs from 'dayjs';
import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { getLastestWeek } from '@/utils';
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
  async getAllList(ctx: ParameterizedContext, next) {
    try {
      const { prefix, limit, marker } = ctx.request.query;
      const data: any = await qiniuModel.getAllList(prefix, limit, marker);
      successHandler({
        ctx,
        data: data.respInfo.data.items,
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
  async monitCDN() {
    const cdnManager = qiniuModel.getQiniuCdnManager();
    // 域名列表
    const domains = ['img.cdn.hsslive.cn', 'resoure.cdn.hsslive.cn'];
    const { startDate, endDate } = getLastestWeek();
    console.log(
      dayjs(startDate).format('YYYY-MM-DD'),
      dayjs(endDate).format('YYYY-MM-DD')
    );
    // 指定日期
    // const startDate = '2022-06-27 10:00:00';
    // const endDate = '2022-06-27 12:00:00';
    const granularity = 'day'; // 粒度，取值：5min ／ hour ／day
    return new Promise((resolve, reject) => {
      // 获取域名流量
      cdnManager.getFluxData(
        dayjs(startDate).format('YYYY-MM-DD'),
        dayjs(endDate).format('YYYY-MM-DD'),
        granularity,
        domains,
        function (err, respBody, respInfo) {
          if (err) {
            throw err;
          }
          resolve(respBody);
          console.log(respBody, 11111);
          console.log('+++++++++++');
          // return;
          // 防止因为没数据导致报错(如果没有当天的CDN数据就返回)
          if (!Object.keys(respBody.data).length) {
            return false;
          }
          console.log(respInfo.data.data, respBody, 22222);
          if (respInfo.statusCode === 200) {
            const jsonBody = respBody;
            const { code } = jsonBody;
            console.log(code);
            const tickTime = jsonBody.time;
            console.log(tickTime);
            const fluxData = jsonBody.data;
            console.log(fluxData);
            console.log('----111');
            // domains.forEach(function (domain) {
            //   const fluxDataOfDomain = fluxData[domain];
            //   console.log('fluxDataOfDomain', fluxDataOfDomain);
            //   if (fluxDataOfDomain != null) {
            //     console.log(`flux data for:${domain}`);
            //     const fluxChina = fluxDataOfDomain.china;
            //     const fluxOversea = fluxDataOfDomain.oversea;
            //     console.log(fluxChina);
            //     console.log(fluxOversea);
            //   } else {
            //     console.log(`no flux data for:${domain}`);
            //   }
            //   console.log('----------');
            // });
          }
        }
      );
    });
  }
}

export default new QiniuController();
