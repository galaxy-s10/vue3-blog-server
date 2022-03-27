import redisClient from '@/config/redis';

const emailResCode = {
  ok: '发送成功!',
  more: '一天只能发5次验证码!',
  later: '一分钟内只能发1次验证码，请稍后再试!',
  err: '验证码错误或已过期!',
};

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
