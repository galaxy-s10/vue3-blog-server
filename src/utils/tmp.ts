export const emailTmp = `
<div
  style="
    padding-bottom: 30px;
    background-color: #f7f8fa;
    min-width: 320px;
    max-width: 660px;
    margin: 0 auto;
  "
>
  <table style="width: 100%">
    <tbody>
      <tr>
        <td style="width: 2%; max-width: 30px"></td>
        <td>
          <div>
            <h2>自然博客</h2>
            <table
              style="
                width: 100%;
                background-color: #fff;
                box-shadow: 0px 1px 1px 0px rgb(122 55 55 / 20%);
              "
            >
              <tr>
                <p
                  style="
                    height: 2px;
                    background-color: #00a4ff;
                    border: 0;
                    font-size: 0;
                    padding: 0;
                    width: 100%;
                    margin-top: 14px;
                  "
                ></p>
                <td style="width: 2%; max-width: 30px"></td>
                <td>
                  <h2 style="margin: 10px 0px">{title}</h2>
                  <p style="color: #00a4ff">
                    <span>当前内存使用率：</span>
                    <span>{currMemoryRate}</span>
                  </p>
                  <p style="color: #00a4ff">
                    <span>当前buff/cache使用率：</span>
                    <span>{currBuffCacheRate}</span>
                  </p>
                  <p>
                    <span><span>Mem:total：</span></span>
                    <span><span>{Memtotal}</span></span>
                  </p>
                  <p>
                    <span><span>Mem:used：</span></span>
                    <span><span>{Memused}</span></span>
                  </p>
                  <p>
                    <span><span>Mem:free：</span></span>
                    <span><span>{Memfree}</span></span>
                  </p>
                  <p>
                    <span><span>Mem:shared：</span></span>
                    <span><span>{Memshared}</span></span>
                  </p>
                  <p>
                    <span><span>Mem:buff/cache：</span></span>
                    <span><span>{Membuffcache}</span></span>
                  </p>
                  <p>
                    <span><span>Mem:available：</span></span>
                    <span><span>{Memavailable}</span></span>
                  </p>
                  <p>
                    <span><span>Swap:total：</span></span>
                    <span><span>{Swaptotal}</span></span>
                  </p>
                  <p>
                    <span><span>Swap:used：</span></span>
                    <span><span>{Swapused}</span></span>
                  </p>
                  <p>
                    <span><span>Swap:free：</span></span>
                    <span><span>{Swapfree}</span></span>
                  </p>
                  <p>
                    <span>内存阈值：</span>
                    <span>{memoryThreshold}({memoryRate})</span>，
                    <span>buff/cache阈值： </span>
                    <span>{buffCacheThreshold}({buffCacheRate})</span>，
                    <span>重启pm2的阈值：</span>
                    <span>{restartPm2Threshold}({restartPm2Rate})</span>
                  </p>
                </td>
                <td style="width: 2%; max-width: 30px"></td>
              </tr>
            </table>
          </div>
        </td>
        <td style="width: 2%; max-width: 30px"></td>
      </tr>
    </tbody>
  </table>
</div>
`;
