<h1 align="center">create-sw-api</h1>

<div align="center">能够将swagger文档一键转化成前端需要的api接口</div>



## ✨ Features

- 简单易用，一键转化
- 模板支持，易用扩展
- 支持注释生成
- 支持生成ts类型文件

## 📦 Install

```bash
    npm install create-sw-api -g
```

```bash
    yarn add create-sw-api -g
```


## 🖥  Command

```
$ sw-api

    Usage: sw-api [options] [command]

    Options:
      -V, --version   output the version number
      -h, --help      display help for command

    Commands:
      url|u           resolve url
      path|p          resolve path
      help [command]  display help for command

    Explames:
    sw-api url <url>
    sw-api url <path>
```

## 🔨 Usage

```js

// example
module.exports = ` export const {{apiname}} = ({{params}}) => request('{{url}}', {{{query}}}, {
    method: '{{method}}',
    body: {{body}},
});

`

```

```bash
       sw-api url  <swagger-api-docs>

       enter your tplNameFile
```

