
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
  return commentTpl(`${summaryTempTpl}` || '*').replace(/\{\{summary\}\}/, pathObj[typeKey].summary);
}


module.exports = { renderComment };
