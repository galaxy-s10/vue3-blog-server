import { monitBackupsDbJob } from './monitBackupsDb';
import { monitMemoryJob } from './monitMemory';
import { monitProcessJob } from './monitProcess';
import { monitQiniuCDNJob } from './monitQiniuCDN';

export const monit = () => {
  monitMemoryJob(); // 监控服务器内存
  monitProcessJob(); // 监控node进程
  monitQiniuCDNJob(); // 监控七牛云cdn
  monitBackupsDbJob(); // 监控备份数据库
};
