import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';

const chooseSongListKey = '-';
const setHistoryHightOnlineNum = '-';

class WSController {
  /** 新增一个在线用户 */
  addOnlineUser = async (field, value) => {
    await redisController.setHashVal(REDIS_PREFIX.onlineUser, field, value);
  };

  /** 删除一个在线用户 */
  deleteOnlineUser = async (field) => {
    await redisController.delHashVal(REDIS_PREFIX.onlineUser, field);
  };

  /** 获取一个在线用户 */
  getOnlineUser = async (field) => {
    const res = await redisController.getHashVal(
      REDIS_PREFIX.onlineUser,
      field
    );
    return res;
  };

  /** 获取所有在线用户 */
  getAllOnlineUser = async () => {
    const res = await redisController.getAllHashVal(REDIS_PREFIX.onlineUser);
    return res;
  };

  /** 获取在线用户数量 */
  getAllOnlineUserNum = async () => {
    const res = await redisController.getHashLenVal(REDIS_PREFIX.onlineUser);
    return res;
  };

  /** 新增一个在线游客 */
  addOnlineVisitor = async (field, value) => {
    await redisController.setHashVal(REDIS_PREFIX.onlineVisitor, field, value);
  };

  /** 删除一个在线游客 */
  deleteOnlineVisitor = async (field) => {
    await redisController.delHashVal(REDIS_PREFIX.onlineVisitor, field);
  };

  /** 获取一个在线游客 */
  getOnlineVisitor = async (field) => {
    const res = await redisController.getHashVal(
      REDIS_PREFIX.onlineVisitor,
      field
    );
    return res;
  };

  /** 获取所有在线游客 */
  getAllOnlineVisitor = async () => {
    const res = await redisController.getAllHashVal(REDIS_PREFIX.onlineVisitor);
    return res;
  };

  /** 获取在线游客数量 */
  getAllOnlineVisitorNum = async () => {
    const res = await redisController.getHashLenVal(REDIS_PREFIX.onlineVisitor);
    return res;
  };

  /** 新增一个在线人 */
  addOnlineList = async (field, value) => {
    await redisController.setHashVal(REDIS_PREFIX.onlineList, field, value);
  };

  /** 删除一个在线人 */
  deleteOnlineList = async (field) => {
    await redisController.delHashVal(REDIS_PREFIX.onlineList, field);
  };

  /** 获取一个在线人 */
  getOnlineList = async (field) => {
    const res = await redisController.getHashVal(
      REDIS_PREFIX.onlineList,
      field
    );
    return res;
  };

  /** 获取所有在线人 */
  getAllOnlineList = async () => {
    const res = await redisController.getAllHashVal(REDIS_PREFIX.onlineList);
    return res;
  };

  /** 获取在线人数量 */
  getAllOnlineListNum = async () => {
    const res = await redisController.getHashLenVal(REDIS_PREFIX.onlineList);
    return res;
  };

  /** 历史最高同时在线数 */
  setHistoryHightOnlineNum = async (value: {
    nickname: string;
    song: { id: number; name: string };
    created_at: string;
  }) => {
    const oldData = await redisController.getVal({
      prefix: REDIS_PREFIX.setHistoryHightOnlineNum,
      key: setHistoryHightOnlineNum,
    });
    let res: any[] = [];
    if (!oldData) {
      res = [value];
    } else {
      res.push(...JSON.parse(oldData), value);
    }
    await redisController.setVal({
      prefix: REDIS_PREFIX.setHistoryHightOnlineNum,
      key: setHistoryHightOnlineNum,
      value: JSON.stringify(res),
    });
  };

  /** 设置点歌列表 */
  setChooseSongList = async (value: {
    nickname: string;
    song: { id: number; name: string };
    created_at: string;
  }) => {
    const oldData = await redisController.getVal({
      prefix: REDIS_PREFIX.chooseSongList,
      key: chooseSongListKey,
    });
    let res: any[] = [];
    if (!oldData) {
      res = [value];
    } else {
      res.push(...JSON.parse(oldData), value);
    }
    await redisController.setVal({
      prefix: REDIS_PREFIX.chooseSongList,
      key: chooseSongListKey,
      value: JSON.stringify(res),
    });
  };

  /** 获取点歌 */
  getChooseSongList = async () => {
    const oldData = await redisController.getVal({
      prefix: REDIS_PREFIX.chooseSongList,
      key: chooseSongListKey,
    });
    return JSON.parse(oldData || '[]');
  };
}

export default new WSController();
