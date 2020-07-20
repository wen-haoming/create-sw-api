const fs = require('fs');
const { pathKey, pathKeyArr } = require('../config/index');
const { ReplaceStr, isObject } = require('../utils');
const { summaryTpl } = require('../config');

const { renderComment } = require('./renderFunc/comment');
const { renderApiName } = require('./renderFunc/apiName');
const { renderParamsBodyAndQuery } = require('./renderFunc/paramsBody');
const { headerMsg } = require('./renderFunc/headerMsg');
const {getTypesImportTpl,renderTypesProps}  = require('./renderFunc/renderTs');

const outputPath = process.cwd();

function renderTpl(tplPath, file) {
  const tpltarget = require(tplPath);

  let template = '';
  let header = '';
  let footer = '';
  let isRenderTypescript = false;
  let definitions = {}; // swagger的类型定义集合
  let mapFileName = [];
  
  // 判断模板返回是否对象
  if (isObject(tpltarget)) {
    template = tpltarget.template;
    header = tpltarget.header || '';
    footer = tpltarget.footer || '';
    isRenderTypescript = tpltarget.typescript || false;
    mapFileName = tpltarget.mapFileName || [];

  } else if (typeof tpltarget === 'string') {
    template = tpltarget;
  } else {
    throw new Error('输入文件格式错误');
  }

  const swaggerFile = file; // swagger数据对象
  definitions = swaggerFile.definitions;

  // 1.  先遍历所有tags
  const tagsArr = swaggerFile.tags.map((item, index) => {
    let CasePath =  (mapFileName[index] ? mapFileName[index] : item.description.replace(/\s(\w)/g, ($1, $2) => $2.toUpperCase()))
    return ({
    ...item,
    filePath: `${outputPath}/api/${isRenderTypescript?CasePath+'/index':CasePath}.${isRenderTypescript?'ts':'js'}`,
    tsTypePath:`${outputPath}/api/${CasePath+'/types'}.ts`,
    casePath:isRenderTypescript? CasePath:'', // 判断是否ts模式
    isTypescript:isRenderTypescript,
    tsTypeTempArr:[], // tsType引入的数组
    children: [],
  })});

  // 2.遍历所有path然后分类
  Object.keys(swaggerFile.paths).forEach((path) => {
    Object.keys(swaggerFile.paths[path]).forEach((method) => {
      // 一个路径多种请求方法处理 get poset delete put
      if (pathKey[method]) {
        Object.keys(swaggerFile.paths[path][method]).forEach((pathsKey) => {
          if (pathsKey === 'tags') {
            tagsArr.forEach((item) => {
              const obj = {};
              if (swaggerFile.paths[path][method][pathsKey].includes(item.name)) {
                // swaggerFile.paths[path].path = path;
                obj[method] = swaggerFile.paths[path][method];
                obj.path = path;
                item.children.push(obj);
              }
            });
          }
        });
      }
    });
  });

  fs.writeFileSync(__dirname+'/tpl.json',JSON.stringify(tagsArr))

  // 3. 遍历方法
  tagsArr.forEach((item) => {
    let renderStr = '';
    let renderTypeStr = '';
    
    // 渲染头部
    const headerMsgTpl = headerMsg(swaggerFile, item);
    renderStr += headerMsgTpl;
    // 如果是ts模式的话 首先需要添加渲染模板的标记, 然后添加所有类型名称到一个数据结构，后续需要筛选再渲染到 tsimportTpl 上
    if(item.isTypescript){
      renderStr += `{{tsimportTpl}}
      `
      item.children.forEach((pathObj) => {
        Object.keys(pathObj).forEach((typeKey) => {
          if (pathKeyArr.includes(typeKey)) {
            item.tsTypeTempArr.push(renderApiName(pathObj, typeKey)+'Props')
          }
        })
      })
    }
    renderStr += header;
    item.children.forEach((pathObj,idx) => {
      // 定义当前模板
      const tempTpl = new ReplaceStr(summaryTpl + template);
      Object.keys(pathObj).forEach((typeKey,) => {
        if (pathKeyArr.includes(typeKey)) {
          if (pathObj[typeKey]) {
            // 渲染基本注释
            tempTpl.replace(/\{\{summary\}\}/g, renderComment(pathObj, typeKey));

            // 渲染method
            tempTpl.replace(/\{\{method\}\}/g, typeKey);

            // 渲染apiname
            tempTpl.replace(/\{\{apiname\}\}/g, renderApiName(pathObj, typeKey));

            // 渲染url
            tempTpl.replace(/\{\{url\}\}/g, `\`${pathObj.path}\``);

            let { query, body, params } = renderParamsBodyAndQuery(pathObj, typeKey, tempTpl, isRenderTypescript ?item.tsTypeTempArr[idx]:'', pathObj[typeKey].parameters,definitions);

            // 渲染query
            tempTpl.replace(/\{\{query\}\}/g, query);

            // 渲染body
            tempTpl.replace(/\{\{body\}\}/g, body);

            // 渲染params
            tempTpl.replace(/\{\{params\}\}/g, params);

            // --------------------------------------------------
            if(isRenderTypescript && item.tsTypeTempArr&& item.tsTypeTempArr.length>0){
              // 渲染types.ts文件
                renderTypeStr += renderTypesProps(item.tsTypeTempArr[idx], pathObj[typeKey].parameters,definitions)
            }
          }
          renderStr += tempTpl.toStr();
        }
      });
    });
    const exit = fs.existsSync(`${outputPath}/api`);

    if (!exit) {
      fs.mkdirSync(`${outputPath}/api`);
    }
    // 渲染ts的模式
    if(isRenderTypescript){
      renderStr = renderStr.replace(/\{\{tsimportTpl\}\}/g,getTypesImportTpl(item))
      fs.mkdirSync(`${outputPath}/api/${item.casePath}`);
      fs.writeFileSync(item.tsTypePath, renderTypeStr);
    }
   
    // 渲染尾部
    renderStr += footer;
    fs.writeFileSync(item.filePath, renderStr);
  });

  return {
    outputPath: `${outputPath}/api`,
  };
}

module.exports = renderTpl;

