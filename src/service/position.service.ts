import request from 'request';

import { gaode_web_ip_key } from '@/config/secret';
import { IIpdata } from '@/interface';

class PositionService {
  /**
   * country 国家 国家（或地区），中文
   * province 省份 省（二级），中文
   * city 城市 市（三级），中文
   * district 区县 区（四级），中文
   * isp 运营商 如电信、联通、移动
   * location 经纬度 如 116.480881,39.989410
   * Ip IP地址 提交的 Ipv4/ Ipv6地址。
   */

  async get(ip?: string) {
    if (!ip || ip === '127.0.0.1') {
      return {
        city: 'localhost',
        country: 'localhost',
        district: 'localhost',
        info: 'OK',
        infocode: '10000',
        ip: '127.0.0.1',
        isp: 'localhost',
        location: 'localhost',
        province: 'localhost',
        status: '1',
      };
    }
    const data: IIpdata = await new Promise((resolve) => {
      request(
        {
          url: `https://restapi.amap.com/v5/ip`,
          method: 'GET',
          qs: {
            key: gaode_web_ip_key,
            ip,
            type: 4,
          },
        },
        (error, response, body) => {
          resolve(JSON.parse(body));
        }
      );
    });
    return data;
  }
}

export default new PositionService();
