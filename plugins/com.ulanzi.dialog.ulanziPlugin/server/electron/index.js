/*
 * @Author: 黄承文 chengwen@ssc-hn.com
 * @Date: 2024-07-21 15:06:48
 * @LastEditors: 黄承文 chengwen@ssc-hn.com
 * @LastEditTime: 2024-07-21 16:12:42
 * @FilePath: /ulanzi-plugin/plugins/com.ulanzi.dialog.ulanziPlugin/server/electron/index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const cutDialog = require('./cutDialog');
const systemDialog = require('./systemDialog');
module.exports = {
    cutDialog,
    systemDialog
}