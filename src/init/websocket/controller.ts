import { REDIS_PREFIX } from '@/constant';
import redisController from '@/controller/redis.controller';

const chooseSongListKey = 'chooseSongListKey';

class WSController {
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
