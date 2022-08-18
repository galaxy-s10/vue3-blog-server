import redisClient from '@/config/redis';

class EmailController {
  getTTL = async ({ prefix = '', key = '' }) => {
    try {
      const res = await redisClient.ttl(`${prefix}-${key}`);
      return res;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  del = async ({ prefix = '', key = '' }) => {
    try {
      const res = await redisClient.del(`${prefix}-${key}`);
      return res;
    } catch (error) {
      console.log(error);
      return error;
    }
  };

  getVal = async ({ prefix = '', key = '' }) => {
    try {
      const res = await redisClient.get(`${prefix}-${key}`);
      return res;
    } catch (error) {
      console.log(error);
      return error;
    }
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
