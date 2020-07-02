const fs = require('fs');

const paseName = (str) => str.replace(/\/\{id\}/g);


class ReplaceStr {
  constructor(str) {
    this.str = str;
  }

  replace(regExp, content) {
    this.str = this.str.replace(regExp, content);
    return this;
  }

  toStr() {
    return this.str;
  }
}

function isObject(tar) {
  return Object.prototype.toString.call(tar) === '[object Object]';
}

function getNowFormatDate() { // 获取当前时间
  const date = new Date();
  const seperator1 = '-';
  const seperator2 = ':';
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const strDate = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  const currentdate = `${date.getFullYear() + seperator1 + month + seperator1 + strDate
			 } ${date.getHours()}${seperator2}${date.getMinutes()
			 }${seperator2}${date.getSeconds()}`;
  return currentdate;
}

function deleteFolderRecursive(path) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file) => {
      const curPath = `${path}/${file}`;
      if (fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

module.exports = {
  paseName, ReplaceStr, isObject, getNowFormatDate, deleteFolderRecursive,
};
