import Article from './article.model';
import ArticleTag from './articleTag.model';
import ArticleType from './articleType.model';
import Auth from './auth.model';
import Comment from './comment.model';
import DayData from './dayData.model';
import Log from './log.model';
import QiniuData from './qiniuData.model';
import Role from './role.model';
import RoleAuth from './roleAuth.model';
import Star from './star.model';
import Tag from './tag.model';
import ThirdUser from './thirdUser.model';
import Type from './type.model';
import User from './user.model';
import UserArticle from './userArticle.model';
import UserRole from './userRole.model';
import VisitorLog from './visitorLog.model';

// 一对一关联：belongsTo，hasOne
// 一对多关联：hasMany
// 多对多关联：belongsToMany

Comment.belongsTo(User, {
  as: 'from_user',
  foreignKey: 'from_user_id',
  targetKey: 'id',
});
Comment.belongsTo(User, {
  as: 'to_user',
  foreignKey: 'to_user_id',
  targetKey: 'id',
});

// Article有很多Comment,也就是Article是主键表,Comment是外键表。外键在Comment表里,主键在Article里
Article.hasMany(Comment, { foreignKey: 'article_id', sourceKey: 'id' });
// Comment属于Article,也就是Article是主键表,Comment是外键表。外键在Comment表里,主键在Article表里
Comment.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' });

Tag.hasMany(ArticleTag, { foreignKey: 'tag_id', sourceKey: 'id' });
ArticleTag.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' });
ArticleTag.belongsTo(Tag, { foreignKey: 'tag_id', targetKey: 'id' });

Article.belongsToMany(Tag, {
  through: ArticleTag,
  foreignKey: 'article_id',
  otherKey: 'tag_id',
});
Tag.belongsToMany(Article, {
  through: ArticleTag,
  foreignKey: 'tag_id',
  otherKey: 'article_id',
});

// 2020-11-08新增
UserRole.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
UserRole.belongsTo(Role, { foreignKey: 'role_id', targetKey: 'id' });

RoleAuth.belongsTo(Auth, { foreignKey: 'auth_id', targetKey: 'id' });
RoleAuth.belongsTo(Role, { foreignKey: 'role_id', targetKey: 'id' });

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
});
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
});

UserRole.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });
UserRole.belongsTo(Role, { foreignKey: 'role_id', targetKey: 'id' });

Role.belongsToMany(Auth, {
  through: RoleAuth,
  foreignKey: 'role_id',
  otherKey: 'auth_id',
});
Auth.belongsToMany(Role, {
  through: RoleAuth,
  foreignKey: 'auth_id',
  otherKey: 'role_id',
});

User.hasMany(Log, { foreignKey: 'user_id', sourceKey: 'id' });
Log.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });

Role.belongsTo(Role, { as: 'p_role', foreignKey: 'p_id', sourceKey: 'id' });
// Role.hasMany(Role, { as: "h_role", foreignKey: 'id', sourceKey: 'p_id' })
Auth.hasMany(Auth, { foreignKey: 'id', sourceKey: 'p_id' }); // ??????

// 点赞
Star.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' });
Star.belongsTo(Comment, { foreignKey: 'comment_id', targetKey: 'id' });
Star.belongsTo(User, { foreignKey: 'from_user_id', targetKey: 'id' });

Article.hasMany(Star, { foreignKey: 'article_id', sourceKey: 'id' });
User.hasMany(Star, { foreignKey: 'to_user_id', sourceKey: 'id' });
User.hasMany(Star, {
  as: 'userHasStar',
  foreignKey: 'to_user_id',
  sourceKey: 'id',
});

Comment.hasMany(Star, { foreignKey: 'comment_id', sourceKey: 'id' });

Star.belongsTo(User, {
  as: 'from_user',
  foreignKey: 'from_user_id',
  targetKey: 'id',
});
Star.belongsTo(User, {
  as: 'to_user',
  foreignKey: 'to_user_id',
  targetKey: 'id',
});

// 评论回复
// Comment.belongsTo(Comment, { as: "huifu", foreignKey: "to_comment_id", targetKey: "id" })
// 自连接的源键其实可以不写，不写默认就是mode里定义的主键
// Comment.hasMany(Comment, { as: "huifu", foreignKey: "to_comment_id", sourceKey: "id" })
Comment.hasMany(Comment, {
  as: 'huifu',
  foreignKey: 'to_comment_id',
  sourceKey: 'id',
});
Comment.hasMany(Comment, {
  as: 'huifucount',
  foreignKey: 'to_comment_id',
  sourceKey: 'id',
});

// UserArticle.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' })
// UserArticle.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' })
// Article.hasOne(UserArticle, { foreignKey: 'article_id', targetKey: 'id' })
Article.belongsToMany(User, {
  through: UserArticle,
  foreignKey: 'article_id',
  otherKey: 'user_id',
});
// Article.belongsToMany(User, { through: UserArticle, as: 'ppp', foreignKey: 'article_id', otherKey: 'user_id' })
User.belongsToMany(Article, {
  through: UserArticle,
  foreignKey: 'user_id',
  otherKey: 'article_id',
});
// User.belongsToMany(Article, { through: UserArticle, as: 'qqq',foreignKey: 'user_id', otherKey: 'article_id' })

User.hasMany(UserArticle, { foreignKey: 'user_id', sourceKey: 'id' });
UserArticle.belongsTo(User, { foreignKey: 'id', sourceKey: 'user_id' });

// Type.hasMany(ArticleType, { foreignKey: 'tag_id', sourceKey: 'id' })
ArticleType.belongsTo(Article, { foreignKey: 'article_id', targetKey: 'id' });
ArticleType.belongsTo(Type, { foreignKey: 'type_id', targetKey: 'id' });

Article.belongsToMany(Type, {
  through: ArticleType,
  foreignKey: 'article_id',
  otherKey: 'type_id',
});
Type.belongsToMany(Article, {
  through: ArticleType,
  foreignKey: 'type_id',
  otherKey: 'article_id',
});

QiniuData.belongsTo(User, { foreignKey: 'user_id', targetKey: 'id' });

// 流量统计
// Day.hasMany(VisitorLog, { foreignKey: "day2", sourceKey: "createdAt" })
VisitorLog.belongsTo(DayData, {
  foreignKey: 'createdAt',
  sourceKey: 'today',
});

// 用户多平台
User.hasMany(ThirdUser, { foreignKey: 'userid', sourceKey: 'id' });
ThirdUser.belongsTo(User, { foreignKey: 'id', sourceKey: 'userid' });
