const fs = require('fs');
const { pathKey, pathKeyArr } = require('../config/index');
const { ReplaceStr, isObject } = require('../utils');
const { summaryTpl } = require('../config');


const { renderComment } = require('./renderFunc/comment');
const { renderApiName } = require('./renderFunc/apiName');
const { renderParamsBodyAndQuery } = require('./renderFunc/paramsBody');


const outputPath = process.cwd();

function renderTpl(tplPath, file) {
  const tpltarget = require(tplPath);
  let template = '';
  let header = '';
  let footer = '';
  let mapFileName = [];
  if (isObject(tpltarget)) {
    template = tpltarget.template;
    header = tpltarget.header || '';
    footer = tpltarget.footer || '';
    mapFileName = tpltarget.mapFileName || [];
  } else if (typeof tpltarget === 'string') {
    template = tpltarget;
  } else {
    throw new Error('输入文件格式错误');
  }

  const swaggerFile = file; // swagger数据对象

  // 1.  先遍历所有tags
  const tagsArr = swaggerFile.tags.map((item, index) => ({
    ...item,
    filePath: `${outputPath}/api/${mapFileName[index] ? mapFileName[index] : item.description.replace(/\s(\w)/g, ($1, $2) => $2.toUpperCase())}.js`,
    children: [],
  }));

  // 2.遍历所有path然后分类
  Object.keys(swaggerFile.paths).forEach((path) => {
    Object.keys(swaggerFile.paths[path]).forEach((method) => {
      // 一个路径多种请求方法处理 get poset delete put
      if (pathKey[method]) {
        Object.keys(swaggerFile.paths[path][method]).forEach((pathsKey) => {
          if (pathsKey === 'tags') {
            tagsArr.forEach((item) => {
              const obj = {
              };
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

  // 3. 遍历方法
  tagsArr.forEach((item) => {
    let renderStr = '';
    // 渲染头部
    renderStr += header;
    item.children.forEach((pathObj) => {
      // 定义当前模板
      const tempTpl = new ReplaceStr(summaryTpl + template);
      Object.keys(pathObj).forEach((typeKey) => {
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

            const { query, body, params } = renderParamsBodyAndQuery(pathObj, typeKey, tempTpl);

            // 渲染query
            tempTpl.replace(/\{\{query\}\}/g, query);
            // 渲染body
            tempTpl.replace(/\{\{body\}\}/g, body);
            // 渲染params
            tempTpl.replace(/\{\{params\}\}/g, params);
          }
          renderStr += tempTpl.toStr();
        }
      });
    });
    const exit = fs.existsSync(`${outputPath}/api`);
    if (!exit) {
      fs.mkdirSync(`${outputPath}/api`);
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

/**
 * @version 1.2
 *
 */
