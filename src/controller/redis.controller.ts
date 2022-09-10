import redisClient from '@/config/redis';

class RedisController {
  /**
   * @description: 从 Redis 2.8 开始，-1代表key 存在，但没有设置剩余生存时间；-2代表key不存在
   * @param {*} param1
   * @return {*}
   */
  getTTL = async ({ prefix = '', key = '' }) => {
    const res = await redisClient.ttl(`${prefix}-${key}`);
    return res;
  };

  del = async ({ prefix = '', key = '' }) => {
    const res = await redisClient.del(`${prefix}-${key}`);
    return res;
  };

  getVal = async ({ prefix = '', key = '' }) => {
    const res = await redisClient.get(`${prefix}-${key}`);
    return res;
  };

  setVal = async ({
    prefix,
    key,
    value,
    exp,
  }: {
    prefix: string;
    key: string;
    value: string;
    /** 有效期，单位：秒 */
    exp: number;
  }) => {
    await redisClient.setEx(`${prefix}-${key}`, exp, value); // string类型
  };
}

export default new RedisController();
