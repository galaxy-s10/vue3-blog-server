import qiniu from 'qiniu';

import { getRandomString } from '.';

import {
  QINIU_ACCESSKEY,
  QINIU_SECRETKEY,
  QINIU_BACKUPS_DATABASE,
} from '@/config/secret';
import { QINIU_BUCKET, QINIU_CDN_URL } from '@/constant';
import { IQiniuData } from '@/interface';

const qiniuConfConfig = new qiniu.conf.Config();

// @ts-ignore
qiniuConfConfig.zone = qiniu.zone.Zone_z2; // https://developer.qiniu.com/kodo/1289/nodejs#general-uptoken，qiniu.zone.Zone_z2代表华南

class QiniuModel {
  config = qiniuConfConfig;

  /**
   * 获取七牛云mac
   * @returns
   */
  getOfflineToken(domain) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const offlineToken = qiniu.util.generateAccessToken(
      mac,
      `https://api.qiniu.com/domain/${domain}/offline`
    );
    return offlineToken;
  }

  /**
   * 获取七牛云cdnManager
   * @returns
   */
  getQiniuCdnManager() {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    return new qiniu.cdn.CdnManager(mac);
  }

  /**
   * 获取七牛云凭证
   * @param expires 过期时间，单位：秒
   * @returns
   */
  getQiniuToken(expires = 60) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const options: qiniu.rs.PutPolicyOptions = {
      scope: QINIU_BUCKET,
      expires, // 过期时间
      // callbackUrl: '',
      returnBody:
        '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","mimeType":"$(mimeType)"}',
      // callbackBody:
      //   '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)","mimeType":"$(mimeType)","user_id":$(x:user_id)}',
      // callbackBodyType: 'application/json',
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);
    return uploadToken;
  }

  uploadBackupsDb(localFileUrl = '') {
    const uploadToken = this.getQiniuToken();
    const { config } = this;
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    const parseLocalFileUrl = localFileUrl.split('/');
    // fileName是根据localFileUrl生成的。
    const fileName =
      QINIU_BACKUPS_DATABASE +
      +new Date() +
      parseLocalFileUrl[parseLocalFileUrl.length - 1];
    return new Promise((resolve, reject) => {
      formUploader.putFile(
        uploadToken,
        fileName,
        localFileUrl,
        putExtra,
        (respErr, respBody, respInfo) => {
          if (respErr) {
            reject(respErr);
            throw respErr;
          }
          if (respInfo.statusCode === 200) {
            resolve({ ...respBody, fileName });
          } else {
            reject({ statusCode: respInfo.statusCode, respBody });
          }
        }
      );
    });
  }

  upload(file: { prefix: string; filepath: string; originalFilename: string }) {
    const uploadToken = this.getQiniuToken();
    const { config } = this;
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();
    const originalKey = `${file.prefix}${+new Date()}__${getRandomString(4)}__${
      file.originalFilename
    }`;
    const { originalFilename, prefix } = file;
    return new Promise<{
      flag: boolean;
      respErr: any;
      respBody: any;
      respInfo: any;
      original: {
        filename: string;
        key: string;
        prefix: string;
      };
    }>((resolve) => {
      formUploader.putFile(
        uploadToken,
        originalKey,
        file.filepath,
        putExtra,
        (respErr, respBody, respInfo) => {
          const obj = {
            respErr,
            respBody,
            respInfo,
            original: {
              filename: originalFilename,
              key: originalKey,
              prefix,
              putTime: `${+new Date()}0000`,
            },
          };
          if (respErr) {
            console.log('respErr');
            resolve({ flag: false, ...obj });
            return;
          }
          if (respInfo.statusCode === 200) {
            console.log('上传成功', obj);
            resolve({ flag: true, ...obj });
          } else {
            console.log('上传失败', obj);
            console.log({ respErr, respBody, respInfo });
            resolve({ flag: false, ...obj });
          }
        }
      );
    });
  }

  // 验证回调是否合法
  authCb(callbackAuth) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    return qiniu.util.isQiniuCallback(
      mac,
      'qiniuCallBackUrl',
      null,
      callbackAuth
    );
  }

  // 删除七牛云文件
  delete(key: IQiniuData['qiniu_key'], bucket: IQiniuData['bucket']) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const config = new qiniu.conf.Config();
    // config.useHttpsDomain = true;
    // @ts-ignore
    config.zone = qiniu.zone.Zone_z0;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    return new Promise<{ flag: boolean; respErr; respInfo; respBody }>(
      (resolve) => {
        bucketManager.delete(bucket, key, (respErr, respBody, respInfo) => {
          if (respInfo.statusCode === 200) {
            resolve({ flag: true, respErr, respInfo, respBody });
          } else {
            resolve({ flag: false, respErr, respInfo, respBody });
          }
        });
      }
    );
  }

  batchGetFileInfo(fileList: any[]) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const config = new qiniu.conf.Config();
    // @ts-ignore
    config.zone = qiniu.zone.Zone_z0;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    // 每个operations的数量不可以超过1000个，如果总数量超过1000，需要分批发送
    const statOperations = fileList.map((item) => {
      return qiniu.rs.statOp(item.srcBucket, item.key);
    });
    return new Promise((resolve) => {
      bucketManager.batch(statOperations, (respErr, respBody, respInfo) => {
        const obj = {
          respErr,
          respBody,
          respInfo,
        };
        if (obj.respErr) {
          console.log(obj.respErr);
          resolve({ flag: false, ...obj });
        } else if (parseInt(`${respInfo.statusCode / 100}`, 10) === 2) {
          // 200 is success, 298 is part success
          const result = { success: [], error: [] };
          respBody.forEach((item) => {
            if (item.code === 200) {
              result.success.push(item.data);
            } else {
              result.error.push(item.data);
            }
          });
          resolve({ flag: true, result, respBody, respInfo });
        } else {
          console.log(respInfo, respBody);
          resolve({ flag: false, ...obj });
        }
      });
    });
  }

  // 获取文件信息
  getQiniuStat(bucket, key) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const { config } = this;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    return new Promise<{
      flag: boolean;
      respErr: any;
      respBody: any;
      respInfo: any;
    }>((resolve) => {
      bucketManager.stat(bucket, key, (respErr, respBody, respInfo) => {
        const obj = { respErr, respBody, respInfo };
        if (respErr) {
          resolve({ flag: false, ...obj });
          return;
        }
        if (respInfo.statusCode === 200) {
          resolve({ flag: true, ...obj });
        } else {
          console.log(obj);
          resolve({ flag: false, ...obj });
        }
      });
    });
  }

  // 获取七牛云文件
  getListPrefix(prop: qiniu.rs.ListPrefixOptions) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const { config } = this;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);
    const bucket = QINIU_BUCKET;
    const options = {
      prefix: prop.prefix, // 列举的文件前缀
      marker: prop.marker, // 上一次列举返回的位置标记，作为本次列举的起点信息
      limit: prop.limit, // 每次返回的最大列举文件数量，最大值1000
      delimiter: prop.delimiter, // 指定目录分隔符
    };
    return new Promise<{
      flag: boolean;
      respErr: any;
      respBody: any;
      respInfo: any;
    }>((resolve) => {
      bucketManager.listPrefix(
        bucket,
        options,
        (respErr, respBody, respInfo) => {
          const obj = { respErr, respBody, respInfo };
          if (respInfo.statusCode === 200) {
            resolve({ flag: true, ...obj });
          } else {
            console.log(obj);
            resolve({ flag: false, ...obj });
          }
        }
      );
    });
  }

  /**
   * @description 移动或重命名文件
   * @param srcBucket 源空间名称
   * @param srcKey 源文件名称
   * @param destBucket 目标空间名称
   * @param destKey 目标文件名称
   * @return {*}
   */
  updateQiniuFile(srcBucket, srcKey, destBucket, destKey) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const { config } = this;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    const options = {
      force: false, // true强制覆盖已有同名文件；false:不强制覆盖已有同名文件
    };
    return new Promise<{ flag: boolean; respErr; respBody; respInfo }>(
      (resolve) => {
        bucketManager.move(
          srcBucket,
          srcKey,
          destBucket,
          destKey,
          options,
          (respErr, respBody, respInfo) => {
            if (respInfo.statusCode === 200) {
              resolve({ flag: true, respErr, respBody, respInfo });
            } else {
              resolve({ flag: false, respErr, respBody, respInfo });
            }
          }
        );
      }
    );
  }
}

export default new QiniuModel();
