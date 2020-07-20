const { urlFunc, pathFunc } = require('./core/index');

const mapActions = {
  url: {
    alias: 'u',
    description: 'Please enter your <swagger-api-doc>',
    action: urlFunc,
    example: ['sw-api url <url>'],
  },
  path: {
    alias: 'p',
    description: 'Please enter your <swagger-api-doc>',
    action: pathFunc,
    example: ['sw-api url <path>'],
  },
};

module.exports = {
  mapActions,
};
