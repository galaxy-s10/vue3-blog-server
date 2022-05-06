import { IFrontend } from '@/interface';
import articleModel from '@/model/article.model';
import commentModel from '@/model/comment.model';
import frontendModel from '@/model/frontend.model';
import qqUserModel from '@/model/qqUser.model';
import userModel from '@/model/user.model';

class FrontendService {
  /** 查找前端设置 */
  async find(id: number) {
    const article_total = await articleModel.count();
    const article_read_total = await articleModel.sum('click');
    const comment_total = await commentModel.count();
    const user_total = await userModel.count();
    const qq_user_total = await qqUserModel.count();
    const result = await frontendModel.findOne({ where: { id } });
    return {
      frontend: result,
      user: {
        total: user_total,
      },
      qq_user: {
        total: qq_user_total,
      },
      article: {
        total: article_total,
        read: article_read_total,
      },
      comment: {
        total: comment_total,
      },
    };
  }

  /** 修改前端设置 */
  async update({
    id,
    frontend_about,
    frontend_comment,
    frontend_link,
    frontend_qq_login,
    frontend_github_login,
    frontend_email_login,
    frontend_dialog,
    frontend_dialog_content,
  }: IFrontend) {
    const result = await frontendModel.update(
      {
        frontend_about,
        frontend_comment,
        frontend_link,
        frontend_qq_login,
        frontend_github_login,
        frontend_email_login,
        frontend_dialog,
        frontend_dialog_content,
      },
      { where: { id } }
    );
    return result;
  }
}

export default new FrontendService();
