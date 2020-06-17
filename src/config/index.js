
const summaryTpl = `
{{summary}}
`;

const paramTpl = `
/**
 * Assign the project to an employee.
 * @param {Object} defaults - {{summary}}.
 * @param {string} defaults.{{key}} - {{keyName}}.
 */
`;


module.exports = {
  pathKey: {
    get: 'get',
    post: 'post',
    delete: 'delete',
    put: 'put',
  },
  pathKeyArr: ['get', 'post', 'delete', 'put'],
  summaryTpl,
  paramTpl,
};
