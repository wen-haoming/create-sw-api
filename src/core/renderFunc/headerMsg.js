const { getNowFormatDate, ReplaceStr } = require('../../utils.js');

const headerMsgTpl = `
/**
 * @fileDescription: {{fileDescription}}
 * @title: {{title}}
 * @date: {{Date}}
 * @host: {{host}}
 * @basePath: {{basePath}}
 * @description: {{description}}
 * @version: {{version}}
 */
 
 `;



const headerMsg = (swaggerFile, item) => {
  const tpl = new ReplaceStr(headerMsgTpl);
  tpl.replace(/{{title}}/g, item.name);
  tpl.replace(/{{fileDescription}}/, swaggerFile.info.description);
  tpl.replace(/{{description}}/g, item.description);
  tpl.replace(/{{Date}}/, getNowFormatDate());
  tpl.replace(/{{host}}/, swaggerFile.host);
  tpl.replace(/{{basePath}}/, swaggerFile.basePath);
  tpl.replace(/{{version}}/, swaggerFile.info.version);
  return tpl.toStr();
};

module.exports = {
  headerMsg,
  
};
