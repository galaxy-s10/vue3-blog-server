import { chalkERROR, chalkSUCCESS, chalkINFO } from '@/app/chalkTip';
import sequelize from '@/config/db';

/** 转换时间格式 */
export const formateDate = (datetime) => {
  function addDateZero(num) {
    return num < 10 ? `0${num}` : num;
  }
  const d = new Date(datetime);
  const formatdatetime = `${d.getFullYear()}-${addDateZero(
    d.getMonth() + 1
  )}-${addDateZero(d.getDate())} ${addDateZero(d.getHours())}:${addDateZero(
    d.getMinutes()
  )}:${addDateZero(d.getSeconds())}`;
  return formatdatetime;
};

/** 处理返回的分页数据 */
export const handlePaging = (nowPage, pageSize, result) => {
  const { count } = result;
  const obj: any = {};
  obj.nowPage = +nowPage;
  obj.pageSize = +pageSize;
  obj.hasMore = obj.nowPage * obj.pageSize - count < 0;
  return { ...obj, ...result };
};

/** 删除所有外键 */
export const deleteAllForeignKeys = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const allTables = await queryInterface.showAllTables();
    console.log(chalkINFO(`所有表:${allTables}`));
    const allConstraint = [];
    allTables.forEach((v) => {
      allConstraint.push(queryInterface.getForeignKeysForTables([v]));
    });
    const res1 = await Promise.all(allConstraint);
    const allConstraint1 = [];
    res1.forEach((v) => {
      const tableName = Object.keys(v)[0];
      const constraint = v[tableName];
      constraint.forEach((item) => {
        allConstraint1.push(queryInterface.removeConstraint(tableName, item));
      });
      console.log(chalkINFO(`当前${tableName}表的外键: ${constraint}`));
    });
    await Promise.all(allConstraint1);
    console.log(chalkSUCCESS('删除所有外键成功!'));
  } catch (err) {
    console.log(chalkERROR('删除所有外键失败!'), err);
  }
};

/** 删除所有索引（除了PRIMARY） */
export const deleteAllIndexs = async () => {
  try {
    const queryInterface = sequelize.getQueryInterface();
    const allTables = await queryInterface.showAllTables();
    console.log(chalkINFO(`所有表:${allTables}`));
    const allIndexs = [];
    allTables.forEach((v) => {
      allIndexs.push(queryInterface.showIndex(v));
    });
    const res1 = await Promise.all(allIndexs);
    const allIndexs1 = [];
    res1.forEach((v: any[]) => {
      const { tableName } = v[0];
      const indexStrArr = [];
      v.forEach((x) => {
        indexStrArr.push(x.name);
        if (x.name !== 'PRIMARY') {
          allIndexs1.push(queryInterface.removeIndex(tableName, x.name));
        }
      });
      console.log(chalkINFO(`当前${tableName}表的索引: ${indexStrArr}`));
    });
    await Promise.all(allIndexs1);
    console.log(chalkSUCCESS('删除所有索引成功!'));
  } catch (err) {
    console.log(chalkERROR('删除所有索引失败!'), err);
  }
};

/**
 * 初始化表
 * @param model
 * @param method
 */
export const initTable = async (model: any, method?: 'force' | 'alter') => {
  try {
    if (method === 'force') {
      await deleteAllForeignKeys();
      await model.sync({ force: true });
      console.log(chalkSUCCESS(`${model.tableName}表刚刚(重新)创建!`));
    } else if (method === 'alter') {
      await deleteAllForeignKeys();
      await model.sync({ alter: true });
      console.log(chalkSUCCESS(`${model.tableName}表刚刚同步成功!`));
    } else {
      console.log(chalkINFO(`加载数据库${model.tableName}表`));
    }
  } catch (err) {
    console.log(chalkERROR(`initTable失败`), err);
  }
};

/**
 * 去除url上的参数，获取url
 * @param url string
 * @returns string
 */
export const getUrl = (url: string) => {
  return url.replace(/\?.+/, '');
};

/**
 * 获取[min,max]之间的随机整数
 * 例如：[10,30],[-21,32],[-100,-20]
 */
export const getRandomInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** 获取随机字符串 */
export const randomString = (length: number): string => {
  const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let res = '';
  for (let i = 0; i < length; i += 1) {
    res += str.charAt(getRandomInt(0, str.length - 1));
  }
  return res;
};

/**
 * 获取随机数字字符串
 * length: 长度，不能大于16
 */
export const randomNumber = (length: number): number => {
  const str = Math.random().toString().slice(2);
  const res = +str.slice(str.length - length);
  return res;
};

/**
 *
 * @param code 验证码
 * @param desc 验证码作用
 * @param exp 有效期，单位：秒，但返回时会转换成分钟
 */
export const emailContentTemplate = ({
  code,
  desc,
  exp,
  subject,
}: {
  code: string;
  desc: string;
  exp: number;
  subject?: string;
}) => {
  const subjectTemp = subject || `【自然博客】验证码：${code}`;
  const content = `【自然博客】验证码：${code}，此验证码用于${desc}，有效期${
    exp / 60
  }分钟，请勿告知他人。`;
  return { subject: subjectTemp, content };
};
