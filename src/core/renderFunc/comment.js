
const commentTpl = (str) => `
/**
* @description {{summary}}.
${str}
*/`;

const ObjParamsTpl = `* @param {{{type}}} {{name}} - {{description}}.
`;

/**
 *  根据 parameters 每一项判断返回值
 * @param {Object} item
 */
function judgeParamsType(item) {
  if (item.in === 'query' && item.type === 'integer') {
    return 'Number';
  } if (item.in === 'query' && item.type !== 'integer') {
    return 'String';
  } if (item.in === 'body') {
    return 'Object';
  }
  return item.type;
}

/**
 * 生成注释的方法
 * @param {object} pathObj 整个sw对象
 * @param {*} typeKey 方法
 */
function renderComment(pathObj, typeKey) {
  const parametersArr = Array.isArray(pathObj[typeKey].parameters) ? pathObj[typeKey].parameters : [];
  let summaryTempTpl = '';
  //  多个参数的情况
  // if (tempRes > 1) {
  parametersArr.forEach((item) => {
    if (item.in === 'body' || item.in === 'path' || item.in === 'query') {
      let str = ObjParamsTpl;
      str = str.replace(/\{\{type\}\}/, judgeParamsType(item));
      str = str.replace(/\{\{name\}\}/, item.name);
      str = str.replace(/\{\{description\}\}/, item.description);
      summaryTempTpl += str;
    }
  });
  summaryTempTpl = summaryTempTpl.replace(/[\r\n]$/, ''); // 匹配最后一个换行
  return commentTpl(`${summaryTempTpl}`).replace(/\{\{summary\}\}/, pathObj[typeKey].summary);
}


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

module.exports = { renderComment, renderApiName, renderParamsBodyAndQuery };
