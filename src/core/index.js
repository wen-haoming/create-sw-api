const Axios = require("axios");
const path = require("path");
const ora = require("ora");
const Inquirer = require("inquirer");
const fs = require("fs");
const renderTpl = require("./renderTpl");
const { deleteFolderRecursive ,consoleError,consoleSuccess} = require("../utils");
var ProgressBar = require("progress");
const { error } = require("console");

var bar = new ProgressBar(":bar :current/:total", { total: 15 });

// async function getTpl() {
//   const { res } = await Inquirer.prompt({
//     type: 'input',
//     name: 'res',
//     message: 'please enter your func-api template name',
//   });
//   return res;
// }

const renderFunc = async (swConfig) => {
  const spinner = ora("featching swagger doc...\r\n");
  spinner.start();
  let res = ''
  try{
    res = await Axios.default.get(swConfig.entry);
  }catch(e){
    spinner.succeed();
    consoleError('Request failed','entry must be the correct swagger-doc-api')
    return 
  }

  // 文件夹名称
  // 根据路径渲染
  try {
    spinner.succeed();
    deleteFolderRecursive(`${process.cwd()}/api`);
    const { outputPath } = renderTpl(swConfig, res.data);
    consoleSuccess('Compiled successfully','\r\npath:'+'\033[40;32m'+outputPath)
  } catch (e) {
    consoleError('Compilation failed',e)
  }
};

const defaultAction = async (args = []) => {
  let [, , , filePath] = args;
  // 如果用户填入配置文件的路径则走默认文件名 /sw.config.js
  if (filePath) {
    filePath = process.cwd() + "/" + filePath;
  }else{
    filePath = process.cwd() + "/sw.config.js";
  }
  let swConfig = require(filePath);

  renderFunc(swConfig);
};

const pathFunc = () => {
  console.log("暂时不满足路径功能", process.cwd());
};

module.exports = {
  pathFunc,
  defaultAction,
};
