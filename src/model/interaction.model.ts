import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IInteraction } from '@/interface';
import { initTable } from '@/utils';

interface IInteractionModel
  extends Model<
      InferAttributes<IInteractionModel>,
      InferCreationAttributes<IInteractionModel>
    >,
    IInteraction {}

const model = sequelize.define<IInteractionModel>(
  'interaction',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    // ip
    ip: {
      type: DataTypes.STRING(500),
    },
    // ip信息
    ip_data: {
      type: DataTypes.STRING(500),
    },
    // 用户类型
    user_type: {
      type: DataTypes.INTEGER,
    },
    // 用户信息
    user_info: {
      type: DataTypes.STRING(500),
    },
    // 消息类型
    type: {
      type: DataTypes.STRING(500),
    },
    // 消息内容
    value: {
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

function renameColumn() {
  // sequelize.query(
  //   `ALTER TABLE ${model.name} RENAME COLUMN ip_info TO ip_data;`
  // );
  sequelize.query(`ALTER TABLE ${model.name} RENAME COLUMN client_ip TO ip;`);
  sequelize.query(`ALTER TABLE ${model.name} RENAME COLUMN client TO ip_data;`);
}

initTable({ model, sequelize }).then(() => {
  // renameColumn();
});

export default model;
