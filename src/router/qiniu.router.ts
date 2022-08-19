import Router from 'koa-router';

import qiniuController from '@/controller/qiniu.controller';

const qiniuRouter = new Router({ prefix: '/qiniu_data' });

// 获取token
// qiniuRouter.get('/get_token', qiniuController.getToken);

// upload
// qiniuRouter.post('/upload', qiniuController.uploadBackupsDb);

qiniuRouter.get('/list', qiniuController.getList);

qiniuRouter.get('/init_sync_qiniu_data', qiniuController.initSyncQiniuData);

export default qiniuRouter;
