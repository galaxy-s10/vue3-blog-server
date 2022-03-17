import Router from 'koa-router';

import qiniuController from '@/controller/qiniu.controller';

const qiniuRouter = new Router({ prefix: '/qiniu' });

// 获取token
// qiniuRouter.get('/get_token', qiniuController.getToken);

// upload
// qiniuRouter.post('/upload', qiniuController.uploadBackupsDb);

export default qiniuRouter;
