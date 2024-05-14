import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IGithubUser } from '@/interface';
import { initTable } from '@/utils';

interface GithubUserModel
  extends Model<
      InferAttributes<GithubUserModel>,
      InferCreationAttributes<GithubUserModel>
    >,
    IGithubUser {}

const model = sequelize.define<GithubUserModel>(
  'github_user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    client_id: {
      // https://github.com/settings/applications里面的Client ID
      type: DataTypes.STRING(500),
    },
    login: {
      type: DataTypes.STRING(500),
    },
    github_id: {
      type: DataTypes.INTEGER,
    },
    node_id: {
      type: DataTypes.STRING(500),
    },
    avatar_url: {
      type: DataTypes.STRING(500),
    },
    gravatar_id: {
      type: DataTypes.STRING(500),
    },
    url: {
      type: DataTypes.STRING(500),
    },
    html_url: {
      type: DataTypes.STRING(500),
    },
    type: {
      type: DataTypes.STRING(500),
    },
    site_admin: {
      type: DataTypes.STRING(500),
    },
    name: {
      // 用户的新名称。
      type: DataTypes.STRING(500),
    },
    company: {
      // 用户的新公司。
      type: DataTypes.STRING(500),
    },
    blog: {
      // 用户的新博客 URL。
      type: DataTypes.STRING(500),
    },
    location: {
      // 用户的新位置。
      type: DataTypes.STRING(500),
    },
    email: {
      // 用户公开可见的电子邮件地址。
      type: DataTypes.STRING(500),
    },
    hireable: {
      // 用户的新招聘可用性。
      type: DataTypes.STRING(500),
    },
    bio: {
      // 用户的新短传。
      type: DataTypes.STRING(500),
    },
    twitter_username: {
      // 用户的新 Twitter 用户名。
      type: DataTypes.STRING(500),
    },
    public_repos: {
      type: DataTypes.INTEGER,
    },
    public_gists: {
      type: DataTypes.INTEGER,
    },
    followers: {
      type: DataTypes.INTEGER,
    },
    following: {
      type: DataTypes.INTEGER,
    },
    github_created_at: {
      type: DataTypes.STRING(500),
    },
    github_updated_at: {
      type: DataTypes.STRING(500),
    },
    private_gists: {
      type: DataTypes.INTEGER,
    },
    total_private_repos: {
      type: DataTypes.INTEGER,
    },
    owned_private_repos: {
      type: DataTypes.INTEGER,
    },
    disk_usage: {
      type: DataTypes.INTEGER,
    },
    collaborators: {
      type: DataTypes.INTEGER,
    },
    two_factor_authentication: {
      type: DataTypes.STRING(500),
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable({ model, sequelize });
export default model;
