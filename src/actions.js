const { urlFunc, pathFunc,defaultAction } = require('./core/index');



// .option('-c, --cheese <type>', 'Add the specified type of cheese', 'blue');

const mapActions = {
  // url: {
  //   action: urlFunc,
  //   option:['-u, --url','Please enter your url'],
  // },
  config:{
    option:['-c, --config','Please enter the path of <sw.config.js>'],
    action:defaultAction
  },
};



module.exports = {
  mapActions,
  defaultAction
};
