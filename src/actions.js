const { urlFunc, pathFunc } = require('./core/index');

const mapActions = {
  url: {
    alias: 'u',
    description: 'resolve url',
    action: urlFunc,
    example: ['sw-api url <url>'],
  },
  path: {
    alias: 'p',
    description: 'resolve path',
    action: pathFunc,
    example: ['sw-api url <path>'],
  },
};


module.exports = {
  mapActions,
};
