import redisClient from '@/config/redis';

class EmailController {
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
    exp: number;
  }) => {
    await redisClient.setEx(`${prefix}-${key}`, exp, value); // string类型
  };
}

export default new EmailController();
