import request from 'request';

import { gaode_web_ip_key, gaode_web_ip_url } from '@/config/secret';
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
        info: 'OK', // 返回状态说明，status为0时，info返回错误原因，否则返回“OK”。
        infocode: '10000', // 返回状态说明,10000代表正确,详情参阅info状态表
        status: '1', // 值为0或1,0表示失败；1表示成功
        province: 'localhost', // 省级。
        city: 'localhost', // 市级。
        adcode: 'localhost', // 城市的adcode编码
        rectangle: 'localhost', // 所在城市范围的左下右上对标对
        location: 'localhost', // 经纬度。 高德v3版查不了这个了。
        ip: '127.0.0.1', // ip。高德v3版查不了这个了。
        isp: 'localhost', // 移动/联通/电信。高德v3版查不了这个了。
        country: 'localhost', // 国级。高德v3版查不了这个了。
        district: 'localhost', // 区级。高德v3版查不了这个了。
      };
    }
    const data: IIpdata = await new Promise((resolve) => {
      request(
        {
          url: gaode_web_ip_url,
          method: 'GET',
          qs: {
            key: gaode_web_ip_key,
            ip,
          },
        },
        (error, response, body) => {
          resolve({ ...JSON.parse(body), ip });
        }
      );
    });
    return data;
  }
}

export default new PositionService();
