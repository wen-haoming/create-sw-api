const fs = require('fs');
const { pathKey, pathKeyArr } = require('../config/index');
const { ReplaceStr, isObject } = require('../utils');
const { summaryTpl } = require('../config');

const { renderComment } = require('./renderFunc/comment');
const { renderApiName } = require('./renderFunc/apiName');
const { renderParamsBodyAndQuery } = require('./renderFunc/paramsBody');
const { headerMsg } = require('./renderFunc/headerMsg');
const {getTypesImportTpl,renderTypesProps,renderReturnTypes}  = require('./renderFunc/renderTs');


function renderTpl(swconfig, swaggerFile) {

  let template = '';
  let header = '';
  let footer = '';
  let isRenderTypescript = false;
  let definitions = {}; // swagger的类型定义集合
  let mapFileName = [];
  const outputPath = swconfig.output?
                    swconfig.output.path?
                    swconfig.output.path:
                    process.cwd()+'/api'
                    :process.cwd()+'/api';
  
  // 判断模板返回是否对象
  if (isObject(swconfig)) {
    template = swconfig.template;
    header = swconfig.header || '';
    footer = swconfig.footer || '';
    isRenderTypescript = swconfig.typescript || false;
    mapFileName = swconfig.mapFileName || [];

  } else if (typeof swconfig === 'string') {
    template = swconfig;
  } else {
    throw new Error('输入文件格式错误');
  }


  definitions = swaggerFile.definitions;

  // 1.  先遍历所有tags
  const tagsArr = swaggerFile.tags.map((item, index) => {
    let CasePath =  (mapFileName[index] ? mapFileName[index] : item.description.replace(/\s(\w)/g, ($1, $2) => $2.toUpperCase()))
    return ({
    ...item,
    filePath: `${outputPath}/${isRenderTypescript?CasePath+'/index':CasePath}.${isRenderTypescript?'ts':'js'}`,
    tsTypePath:`${outputPath}/${CasePath+'/types'}.ts`,
    casePath:isRenderTypescript? CasePath:'', // 判断是否ts模式
    isTypescript:isRenderTypescript,
    tsTypeTempArr:[], // tsType引入的数组
    tsReturnTypeArr:[], // ts返回值数组
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
      renderStr+=`import {AxiosResponse} from 'axios'\r\n`
      renderStr += `{{tsimportTpl}}
      `
      item.children.forEach((pathObj) => {
        Object.keys(pathObj).forEach((typeKey) => {
          if (pathKeyArr.includes(typeKey)) {
            item.tsTypeTempArr.push(renderApiName(pathObj, typeKey)+'Props')
            item.tsReturnTypeArr.push(renderApiName(pathObj, typeKey)+'ReturnTypes')
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

            if(isRenderTypescript){
               tempTpl.replace(/\(\{\{params\}\}\)/g,`({{params}}):Promise<AxiosResponse<${item.tsReturnTypeArr[idx]}>>`)
            }

            // 渲染基本注释
            tempTpl.replace(/\{\{summary\}\}/g, renderComment(pathObj, typeKey));

            // 渲染method
            tempTpl.replace(/\{\{method\}\}/g, typeKey);

            // 渲染apiname
            tempTpl.replace(/\{\{apiname\}\}/g, renderApiName(pathObj, typeKey,isRenderTypescript ?item.tsReturnTypeArr[idx]:''));

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
                renderTypeStr += renderReturnTypes(item.tsReturnTypeArr[idx], pathObj[typeKey].responses,definitions)
            }
          }
          renderStr += tempTpl.toStr();
        }
      });
    });

    const exit = fs.existsSync(`${outputPath}`);

    if (!exit) {
      fs.mkdirSync(`${outputPath}`);
    }
    // 渲染ts的模式
    if(isRenderTypescript){
      renderStr = renderStr.replace(/\{\{tsimportTpl\}\}/g,getTypesImportTpl(item))
      fs.mkdirSync(`${outputPath}/${item.casePath}`);
      fs.writeFileSync(item.tsTypePath, renderTypeStr);
    }
   
    // 渲染尾部
    renderStr += footer;
    fs.writeFileSync(item.filePath, renderStr);
  });

  return {
    outputPath: `${outputPath}`,
  };
}

module.exports = renderTpl;

