import fs from 'fs';

import dayjs from 'dayjs';
import {
  remove,
  copySync,
  readdirSync,
  appendFileSync,
  readFileSync,
  removeSync,
  existsSync,
  emptyDirSync,
  ensureDirSync,
  pathExistsSync,
} from 'fs-extra';
import { ParameterizedContext } from 'koa';

import redisController from './redis.controller';

import { authJwt } from '@/app/auth/authJwt';
import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import {
  ALLOW_HTTP_CODE,
  ERROR_HTTP_CODE,
  QINIU_BUCKET,
  QINIU_CDN_DOMAIN,
  QINIU_CDN_URL,
  QINIU_PREFIX,
  REDIS_PREFIX,
  uploadDir,
} from '@/constant';
import { IList, IQiniuData } from '@/interface';
import { CustomError } from '@/model/customError.model';
import qiniuDataModel from '@/model/qiniuData.model';
import qiniuDataService from '@/service/qiniuData.service';
import {
  formatMemorySize,
  getFileExt,
  getLastestWeek,
  getRandomString,
} from '@/utils';
import { chalkWARN } from '@/utils/chalkTip';
import qiniu, { IQiniuKey } from '@/utils/qiniu';

class QiniuController {
  async getToken(ctx: ParameterizedContext, next) {
    const token = qiniu.getQiniuToken();
    successHandler({
      ctx,
      data: token,
      message: '获取七牛云token成功，有效期1小时？',
    });

    await next();
  }

  mergeChunk = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const { hash, ext } = ctx.request.query as { hash: string; ext: string };
    const resultPath = `${uploadDir + hash}.${ext}`;
    const chunkDir = uploadDir + hash;
    // 判断是否是目录
    if (fs.statSync(chunkDir).isDirectory()) {
      const bufferArr: Buffer[] = [];
      // 读取目录
      readdirSync(chunkDir)
        .sort((a: string, b: string) => +a - +b)
        .forEach((v) => {
          const buffer = Buffer.from(readFileSync(`${chunkDir}/${v}`));
          bufferArr.push(buffer);
        });
      // 将buffer数组写入到resultPath
      fs.writeFileSync(resultPath, Buffer.concat(bufferArr));
      // 删除chunk目录
      removeSync(uploadDir + hash);
      successHandler({
        ctx,
        code: 1,
        message: '合并成功！',
      });
    } else {
      successHandler({
        ctx,
        code: 2,
        message: `合并失败！${chunkDir}目录不存在！`,
      });
    }

    next();
  };

  uploadChunk = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const {
      prefix,
      hash,
      ext,
      chunkName,
      chunkTotal,
    }: {
      prefix: string;
      hash: string;
      ext: string;
      chunkName: string;
      chunkTotal: string;
    } = ctx.request.body;
    const key = prefix + hash;
    const { flag } = await qiniu.getQiniuStat(QINIU_BUCKET, key);
    if (flag) {
      console.log('文件已存在，直接copy');
      const destKey = `${prefix + hash}__${getRandomString(4)}.${ext}`;
      const res = await qiniu.copy({
        srcBucket: QINIU_BUCKET,
        srcKey: key,
        destBucket: QINIU_BUCKET,
        destKey,
      });
      successHandler({
        ctx,
        code: 1,
        message: '秒传',
      });
      await next();
    }
    const { uploadFiles } = ctx.request.files!;
    if (!uploadFiles) {
      throw new CustomError(
        '请传入uploadFiles！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    if (Array.isArray(uploadFiles)) {
      throw new CustomError(
        'uploadFiles不能是数组！',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const fileInfo = {
      prefix,
      hash,
      filepath: uploadFiles.filepath,
      originalFilename: uploadFiles.originalFilename,
    };
    try {
      const destHashDir = uploadDir + hash;
      const destHashChunk = `${destHashDir}/${chunkName}`;
      ensureDirSync(destHashDir);
      if (existsSync(destHashChunk)) {
        const num = readdirSync(destHashDir).length;
        const percentage = ((num / +chunkTotal) * 100) / 2;
        console.log(num, '当前num');
        // 删除临时文件
        remove(fileInfo?.filepath);
        successHandler({
          ctx,
          data: {
            code: 2,
            percentage,
            message: `${hash}/${chunkName}已存在！`,
          },
        });
      }
      copySync(fileInfo.filepath, destHashChunk);
      removeSync(fileInfo.filepath);
      const num = readdirSync(destHashDir).length;
      const percentage = ((num / +chunkTotal) * 100) / 2;
      console.log(num, '当前num');

      const info = {
        type: REDIS_PREFIX.fileProgress,
        hash,
        percentage,
      };
      await redisController.setVal({
        prefix: REDIS_PREFIX.fileProgress,
        key: hash,
        value: JSON.stringify(info),
        exp: 24 * 60 * 60,
      });
      successHandler({
        ctx,
        data: {
          code: 1,
          percentage,
          message: `${hash}/${chunkName}上传成功！`,
        },
      });
      await next();
    } catch (error: any) {
      // 删除临时文件
      remove(fileInfo?.filepath);
      throw new CustomError(error?.message);
    }
  };

  upload = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const { hash, ext } = ctx.request.query as { hash: string; ext: string };
    const res = await qiniu.upload({
      ext,
      prefix: QINIU_PREFIX['image/'],
      hash,
    });
    successHandler({
      ctx,
      data: res,
    });
    next();
  };

  upload2 = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const { prefix, hash }: { prefix: string; hash: string } = ctx.request.body;
    const { uploadFiles } = ctx.request.files!;
    const fileArr: {
      prefix: string;
      hash: string;
      filepath: string;
      originalFilename: string | null;
    }[] = [];

    try {
      if (!uploadFiles) {
        throw new CustomError(
          '请传入uploadFiles！',
          ALLOW_HTTP_CODE.paramsError,
          ALLOW_HTTP_CODE.paramsError
        );
      }
      // TODO: 传多个文件的话，hash会有问题！待优化
      console.log('当前是数组吗', Array.isArray(uploadFiles));
      if (!Array.isArray(uploadFiles)) {
        fileArr.push({
          prefix,
          hash,
          filepath: uploadFiles.filepath,
          originalFilename: uploadFiles.originalFilename,
        });
      }
      fileArr.forEach((v) => {
        const ext = getFileExt(v.filepath);
        copySync(v.filepath, `${uploadDir + hash}.${ext}`);
      });
      const queue: Promise<any>[] = [];
      fileArr.forEach((v: any) => {
        queue.push(qiniu.upload(v));
      });
      const queueRes = await Promise.all(queue);
      const uploadRes: { success: any[]; error: any[] } = {
        success: [],
        error: [],
      };
      queueRes.forEach((v) => {
        if (v.flag) {
          uploadRes.success.push({
            respBody: v.respBody,
            original: v.original,
            url: QINIU_CDN_URL + (v.respBody.key as string),
            hash: v.hash,
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
      const queue1: any = [];
      uploadRes.success.forEach((item) => {
        queue1.push(
          qiniuDataService.create({
            user_id: userInfo!.id,
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
      uploadRes.success.forEach((v) => {
        // 删除redis记录
        redisController.del({ prefix: REDIS_PREFIX.fileProgress, key: v.hash });
      });
      successHandler({
        ctx,
        data: { ...uploadRes },
        message: `一共上传${fileArr.length}个文件，成功：${uploadRes.success.length}个，失败：${uploadRes.error.length}个`,
      });

      await next();
    } catch (error) {
      console.log(uploadFiles);
      console.log(error, fileArr.length, 9999);
      fileArr.forEach((v) => {
        // 删除临时文件
        remove(v.filepath);
      });
      // successHandler({ ctx, data: 'result' });
      // await next();
      // throw CustomError()
    }
  };

  upload1 = async (ctx: ParameterizedContext, next) => {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const { prefix, hash }: { prefix: string; hash: string } = ctx.request.body;
    const { uploadFiles } = ctx.request.files!;
    const fileArr: {
      prefix: string;
      hash: string;
      filepath: string;
      originalFilename: string | null;
    }[] = [];

    try {
      if (!uploadFiles) {
        throw new CustomError(
          '请传入uploadFiles！',
          ALLOW_HTTP_CODE.paramsError,
          ALLOW_HTTP_CODE.paramsError
        );
      }
      // TODO: 传多个文件的话，hash会有问题！待优化
      console.log('当前是数组吗', Array.isArray(uploadFiles));
      if (!Array.isArray(uploadFiles)) {
        fileArr.push({
          prefix,
          hash,
          filepath: uploadFiles.filepath,
          originalFilename: uploadFiles.originalFilename,
        });
      }
      fileArr.forEach((v) => {
        const ext = getFileExt(v.filepath);
        copySync(v.filepath, `${uploadDir + hash}.${ext}`);
      });
      const queue: Promise<any>[] = [];
      fileArr.forEach((v: any) => {
        queue.push(qiniu.upload(v));
      });
      const queueRes = await Promise.all(queue);
      const uploadRes: { success: any[]; error: any[] } = {
        success: [],
        error: [],
      };
      queueRes.forEach((v) => {
        if (v.flag) {
          uploadRes.success.push({
            respBody: v.respBody,
            original: v.original,
            url: QINIU_CDN_URL + (v.respBody.key as string),
            hash: v.hash,
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
      const queue1: any = [];
      uploadRes.success.forEach((item) => {
        queue1.push(
          qiniuDataService.create({
            user_id: userInfo!.id,
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
      uploadRes.success.forEach((v) => {
        // 删除redis记录
        redisController.del({ prefix: REDIS_PREFIX.fileProgress, key: v.hash });
      });
      successHandler({
        ctx,
        data: { ...uploadRes },
        message: `一共上传${fileArr.length}个文件，成功：${uploadRes.success.length}个，失败：${uploadRes.error.length}个`,
      });

      await next();
    } catch (error) {
      console.log(uploadFiles);
      console.log(error, fileArr.length, 9999);
      fileArr.forEach((v) => {
        // 删除临时文件
        remove(v.filepath);
      });
      // successHandler({ ctx, data: 'result' });
      // await next();
      // throw CustomError()
    }
  };

  // 同步七牛云数据到数据库
  syncQiniuData = async (ctx: ParameterizedContext, next) => {
    const { prefix, force }: { prefix: string; force: number } =
      ctx.request.body;
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    if (!QINIU_PREFIX[prefix]) {
      throw new CustomError(
        '错误的prefix',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const main = async () => {
      let list = [];
      list = await this.getQiniuListPrefix(prefix);
      list.forEach((v: any) => {
        const obj = { ...v };
        Object.keys(obj).forEach((key) => {
          // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
          obj[`qiniu_${key}`] = `${obj[key]}`;
          delete obj[key];
        });
        console.log(obj, +new Date());
        qiniuDataService.create({
          ...obj,
          bucket: QINIU_BUCKET,
          prefix,
          user_id: userInfo!.id,
        });
      });
    };
    if (force === 1) {
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
    await next();
  };

  // 获取所有七牛云文件
  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
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
    }: IList<IQiniuData> = ctx.request.query;
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

    await next();
  }

  // 批量获取文件信息
  async batchFileInfo(fileList: { srcBucket: string; key: string }[]) {
    const result = await qiniu.batchGetFileInfo(fileList);
    return result;
  }

  // 获取文件上传进度
  getProgress = async (ctx: ParameterizedContext, next) => {
    // @ts-ignore
    const { prefix, hash, ext }: IQiniuKey = ctx.request.query;
    const key = `${prefix + hash}.${ext}`;
    const { flag } = await qiniu.getQiniuStat(QINIU_BUCKET, key);
    console.log(prefix, hash, ext, flag, '---');
    if (flag) {
      successHandler({
        code: 3,
        ctx,
        message: '文件已存在，无需merge，请直接调用upload',
      });
    } else {
      const redisData = await redisController.getVal({
        prefix: REDIS_PREFIX.fileProgress,
        key: hash,
      });
      if (redisData) {
        successHandler({
          code: 1,
          ctx,
          data: JSON.parse(redisData),
          message: '获取上传进度成功！',
        });
      } else {
        successHandler({
          code: 2,
          ctx,
          message: `没有该文件的上传进度！`,
        });
      }
    }
    await next();
  };

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
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const result = (await qiniuDataService.find(id)) as IQiniuData;
    if (!result) {
      throw new CustomError(
        `不存在id为${id}的资源！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const qiniudataRes = await qiniuDataService.delete(id);
    const qiniuOfficialRes = await qiniu.delete(
      result.qiniu_key,
      result.bucket
    );
    const cdnUrl = QINIU_CDN_URL + result.qiniu_key!;
    successHandler({
      ctx,
      data: `${qiniudataRes === 1 ? `id:${id}删除成功` : `id:${id}删除失败`}，${
        qiniuOfficialRes.flag ? `${cdnUrl}删除成功` : `${cdnUrl}删除失败`
      }`,
    });

    await next();
  }

  async deleteByQiniuKey(ctx: ParameterizedContext, next) {
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const { qiniu_key } = ctx.request.query as {
      qiniu_key: string;
    };
    const result = (await qiniuDataService.findByQiniuKey(
      qiniu_key
    )) as IQiniuData;
    if (!result) {
      throw new CustomError(
        `不存在${qiniu_key}的资源！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const { id } = result;
    const qiniudataRes = await qiniuDataService.delete(id!);
    const qiniuOfficialRes = await qiniu.delete(
      result.qiniu_key,
      result.bucket
    );
    const cdnUrl = QINIU_CDN_URL + result.qiniu_key!;
    successHandler({
      ctx,
      data: `${
        qiniudataRes === 1 ? `id:${id!}删除成功` : `id:${id!}删除失败`
      }，${qiniuOfficialRes.flag ? `${cdnUrl}删除成功` : `${cdnUrl}删除失败`}`,
    });

    await next();
  }

  getQiniuListPrefix = async (prefix: string) => {
    const list: any = [];
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

  // 对比差异
  getDiff = async (ctx: ParameterizedContext, next) => {
    const { prefix }: any = ctx.request.query;
    if (!QINIU_PREFIX[prefix]) {
      throw new CustomError(
        '错误的prefix',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
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
    const officialDiff: any = [];
    const qiniudataDiff: any = [];
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
    const { code, userInfo, message } = await authJwt(ctx);
    if (code !== ALLOW_HTTP_CODE.ok) {
      throw new CustomError(message, code, code);
    }
    if (userInfo!.id !== 1) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const { bucket, prefix, qiniu_key }: any = ctx.request.body;
    if (!QINIU_PREFIX[prefix]) {
      throw new CustomError(
        '错误的prefix',
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(
        '权限不足！',
        ALLOW_HTTP_CODE.forbidden,
        ALLOW_HTTP_CODE.forbidden
      );
    }
    const id = +ctx.params.id;
    const file: any = await qiniuDataService.find(id);
    if (!file) {
      throw new CustomError(
        `不存在id为${id}的文件！`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
    }
    // eslint-disable-next-line
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
        qiniu_putTime: String(result.respBody.putTime),
        qiniu_type: result.respBody.type,
        qiniu_mimeType: result.respBody.mimeType,
        qiniu_hash: result.respBody.hash,
      });
      successHandler({ ctx, data: '更新成功！' });
    } else {
      throw new CustomError(
        `更新失败`,
        ALLOW_HTTP_CODE.paramsError,
        ALLOW_HTTP_CODE.paramsError
      );
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
              const fluxChina: number = (fluxDataOfDomain.china || []).reduce(
                (pre: number, val: number) => pre + val,
                0
              );
              const fluxOversea: number = (
                fluxDataOfDomain.oversea || []
              ).reduce((pre: number, val: number) => pre + val, 0);
              // console.log(`域名: ${domain}使用的国内流量:`, fluxChina);
              // console.log(`域名: ${domain}使用的海外流量:`, fluxOversea);
              console.log(
                chalkWARN(
                  `域名:${domain}最近一周使用的总流量:${formatMemorySize(
                    fluxChina + fluxOversea
                  )}`
                )
              );
              allDomainNameFlux += fluxChina + fluxOversea;
            } else {
              console.log(chalkWARN(`域名: ${domain}最近一周没有流量数据`));
            }
          });
          console.log(
            chalkWARN(
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
