import sequelize from '@/config/mysql';
import {
  bulkCreateAuth,
  bulkCreateRole,
  bulkCreateRoleAuth,
  bulkFrontend,
  bulkInteractionStatis,
  bulkinitType,
} from '@/init/initData';
import { initDb } from '@/init/initDb';
import AuthModel from '@/model/auth.model';
import dayDataModel from '@/model/dayData.model';
import frontendModel from '@/model/frontend.model';
import interactionStatisModel from '@/model/interactionStatis.model';
import RoleModel from '@/model/role.model';
import RoleAuthModel from '@/model/roleAuth.model';
import typeModel from '@/model/type.model';
import userModel from '@/model/user.model';
import { chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';

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

class InitFirst {
  // 初始化角色
  async initRole() {
    const count = await RoleModel.count();
    if (count === 0) {
      await RoleModel.bulkCreate(bulkCreateRole);
      console.log(chalkSUCCESS('初始化角色成功'));
    } else {
      console.log(chalkWARN('已经初始化过角色，不能再初始化了！'));
    }
  }

  // 初始化权限
  async initAuth() {
    const count = await AuthModel.count();
    if (count === 0) {
      await AuthModel.bulkCreate(bulkCreateAuth);
      console.log(chalkSUCCESS('初始化权限成功'));
    } else {
      console.log(chalkWARN('已经初始化过权限了，不能再初始化了！'));
    }
  }

  // 初始化角色权限
  async initRoleAuth() {
    const count = await RoleAuthModel.count();
    if (count === 0) {
      await RoleAuthModel.bulkCreate(bulkCreateRoleAuth);
      console.log(chalkSUCCESS('初始化角色权限成功'));
    } else {
      console.log(chalkWARN('已经初始化过角色权限了，不能再初始化了！'));
    }
  }

  // 初始化数据库
  async initDatabase() {
    const queryInterface = sequelize.getQueryInterface();
    const allTables = await queryInterface.showAllTables();

    if (!allTables.length) {
      await initDb(1);
      console.log(chalkSUCCESS('初始化数据库成功！'));
    } else {
      await initDb(2);
      console.log(chalkWARN('已经初始化过数据库了，不能再初始化了！'));
    }
  }

  // 初始化时间表
  async initDayData() {
    const count = await dayDataModel.count();
    if (count === 0) {
      await sequelize.query(sql1);
      await sequelize.query(sql2);
      await sequelize.query(sql3);
      console.log(chalkSUCCESS('初始化时间表成功！'));
    } else {
      console.log(chalkWARN('已经初始化过时间表了，不能再初始化了！'));
    }
  }

  // 初始化nav分类数据
  async initNavInfo() {
    const count = await typeModel.count();
    if (count === 0) {
      await typeModel.bulkCreate(bulkinitType);
      console.log(chalkSUCCESS('初始化分类成功'));
    } else {
      console.log(chalkWARN('已经初始化过分类了，不能再初始化了！'));
    }
  }

  // 初始化管理员
  async initAdminUser() {
    const count = await userModel.count();
    if (count === 0) {
      const adminUser: any = await userModel.create({
        username: 'admin',
        password: '123456',
      });
      adminUser.setRoles([3, 7]);
      console.log(chalkSUCCESS('初始化管理员成功！'));
    } else {
      console.log(chalkWARN('已经初始化过管理员了，不能再初始化了！'));
    }
  }

  // 初始化前台设置
  async initFrontend() {
    const count = await frontendModel.count();
    if (count === 0) {
      await frontendModel.bulkCreate(bulkFrontend);
      console.log(chalkSUCCESS('初始化初始化前台设置成功！'));
    } else {
      console.log(chalkWARN('已经初始化过前台设置，不能再初始化了！'));
    }
  }

  // 初始化互动统计
  async initInteractionStatis() {
    const count = await interactionStatisModel.count();
    if (count === 0) {
      await interactionStatisModel.bulkCreate(bulkInteractionStatis);
      console.log(chalkSUCCESS('初始化互动统计成功！'));
    } else {
      console.log(chalkWARN('已经初始化过初始化互动统计，不能再初始化了！'));
    }
  }
}

export default new InitFirst();
