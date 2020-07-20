const { ReplaceStr, mapMethodKey,deepRenderTypeProps } = require("../../utils");
const typesImportTpl = `import {{{TypesImportTpl}}} from './types'
`;

const typesPropsTpl = `export interface {{typesPropsName}} {
{{typesPropsTplItem}}
}
`;

const typesPropsTplItem = `{{typesPropsTplKey}}:{{typesPropsTplVal}}; //{{comment}}
`;

function getTypesImportTpl(item) {
  let tempStr = item.tsTypeTempArr.join(",");
  return typesImportTpl.replace(/\{\{TypesImportTpl\}\}/g, tempStr);
}

/**
 * 渲染输入的参数
 * @param {*} exportName 类型返回的名称
 * @param {*} paramsArr 变量名数组
 * @param {*} definitions swagger定义的类型集合
 */
function renderTypesProps(exportName, paramsArr,definitions) {
  if (paramsArr) {
    let renderStr = new ReplaceStr(typesPropsTpl);

    renderStr.replace(/\{\{typesPropsName\}\}/, exportName);
    let tempTypesPropsTplItem = ''

    paramsArr.forEach(item=>{
        let tempStr = ''
        if (item.in !== "header" && item.in === "body"&&(item.schema['$ref']||(item.schema.items&&item.schema.items['$ref']))){
             let tarKey =  ((item.schema['$ref']||item.schema.items['$ref']).match(/.*\/(.*?)$/)[1])
             if(definitions[tarKey] && definitions[tarKey].properties){
                tempStr =  deepRenderTypeProps(definitions, typesPropsTplItem, tempStr, tarKey)
             }
            }else if(item.in !== "header" && item.in !== "body"){
            tempStr = typesPropsTplItem.replace(
              /\{\{typesPropsTplKey\}\}/g,
              item.name+`${item.required?'':'?'}`
            );
            tempStr = tempStr.replace(
              /\{\{typesPropsTplVal\}\}/g,
              mapMethodKey[item.type]
            );
            tempStr = tempStr.replace(
                /\{\{comment\}\}/g,
                item.description
              );
        }
        tempTypesPropsTplItem +=  tempStr 
       
    })
    renderStr.replace(/\{\{typesPropsTplItem\}\}/g, tempTypesPropsTplItem);
    return renderStr.toStr();
  } else {
    return "";
  }
}

module.exports = {
  typesImportTpl,
  getTypesImportTpl,
  renderTypesProps,
};
