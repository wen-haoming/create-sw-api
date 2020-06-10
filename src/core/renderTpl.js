const fs = require('fs');
const { pathKey, pathKeyArr } = require('../config/index');
// const PathKey =

const outputPath = process.cwd();

function renderTpl(tplPath, targetPath) {
  const template = require(tplPath);
  const swaggerFile = require(targetPath);

  // 1.  先遍历所有tags
  const tagsArr = swaggerFile.tags.map((item) => ({
    ...item,
    filePath: `${outputPath}/${item.description.replace(/\s(\w)/g, ($1, $2) => $2.toUpperCase())}.js`,
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
      let tempTpl = template;
      Object.keys(pathObj).forEach((typeKey) => {
        if (pathKeyArr.includes(typeKey)) {
          if (pathObj[typeKey]) {
            // 渲染method
            tempTpl = tempTpl.replace(/\{\{method\}\}/g, typeKey);

            // 渲染apiname
            const apiNameArr = pathObj.path.match(/\b\/(.*)$/);
            if (apiNameArr) {
              let apiName = apiNameArr[1];
              apiName = apiName.replace(/(\/\{.*?\})/g, '');
              apiName = apiName.replace(/(\/\{.*?\})/g, '');
              apiName = apiName.replace(/-(\w)/g, ($1, $2) => $2.toUpperCase());
              tempTpl = tempTpl.replace(/\{\{apiname\}\}/g, apiName);
            }

            const query = [];
            let body = '{}';
            let params = [];

            // 渲染url
            tempTpl = tempTpl.replace(/\{\{url\}\}/g, `\`${pathObj.path}\``);
            tempTpl = tempTpl.replace(/'`|`'/g, '`');
            tempTpl = tempTpl.replace(/\/\{(.+?)\}/g, ($1, $2) => {
              params.push($2);
              return `/$\{${$2}\}`;
            });


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

            tempTpl = tempTpl.replace(/\{\{query\}\}/g, query.join(','));
            tempTpl = tempTpl.replace(/\{\{body\}\}/g, body);
            tempTpl = tempTpl.replace(/\{\{params\}\}/g, params);
          }
          renderStr += tempTpl;
        }
      });


      // renderStr += '\r\n\r\n\r\n';
    });
    fs.writeFileSync(item.filePath, renderStr);
  });
}

module.exports = renderTpl;
