const { Command } = require('commander');

const { mapActions ,defaultAction} = require('./actions');

const { version } = require('./constants');

const program = new Command();

if(process.argv.length <= 2 ){
  defaultAction()
  return 
}

Reflect.ownKeys(mapActions).reduce((program,key)=>{
  let{option} =  mapActions[key]
  let [o1,o2] = option;
  program.option(o1,o2)
  return program
},program)

// 解析所有
program.parse(process.argv);

Reflect.ownKeys(mapActions).forEach(key=>{
  (()=>{
    let{action} =  mapActions[key]
    if(program[key]){
      action(process.argv)
    }
  })()
})

// 监听用户事件
program.on('--help', () => {
  console.log('\nExplames:');
  Reflect.ownKeys(mapActions).forEach((key) => {
    mapActions[key].example.forEach((item) => {
      console.log(item);
    });
  });
});

// 解析用户传递的参数
program.version(version).parse(process.argv);
