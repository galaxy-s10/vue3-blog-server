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
    // const fileName = 'a.jpg';
    const fileName = `${file.prefix}${+new Date()}__${getRandomString(4)}__${
      file.originalFilename
    }`;
    return new Promise((resolve) => {
      formUploader.putFile(
        uploadToken,
        fileName,
        file.filepath,
        putExtra,
        (respErr, respBody, respInfo) => {
          const obj = {
            respErr,
            respBody,
            respInfo,
            originalFilename: file.originalFilename,
            resultFilename: QINIU_CDN_URL + fileName,
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
  delete(filename: IQiniuData['qiniu_key'], bucket: IQiniuData['bucket']) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const config = new qiniu.conf.Config();
    // config.useHttpsDomain = true;
    // @ts-ignore
    config.zone = qiniu.zone.Zone_z0;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    const key = filename;
    return new Promise((resolve, reject) => {
      bucketManager.delete(bucket, key, (err, respBody, respInfo) => {
        if (respInfo.statusCode === 200) {
          resolve({ respInfo, respBody });
        } else {
          reject(new Error(JSON.stringify(respInfo)));
        }
      });
    });
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
        console.log(
          parseInt(`${respInfo.statusCode / 100}`, 2),
          parseInt(`200.32`, 10),
          respInfo.statusCode / 100,
          1111
        );
        if (obj.respErr) {
          console.log(obj.respErr);
          resolve({ flag: false, ...obj });
        } else if (parseInt(`${respInfo.statusCode / 100}`, 10) === 2) {
          // 200 is success, 298 is part success
          respBody.forEach((item) => {
            if (item.code === 200) {
              console.log(
                `${item.data.fsize}\t${item.data.hash}\t${item.data.mimeType}\t${item.data.putTime}\t${item.data.type}`
              );
            } else {
              console.log(`${item.code}\t${item.data.error}`);
            }
          });
          resolve({ flag: true, ...obj });
        } else {
          console.log(respInfo, respBody);
          resolve({ flag: false, ...obj });
        }
      });
    });
  }

  // 获取七牛云文件
  getAllList(prop: qiniu.rs.ListPrefixOptions) {
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
    return new Promise((resolve, reject) => {
      bucketManager.listPrefix(bucket, options, (err, respBody, respInfo) => {
        if (respInfo.statusCode === 200) {
          resolve({ respInfo, respBody });
        } else {
          console.log('respInfo', respInfo);
          console.log('err', err);
          reject(new Error(JSON.stringify(respInfo)));
        }
      });
    });
  }

  // 修改七牛云文件
  updateQiniu(srcBucket, srcKey, destBucket, destKey) {
    const mac = new qiniu.auth.digest.Mac(QINIU_ACCESSKEY, QINIU_SECRETKEY);
    const { config } = this;
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    // var srcBucket;      //源空间
    // var srcKey;        //源空间文件
    // var destBucket;    //目标空间
    // var destKey;       //目标空间文件

    // 强制覆盖已有同名文件
    const options = {
      force: false, // true强制覆盖/false:不强制覆盖
    };
    return new Promise((resolve, reject) => {
      bucketManager.move(
        srcBucket,
        srcKey,
        destBucket,
        destKey,
        options,
        (err, respBody, respInfo) => {
          if (respInfo.statusCode === 200) {
            resolve({ respInfo });
          } else {
            reject({ err });
          }
        }
      );
    });
  }
}

export default new QiniuModel();
