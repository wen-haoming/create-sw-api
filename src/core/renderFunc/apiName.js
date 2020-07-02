/**
 * 生成apiName的方法
 * @param {object} pathObj 整个sw对象
 * @param {*} typeKey 方法
 */
function renderApiName(pathObj, typeKey) {
  let apiName = pathObj.path.replace(/\/\{.*?\}/g, ''); // 把{}去掉
  apiName = apiName.replace(/-(\w)/g, ($, $1) => $1); // 把一部分有- 先忽略
  if (apiName.match(/\/(\w*)$/) && apiName.match(/\/(\w*)$/)[1] && apiName.match(/\/(\w*)$/)[1].length > 7) {
    // 如果最后的单词大于七位就直接取最后一位 不然就是全部
    apiName = apiName.match(/\w*?$/) ? apiName.match(/\w*?$/)[0] : apiName;
  }
  apiName = apiName.replace(/\/(\w)/g, ($, $1) => $1.toUpperCase()); // 转化驼峰
  apiName = apiName.replace(/^(\w)/, ($, $1) => $1.toUpperCase()); // 首字母大写
  apiName = apiName.replace(RegExp(`(${typeKey})`, 'gi'), ''); // 都把方法名都去掉
  apiName = typeKey + apiName; // 方法名加上
  apiName = apiName.replace(/^(\w)/, ($, $1) => $1.toLowerCase());
  return apiName;
}


module.exports = {
  renderApiName,
};
