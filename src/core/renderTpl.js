const fs = require('fs');
const { pathKey, pathKeyArr } = require('../config/index');
const { ReplaceStr } = require('../utils');
const { summaryTpl } = require('../config');
// const PathKey =
const renderComment = require('./renderFunc/comment');

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
            let apiName = pathObj.path.replace(/\/\{.*?\}/g, '');
            // if (apiName.match(/\/(\w*)$/) && apiName.match(/\/(\w*)$/)[1] && apiName.match(/\/(\w*)$/)[1].length < 7) {
            //   // 如果小宇7的话 就前面加方法method
            // } else
            apiName = apiName.replace(/-(\w)/g, ($, $1) => $1.toUpperCase());
            if (apiName.match(/\/(\w*)$/) && apiName.match(/\/(\w*)$/)[1] && apiName.match(/\/(\w*)$/)[1].length > 7) {
              // 如果大于七就直接取最后一位
              apiName = apiName.match(/\w*?$/) ? apiName.match(/\w*?$/)[0] : apiName;
            }
            apiName = apiName.replace(/\/(\w)/g, ($1, $2) => $2.toUpperCase());
            apiName = apiName.replace(/^(\w)/, ($, $1) => $1.toUpperCase());
            apiName = typeKey + apiName;
            apiName = apiName.replace(RegExp(`(${typeKey})`, 'gi'), ($, $1) => $1);
            apiName = apiName.replace(/^(\w)/, ($, $1) => $1.toLowerCase());

            tempTpl.replace(/\{\{apiname\}\}/g, apiName);

            const query = [];
            let body = '{}';
            let params = [];

            // 渲染url
            tempTpl.replace(/\{\{url\}\}/g, `\`${pathObj.path}\``);
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

            tempTpl.replace(/\{\{query\}\}/g, query.join(','));
            tempTpl.replace(/\{\{body\}\}/g, body);
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
