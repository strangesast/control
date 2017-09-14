const testing = {
  secret: 'toastToastTOAST',
  host: 'localhost',
  databaseName: 'testing',
};

const config = {
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
};

export default config;
