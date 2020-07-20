

/**
 * 
/**
 * 生成body和query还有params的方法
 * @param {object} pathObj 整个sw对象
 * @param {*} typeKey 方法
 * @param {*} tempTpl 渲染主模板
 * @param {*} item 每一项
 * @param {*} exportName ts的exportName
 * @param {*} paramItemArr  ts的参数数组
 * @param {*} definitions  swagger文档的类型定义
 */
function renderParamsBodyAndQuery(pathObj, typeKey, tempTpl, exportName,paramItemArr,definitions) {
  let query = [];
  let body = '{}';
  let params = [];
  let paramsLength = 0
  let queryLength = 0
  tempTpl.replace(/'`|`'/g, '`');

  tempTpl.replace(/\/\{(.+?)\}/g, ($1, $2) => {
    params.push($2);
    paramsLength++
    queryLength++
    return `/$\{${$2}\}`;
  });

  // 判断是否有pamars 否则就渲染
  if (pathObj[typeKey].parameters) {
    pathObj[typeKey].parameters.forEach((parametersItem) => {
      if (parametersItem.in === 'query') {
        query.push(parametersItem.name);
        params.push(parametersItem.name);
         paramsLength++
         queryLength++
      } else if (parametersItem.in === 'body') {
        body = 'data';
        params.push(body);
        paramsLength++
      }
    });
  }

  // 如果只有一个参数就一个，多个就用对象接口，没有就没有
  params = params.length > 0 ? (params.length === 1 ? params.join(',') : `{${params.join(',')}}`) : '';
  if(exportName){
    // if(paramsLength>1){
      // exportName如果有就是ts模式
      if(paramItemArr&&paramItemArr.length>1){
        params+=`:${exportName}` 
      }else if(paramItemArr&&paramItemArr.length === 1){
        let paramItem = paramItemArr[0]
        params+= `${paramItem.required?"":'?'}:${paramItem.type}`
      }
  //  }else if((paramsLength === 1)&& paramItem ){
  //    console.log(paramItem,'--------');
  //    params+= `${paramItem.required?"":'?'}:${paramItem.type}`
    
  //  }
  }
 
  
  return {
    query: query.join(','),
    body,
    params,
  };
}

module.exports = {
  renderParamsBodyAndQuery,
};
