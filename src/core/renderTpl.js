const fs = require('fs');
const { pathKey, pathKeyArr } = require('../config/index');
// const PathKey =

const outputPath = process.cwd();

function renderTpl(tplPath, targetPath) {
  const template = require(tplPath);
  const swaggerFile = require(targetPath);

  // 1.  先遍历所有tags
  const tagsArr = swaggerFile.tags.map((item) =>
    // fs.writeFileSync(`${outputPath}/${item.description.slice(0, 5)}.js`);
    ({
      ...item,
      filePath: `${outputPath}/${item.description.slice(0, 5)}.js`,
      children: [],
    }));

  // 2.遍历所有path然后分类
  Object.keys(swaggerFile.paths).forEach((path) => {
    Object.keys(swaggerFile.paths[path]).forEach((key) => {
      if (pathKey[key]) {
        Object.keys(swaggerFile.paths[path][key]).forEach((pathsKey) => {
          if (pathsKey === 'tags') {
            tagsArr.forEach((item) => {
              if (swaggerFile.paths[path][key][pathsKey].includes(item.name)) {
                swaggerFile.paths[path].path = path;
                item.children.push(swaggerFile.paths[path]);
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
              tempTpl = tempTpl.replace(/\{\{apiname\}\}/g, apiName);
            }

            const query = [];
            let body = '{}';
            const params = [];

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

            tempTpl = tempTpl.replace(/\{\{query\}\}/g, query.join(','));
            tempTpl = tempTpl.replace(/\{\{body\}\}/g, body);
            tempTpl = tempTpl.replace(/\{\{params\}\}/g, `{${params.join(',')}}`);
          }
          renderStr += tempTpl;
        }
      });


      // renderStr += '\r\n\r\n\r\n';
    });
    fs.writeFileSync(`${outputPath}/${item.description.slice(0, 5)}.js`, renderStr);
  });
}

module.exports = renderTpl;
