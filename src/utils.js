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

module.exports = { paseName, ReplaceStr };
