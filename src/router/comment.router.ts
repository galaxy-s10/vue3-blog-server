import Router from 'koa-router';

import commentController from '@/controller/comment.controller';
import { verifyProp } from '@/middleware/comment.middleware';

const commentRouter = new Router({ prefix: '/comment' });

// 评论列表
commentRouter.get('/list', commentController.getList);

// 文章评论列表
commentRouter.get(
  '/article/:article_id',
  commentController.getArticleCommentList
);

// 留言板评论列表
commentRouter.get('/comment', commentController.getCommentList);

// 子级评论列表
commentRouter.get('/child_comment', commentController.getChildrenCommentList);

// 创建评论
commentRouter.post('/create', verifyProp, commentController.create);

// 查找评论
commentRouter.get('/find/:id', commentController.find);

// 更新评论
commentRouter.put('/update/:id', commentController.update);

// 删除评论
commentRouter.delete('/delete/:id', commentController.delete);

export default commentRouter;
