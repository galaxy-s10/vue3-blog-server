import dayjs from 'dayjs';
import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import { chalkWRAN } from '@/app/chalkTip';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import {
  QINIU_BUCKET,
  QINIU_CDN_DOMAIN,
  QINIU_CDN_URL,
  QINIU_PREFIX,
} from '@/constant';
import { IQiniuData } from '@/interface';
import qiniuDataModel from '@/model/qiniuData.model';
import qiniuDataService from '@/service/qiniuData.service';
import { formatMemorySize, getLastestWeek } from '@/utils';
import qiniu from '@/utils/qiniu';

class QiniuController {
  async getToken(ctx: ParameterizedContext, next) {
    try {
      const token = qiniu.getQiniuToken();
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

  upload = async (ctx: ParameterizedContext, next) => {
    try {
      const { user_id, prefix } = ctx.request.body;
      let fileArr: {
        prefix: string;
        filepath: string;
        originalFilename: string;
      }[] = [];
      const { uploadFiles } = ctx.request.files;
      if (Array.isArray(uploadFiles)) {
        fileArr = uploadFiles.map((v) => {
          return {
            prefix,
            filepath: v.filepath,
            originalFilename: v.originalFilename,
          };
        });
      } else {
        fileArr.push({
          prefix,
          filepath: uploadFiles.filepath,
          originalFilename: uploadFiles.originalFilename,
        });
      }
      const queue = [];
      fileArr.forEach((v) => {
        queue.push(qiniu.upload(v));
      });
      const queueRes = await Promise.all(queue);
      const uploadRes = { success: [], error: [] };
      queueRes.forEach((v) => {
        if (v.flag) {
          uploadRes.success.push({
            ...v.respBody,
            original: v.original,
            resultFilename: QINIU_CDN_URL + v.respBody.key,
          });
        } else {
          uploadRes.error.push({
            original: v.original,
          });
        }
      });
      // WARN七牛云官方的接口不完善，先用妥协的办法
      // const res = await this.batchFileInfo(
      //   uploadRes.success.map((item) => {
      //     return { srcBucket: QINIU_BUCKET, key: item.key };
      //   })
      // );
      const queue1 = [];
      uploadRes.success.forEach((item) => {
        queue1.push(
          qiniuDataService.create({
            user_id,
            prefix: item.original.prefix,
            bucket: item.bucket,
            qiniu_key: item.key,
            qiniu_fsize: item.fsize,
            qiniu_hash: item.hash,
            qiniu_mimeType: item.mimeType,
            qiniu_putTime: item.original.putTime,
          })
        );
      });
      await Promise.all(queue1);
      successHandler({
        ctx,
        data: { ...uploadRes },
        message: `一共上传${fileArr.length}个文件，成功：${uploadRes.success.length}个，失败：${uploadRes.error.length}个`,
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  // 同步七牛云数据到数据库
  syncQiniuData = async (ctx: ParameterizedContext, next) => {
    try {
      const { prefix, force }: any = ctx.request.body;
      if (!QINIU_PREFIX[prefix]) {
        emitError({ ctx, code: 400, error: '错误的prefix' });
        return;
      }
      const { userInfo } = await authJwt(ctx);
      const main = async () => {
        let list = [];
        list = await this.getQiniuListPrefix(prefix);
        list.forEach((v) => {
          const obj = { ...v };
          Object.keys(obj).forEach((key) => {
            obj[`qiniu_${key}`] = `${obj[key]}`;
            delete obj[key];
          });
          console.log(obj, +new Date());
          qiniuDataService.create({
            ...obj,
            bucket: QINIU_BUCKET,
            prefix,
            user_id: userInfo.id,
          });
        });
      };
      if (force === 1) {
        console.log('first');
        await qiniuDataService.batchDelete(prefix);
        await main();
      } else {
        const count = await qiniuDataModel.count({ where: { prefix } });
        if (count) {
          successHandler({
            ctx,
            message: `已经同步过七牛云${prefix}前缀数据了！`,
          });
          return;
        }
        await main();
      }
      successHandler({
        ctx,
        data: `同步七牛云${prefix}前缀数据成功！`,
      });
    } catch (error) {
      console.log(error);
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  // 获取所有七牛云文件
  async getList(ctx: ParameterizedContext, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
        keyWord,
        id,
        user_id,
        prefix,
        bucket,
        qiniu_fsize,
        qiniu_hash,
        qiniu_key,
        qiniu_md5,
        qiniu_mimeType,
        qiniu_putTime,
        qiniu_status,
        qiniu_type,
      }: any = ctx.request.query;
      const result = await qiniuDataService.getList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
        keyWord,
        id,
        user_id,
        prefix,
        bucket,
        qiniu_fsize,
        qiniu_hash,
        qiniu_key,
        qiniu_md5,
        qiniu_mimeType,
        qiniu_putTime,
        qiniu_status,
        qiniu_type,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 批量获取文件信息
  async batchFileInfo(fileList: { srcBucket: string; key: string }[]) {
    const result = await qiniu.batchGetFileInfo(fileList);
    return result;
  }

  // 批量获取文件信息
  getBatchFileInfo = async (ctx: ParameterizedContext, next) => {
    const result = await this.batchFileInfo([
      { srcBucket: 'hssblog', key: 'image/1678937683585girl.jpg' },
      { srcBucket: 'hssblog', key: 'image/1659282130802monorepo.jpg' },
      { srcBucket: 'hssblog', key: 'image/1659282130802monorepo.jpg' },
    ]);
    successHandler({ ctx, data: result });
    await next();
  };

  async delete(ctx: ParameterizedContext, next) {
    try {
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      const id = +ctx.params.id;
      const result = (await qiniuDataService.find(id)) as IQiniuData;
      if (!result) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的资源!` });
        return;
      }
      const qiniudataRes = await qiniuDataService.delete(id);
      const qiniuOfficialRes = await qiniu.delete(
        result.qiniu_key,
        result.bucket
      );
      const cdnUrl = QINIU_CDN_URL + result.qiniu_key;
      successHandler({
        ctx,
        data: `${
          qiniudataRes === 1 ? `id:${id}删除成功` : `id:${id}删除失败`
        }，${
          qiniuOfficialRes.flag ? `${cdnUrl}删除成功` : `${cdnUrl}删除失败`
        }`,
      });
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
      const { respInfo, respBody }: any = await qiniu.getAllList({
        limit,
      });
      let { marker } = respBody;
      const { items } = respInfo.data;
      list.push(...items);
      while (marker) {
        // eslint-disable-next-line no-await-in-loop
        const res: any = await qiniu.getAllList({
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
      const res = await qiniu.uploadBackupsDb();
      successHandler({
        ctx,
        data: res,
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  getQiniuListPrefix = async (prefix: string) => {
    const list = [];
    const limit = 1000;
    const { respInfo, respBody }: any = await qiniu.getListPrefix({
      limit,
      prefix,
    });
    let { marker } = respBody;
    const { items } = respInfo.data;
    list.push(...items);
    while (marker) {
      // eslint-disable-next-line no-await-in-loop
      const res: any = await qiniu.getListPrefix({
        marker,
        limit,
      });
      list.push(...res.respInfo.data.items);
      marker = res.respBody.marker;
    }
    return list;
  };

  getQiniuStat = async (ctx: ParameterizedContext, next) => {
    const { bucket, key } = ctx.request.body;
    const result = await qiniu.getQiniuStat(bucket, key);
    return result;
  };

  // 对比差异
  getDiff = async (ctx: ParameterizedContext, next) => {
    const { prefix }: any = ctx.request.query;
    if (!QINIU_PREFIX[prefix]) {
      emitError({ ctx, code: 400, error: '错误的prefix' });
      return;
    }
    const qiniuOfficialRes = await this.getQiniuListPrefix(prefix);
    const qiniuDataRes = await qiniuDataService.getPrefixList(prefix);
    const qiniuOfficialResMap = {};
    const qiniuDataResMap = {};
    qiniuOfficialRes.forEach((item) => {
      qiniuOfficialResMap[item.key] = item;
    });
    qiniuDataRes.rows.forEach((item) => {
      // @ts-ignore
      qiniuDataResMap[item.qiniu_key] = item;
    });
    const officialDiff = [];
    const qiniudataDiff = [];
    // 遍历七牛云官方文件
    Object.keys(qiniuOfficialResMap).forEach((item) => {
      if (qiniuOfficialResMap[item] && !qiniuDataResMap[item]?.get()) {
        console.log('七牛云官方有的文件但qiniudata没有', item);
        officialDiff.push(item);
      }
    });
    // 遍历qiniudata
    Object.keys(qiniuDataResMap).forEach((item) => {
      if (qiniuDataResMap[item]?.get() && !qiniuOfficialResMap[item]) {
        console.log('qiniudata有的文件但七牛云官方没有', item);
        qiniudataDiff.push(item);
      }
    });

    successHandler({
      ctx,
      data: { officialDiff, qiniudataDiff },
    });
    await next();
  };

  async update(ctx: ParameterizedContext, next) {
    try {
      const { bucket, prefix, qiniu_key }: any = ctx.request.body;
      if (!QINIU_PREFIX[prefix]) {
        emitError({ ctx, code: 400, error: '错误的prefix' });
        return;
      }
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      const id = +ctx.params.id;
      const file: any = await qiniuDataService.find(id);
      if (!file) {
        throw new Error(`不存在id为${id}的文件!`);
      }
      const { flag, respErr, respBody, respInfo } = await qiniu.updateQiniuFile(
        bucket,
        file.qiniu_key,
        QINIU_BUCKET,
        qiniu_key
      );
      if (flag) {
        const result = await qiniu.getQiniuStat(bucket, qiniu_key);
        await qiniuDataService.update({
          id,
          qiniu_key,
          qiniu_fsize: result.respBody.fsize,
          qiniu_md5: result.respBody.md5,
          qiniu_putTime: `${result.respBody.putTime}`,
          qiniu_type: result.respBody.type,
          qiniu_mimeType: result.respBody.mimeType,
          qiniu_hash: result.respBody.hash,
        });
        successHandler({ ctx, data: '更新成功！' });
      } else {
        emitError({ ctx, code: 400, error: { respErr, respBody, respInfo } });
        return;
      }
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  /**
   * 监控cdn流量
   */
  monitCDN() {
    const cdnManager = qiniu.getQiniuCdnManager();
    // 域名列表
    const domains = [
      'img.cdn.hsslive.cn',
      'resoure.cdn.hsslive.cn',
      QINIU_CDN_DOMAIN,
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
