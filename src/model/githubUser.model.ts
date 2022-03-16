import { DataTypes } from 'sequelize';

import sequelize from '@/config/db';
import { initTable } from '@/utils';

const githubUserModel = sequelize.define(
  'github_user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    client_id: {
      type: DataTypes.STRING,
    },
    login: {
      type: DataTypes.STRING,
    },
    github_id: {
      type: DataTypes.INTEGER,
    },
    node_id: {
      type: DataTypes.STRING,
    },
    avatar_url: {
      type: DataTypes.STRING,
    },
    gravatar_id: {
      type: DataTypes.STRING,
    },
    url: {
      type: DataTypes.STRING,
    },
    html_url: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
    },
    site_admin: {
      type: DataTypes.STRING,
    },
    name: {
      type: DataTypes.STRING,
    },
    company: {
      type: DataTypes.STRING,
    },
    blog: {
      type: DataTypes.STRING,
    },
    location: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    hireable: {
      type: DataTypes.STRING,
    },
    bio: {
      type: DataTypes.STRING,
    },
    twitter_username: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
    },
    github_updated_at: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
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

initTable(githubUserModel);
export default githubUserModel;
