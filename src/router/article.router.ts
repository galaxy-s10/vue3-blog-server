import Router from 'koa-router';
import articleController from '@/controller/article.controller';
import { verifyProp } from '@/middleware/article.middleware';

const articleRouter = new Router({ prefix: '/article' });

// 文章列表
articleRouter.get('/list', articleController.getList);

// 搜索文章列表
articleRouter.get('/keyword_list', articleController.getKeywordList);

// 查找文章
articleRouter.get('/find/:id', articleController.find);

// 新增文章
articleRouter.post('/create', verifyProp, articleController.create);

export default articleRouter;
