module.exports = {
  template: ` export const {{apiname}} = ({{params}}) => request('{{url}}', {{{query}}}, {
      method: '{{method}}',
      body: {{body}},
    });
    `,
  header: 'import {request} from \'./api\'',
  mapFileName: ['error', 'yizhangtu', 'xialaguanli', 'jidu', 1, 2, 3],
};
