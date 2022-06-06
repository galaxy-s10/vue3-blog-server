import { Client } from 'ssh2';

import { SSH_CONFIG } from '@/config/secret';

const clearCacheCmd = () => {
  // 清除buff/cache命令
  return `sync;echo 3 > /proc/sys/vm/drop_caches;`;
  // return `pm2 restart nuxt-blog-client-null-3000`;
};

// 查看内存命令
const showMemoryCmd = () => {
  return `free -h`;
};

const startClearCacheJob = () => {
  const conn = new Client();

  conn
    .on('ready', () => {
      conn.exec(
        `
        ${clearCacheCmd()}
        `,
        (error, stream) => {
          if (error) throw error;
          stream
            .on('close', () => {
              console.log('close');
            })
            .on('data', (data) => {
              console.log(`STDOUT: ${data}`);
            })
            .stderr.on('data', (data) => {
              console.log(`STDERR: ${data}`);
            });
        }
      );
    })
    .connect({
      host: SSH_CONFIG.host,
      port: SSH_CONFIG.port,
      username: SSH_CONFIG.username,
      password: SSH_CONFIG.password,
    });
};

const startShowMemoryJob = async () => {
  const conn = new Client();
  const res = await new Promise((resolve) => {
    conn
      .on('ready', () => {
        conn.exec(
          `
        ${showMemoryCmd()}
        `,
          (error, stream) => {
            if (error) throw error;
            stream
              .on('close', () => {
                console.log('close');
              })
              .on('data', (data) => {
                console.log(`==========STDOUT==========`);
                console.log(data.toString());
                resolve(data.toString());
              })
              .stderr.on('data', (data) => {
                console.log(`==========STDERR==========`);
                console.log(data.toString());
              });
          }
        );
      })
      .connect({
        host: SSH_CONFIG.host,
        port: SSH_CONFIG.port,
        username: SSH_CONFIG.username,
        password: SSH_CONFIG.password,
      });
  });
  return res;
};

export const clearCacheJob = () => {
  startClearCacheJob();
};
export const showMemoryJob = async () => {
  const res = await startShowMemoryJob();
  return res;
};
