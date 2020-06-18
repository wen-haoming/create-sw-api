
const Axios = require('axios');
const fs = require('fs');
const path = require('path');
const ora = require('ora');
const Inquirer = require('inquirer');
const renderTpl = require('./renderTpl');

const resolve = (pathName) => path.resolve(__dirname, pathName);

async function getTpl() {
  const { res } = await Inquirer.prompt({
    type: 'input',
    name: 'res',
    message: 'please enter your func-api template name',
  });
  return res;
}


const urlFunc = async (...args) => {
  const spinner = ora('featching swagger doc...');
  spinner.start();
  // 请求
  const res = await Axios.default.get(args[0]);
  spinner.succeed();
  // 写入文件
  // fs.writeFileSync(resolve('../data/swagger.json'), );

  // const targetPath = resolve('../data/swagger.json');

  // 目标路径生成文件夹
  // 文件夹名称

  const tplPath = await getTpl();


  const tplName = path.join(process.cwd(), tplPath);
  // 根据路径渲染
  try {
    const { outputPath } = renderTpl(tplName, (res.data));
    console.log('渲染完成', outputPath);
  } catch (e) {
    console.log('渲染失败');
  }
};

const pathFunc = (...args) => {
  console.log('暂时不满足路径功能', process.cwd());
};


module.exports = {
  urlFunc,
  pathFunc,
};
