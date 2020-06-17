const fs = require('fs');
const { pathKey, pathKeyArr } = require('../config/index');
const { ReplaceStr } = require('../utils');
const { summaryTpl } = require('../config');
// const PathKey =
const { renderComment, renderApiName, renderParamsBodyAndQuery } = require('./renderFunc/comment');

const outputPath = process.cwd();

function renderTpl(tplPath, targetPath) {
  const template = require(tplPath);
  const swaggerFile = require(targetPath);

  // 1.  先遍历所有tags
  const tagsArr = swaggerFile.tags.map((item) => ({
    ...item,
    filePath: `${outputPath}/api/${item.description.replace(/\s(\w)/g, ($1, $2) => $2.toUpperCase())}.js`,
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
