const testing = {
  secret: 'toastToastTOAST',
  host: 'localhost',
  databaseName: 'testing',
};
module.exports = {
  production: {
    secret: 'toastToastTOAST',
    host: 'localhost',
    databaseName: 'topview',
  },
  testing: testing,
  test: testing,
  development: {
    secret: 'toastToastTOAST',
    host: 'localhost',
    databaseName: 'topview',
  }
}
