import dayjs from 'dayjs';
import { ParameterizedContext } from 'koa';

import { chalkINFO, chalkWRAN } from '@/app/chalkTip';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
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
   * 最近一周内，使用流量超过2g就停掉cdn服务
   */
  async monitCDN() {
    const cdnManager = qiniuModel.getQiniuCdnManager();
    // 域名列表
    const domains = ['img.cdn.hsslive.cn', 'resoure.cdn.hsslive.cn'];
    const { startDate, endDate } = getLastestWeek();
    const granularity = 'day'; // 粒度，取值：5min ／ hour ／day
    return new Promise((resolve, reject) => {
      // 获取域名流量
      cdnManager.getFluxData(
        dayjs(startDate).format('YYYY-MM-DD'),
        dayjs(endDate).format('YYYY-MM-DD'),
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
          // 2g就报错
          const oneKb = 1024;
          const oneMb = oneKb * 1024;
          const oneGb = oneMb * 1024;
          const threshold = oneGb * 2;
          console.log(
            chalkWRAN(`流量阈值:${formatMemorySize(threshold)}`),
            threshold
          );
          if (allDomainNameFlux > threshold) {
            resolve(true);
          } else {
            resolve(false);
          }
        }
      );
    });
  }
}

export default new QiniuController();
