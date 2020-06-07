const program = require('commander');
const { mapActions } = require('./actions');

const { version } = require('./constants');

Reflect.ownKeys(mapActions).forEach((key) => {
  program.command(key)
    .alias(mapActions[key].alias)
    .description(mapActions[key].description)
    .action(() => {
      mapActions[key].action(...process.argv.slice(3));
    });
});

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
