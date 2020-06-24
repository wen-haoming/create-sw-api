<h1 align="center">create-sw-api</h1>

<div >能够将swagger文档一键转化成前端需要的请求api方法</div>

<br/>

![](https://cdn.nlark.com/yuque/0/2020/png/276215/1592412249023-1a047b04-f311-4223-9f02-e70ade3c6500.png?x-oss-process=image%2Fresize%2Cw_651)

## ✨ Features

- 简单易用，一键转化
- 模板支持，易用扩展
- 注释生成, 容易辨识

## 📦 Install

```bash
    npm install create-sw-api -g
```

## 🖥  Command

```
$ sw-api

    Usage: sw-api [options] [command]

    Options:
      -V, --version   output the version number 
      -h, --help      display help for command

    Commands:
      url           resolve url
      path          resolve path
      help [command]  display help for command

    Explames:
    sw-api url <api-docs-url>
    sw-api path <file-path>
```

## 🔨 Usage

模板变量名 | 含义 
-|-
 apiname | 最后生成的api名称 |
params | 解构出来的参数<b>对象</b> |
method | 方法名称比如get,post等 | 
url | url |
query | get的query参数放在对象里面 |
body| 如果该方法没有body参数则渲染一个空对象(暂时没想到一个好方案)

```js
// example
// tpl.js
module.exports = ` export const {{apiname}} = ({{params}}) => request('{{url}}', {{{query}}}, {
    method: '{{method}}',
    body: {{body}},
});
`
```

## 😄 step

1. npm install create-sw-api -g
2. 准备模版文件,根据你的项目不一样，编写自己的模板代码
3. 谷歌浏览器打开swagger文档地址, 打开调试模式的Network面板，查看其中**api-docs**名称的地址,并且复制下来
4. 输入命令sw-api url **api-docs**名称的地址
5. 输入当前制定的模板路径名称
6. 自动生成完毕

