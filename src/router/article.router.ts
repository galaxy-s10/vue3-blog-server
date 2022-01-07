import Router from 'koa-router';
import articleController from '../controller/article.controller';
import { verifyProp } from '../middleware/article.middleware';

const articleRouter = new Router({ prefix: '/article' });

articleRouter.post('/create', verifyProp, articleController.create);
articleRouter.get('/list', articleController.list);
export default articleRouter;
