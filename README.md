# create-sw-api

## 🙋‍♂️why？

1. 你是否曾经遇到过**swagger**文档上有**上百个接口**，然后你要每一个自己**手写**出来, 效率和正确率大幅下降。 现在你只需要工具一键生成所有的axios接口～
1. **typescript**的项目里**axios**的返回数据通常都难以定义，但是现在工具能够帮你**完整生成类型推导**！



![image.png](https://cdn.nlark.com/yuque/0/2020/png/276215/1595924490964-944d06da-16a1-4baf-b673-0752e6f6f2b2.png#align=left&display=inline&height=256&margin=%5Bobject%20Object%5D&name=image.png&originHeight=512&originWidth=1776&size=127737&status=done&style=none&width=888)
![image.png](https://cdn.nlark.com/yuque/0/2020/png/276215/1595924461701-a4596403-2954-45f9-973d-91d9016f3cda.png#align=left&display=inline&height=232&margin=%5Bobject%20Object%5D&name=image.png&originHeight=464&originWidth=940&size=47344&status=done&style=none&width=470)

## ✨ Features

- 只需要一个配置文件，方便项目迁移
- 模板支持，接口风格自由定义
- 注释生成, 容易辨识
- **生成typescript**的类型推导

## 📦 Install


```bash
npm install create-sw-api -D
```


## 🖥  Command


```bash
Usage: sw-api [options]

Options:
  -c, --config  Please enter the path of <sw.config.js>
  -h, --help    display help for command
```


## 🔨 Usage


1.  下载完成后，我们需要在项目的根目录建立一个配置文件，默认名称叫 **sw.config.js **的配置文件,执行命令sw-api能够自动执行该文件, 当然你也可以自由命名 sw-api --config xxx。



2. 配置文件编写

```js
// 定义模板
let tpl = ` export const {{apiname}} = ({{params}}) => request('{{url}}', {{{query}}}, {
  method: '{{method}}',
  body: {{body}},
});
`

module.exports = {
    // entry 是swagger的一个叫api-doc的接口，可以从浏览器的网络面板中查看
    entry:"http://xxxxxx/api-docs",
    template:tpl, // 渲染的模板
    header:`import request from  '../../request'`, // 该文件需要引入的模块
    typescript: true, // 是否支持ts
}
```

3. ** **配置package.json里面script的字段 比如:  

```js
"scripts": {
    "api":"sw-api " // or  "api": "sw-api --config xxx.js" 执行指定对应配置文件
  },
```

4.  直接输入 **npm run api** 即可



### template模板变量名称


使用的是与vue类似的模板语法的来定义



| 模板变量名 | 含义                                                         |
| ---------- | ------------------------------------------------------------ |
| apiname    | 最后生成的api名称                                            |
| params     | 解构出来的参数**对象**                                       |
| method     | 方法名称比如get,post等                                       |
| url        | url                                                          |
| query      | get的query参数放在对象里面                                   |
| body       | 如果该方法没有body参数则渲染一个空对象 (暂时没想到一个好方案) |







## 📝Advanced usage


```javascript
module.exports = {
    // entry 是swagger的一个叫api-doc的接口，可以从浏览器的网络面板中查看
    entry:"http://icity-dev.cloud.cityworks.cn/api/sheshijianguan/v2/api-docs",
    template:tpl, // 渲染的模板
 
    header:`import request from  '../../request'`, // 每个文件中引入的模块
    typescript: true, // 是否支持ts
    output:{
      path:('./apitest')
    },
    filterName:{
      1:'map',
      2:'Controller',
      3:'Check'
    },
    isAxiosTypes:false, 
}
```



| 参数名称     | 类型    | 含义                                                       |
| ------------ | ------- | ---------------------------------------------------------- |
| entry        | stirng  | swagger的一个叫api-doc的接口，可以从浏览器的网络面板中查看 |
| template     | string  | 模板字符串                                                 |
| header       | string  | string 渲染模板的头部                                      |
| footer       | string  | string  渲染模板的尾部                                     |
| typescript   | boolean | 是否支持ts                                                 |
| filterName   | object  | 对应名称的映射                                             |
| isAxiosTypes | boolean | typescript 模式下 是否支持直接返回axios类型                |



## 😘Q&A


#### 1. 默认渲染的文件名称太长了有什么方法呢？


请参考高级用法的 filterName 参数,默认是按照swagger的顺序映射的，key为swagger对应的类别的索引,value为映射名称。

