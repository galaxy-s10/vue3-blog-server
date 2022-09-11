import Router from 'koa-router';

import qiniuController from '@/controller/qiniuData.controller';
import { verifyEnv } from '@/middleware/qiniuData.middleware';

const qiniuRouter = new Router({ prefix: '/qiniu_data' });

// 获取token
// qiniuRouter.get('/get_token', qiniuController.getToken);

// 上传文件，只支持一次性上传一个文件
qiniuRouter.post('/upload', verifyEnv, qiniuController.upload);

// 上传chunk
qiniuRouter.post('/upload_chunk', verifyEnv, qiniuController.uploadChunk);

// 合并chunk
qiniuRouter.post('/merge_chunk', verifyEnv, qiniuController.mergeChunk);

// 上传文件，只支持一次性上传多个文件
qiniuRouter.post('/mulit_upload', verifyEnv, qiniuController.upload);

// 文件进度
qiniuRouter.get('/progress', qiniuController.getProgress);

qiniuRouter.get('/diff', verifyEnv, qiniuController.getDiff);

qiniuRouter.get('/batch_list', verifyEnv, qiniuController.getBatchFileInfo);

qiniuRouter.get('/list', qiniuController.getList);

qiniuRouter.delete('/delete/:id', verifyEnv, qiniuController.delete);

qiniuRouter.delete(
  '/delete_by_qiniukey',
  verifyEnv,
  qiniuController.deleteByQiniuKey
);

qiniuRouter.put('/update/:id', verifyEnv, qiniuController.update);

qiniuRouter.post('/sync_qiniu_data', verifyEnv, qiniuController.syncQiniuData);

export default qiniuRouter;
