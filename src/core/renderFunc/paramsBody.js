
/**
 * 生成body和query还有params的方法
 * @param {object} pathObj 整个sw对象
 * @param {*} typeKey 方法
 */
function renderParamsBodyAndQuery(pathObj, typeKey, tempTpl) {
  const query = [];
  let body = '{}';
  let params = [];

  tempTpl.replace(/'`|`'/g, '`');

  tempTpl.replace(/\/\{(.+?)\}/g, ($1, $2) => {
    params.push($2);
    return `/$\{${$2}\}`;
  });

  // 判断是否有pamars 否则就渲染
  if (pathObj[typeKey].parameters) {
    pathObj[typeKey].parameters.forEach((parametersItem) => {
      if (parametersItem.in === 'query') {
        query.push(parametersItem.name);
        params.push(parametersItem.name);
      } else if (parametersItem.in === 'body') {
        body = 'data';
        params.push(body);
      }
    });
  }

  // 如果只有一个参数就一个，多个就用对象接口，没有就没有
  params = params.length > 0 ? (params.length === 1 ? params.join(',') : `{${params.join(',')}}`) : '';

  return {
    query: query.join(','),
    body,
    params,
  };
}

module.exports = {
  renderParamsBodyAndQuery,
};
