import { ParameterizedContext } from 'koa';

import sequelize from '../config/db';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import Auth from '@/model/auth.model';
import Role from '@/model/role.model';
import RoleAuth from '@/model/roleAuth.model';
import {
  bulkCreateAuth,
  bulkCreateRole,
  bulkCreateRoleAuth,
} from '@/utils/initData';

const sql1 = `
DROP PROCEDURE IF EXISTS insert_many_dates;
`;

const sql2 = `
CREATE DEFINER = root @'%' PROCEDURE insert_many_dates ( number_to_insert INT ) BEGIN

	SET @x = 0;

	SET @date = '2022-01-01';
	REPEAT

			SET @x = @x + 1;
		INSERT INTO day_data ( today, created_at, updated_at )
		VALUES
			( @date, NOW(), NOW() );

		SET @date = DATE_ADD( @date, INTERVAL 1 DAY );
		UNTIL @x >= number_to_insert
	END REPEAT;

END
`;

const sql3 = `call insert_many_dates(3650)`;

class InitController {
  async createAuth(ctx: ParameterizedContext, next) {
    try {
      await Auth.bulkCreate(bulkCreateAuth);
      successHandler({ ctx, data: '初始化auth成功!' });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async createRole(ctx: ParameterizedContext, next) {
    try {
      await Role.bulkCreate(bulkCreateRole);
      successHandler({ ctx, data: '初始化role成功!' });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async createRoleAuth(ctx: ParameterizedContext) {
    try {
      await RoleAuth.bulkCreate(bulkCreateRoleAuth);
      successHandler({ ctx, data: '初始化RoleAuth成功!' });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
  }

  async createDayData(ctx: ParameterizedContext, next) {
    try {
      await sequelize.query(sql1);
      await sequelize.query(sql2);
      await sequelize.query(sql3);
      successHandler({ ctx, data: '初始化dayData成功!' });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new InitController();
