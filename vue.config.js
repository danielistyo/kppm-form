module.exports = {
  devServer: {
    port: 8081,
    host: '0.0.0.0',
    allowedHosts: ['local.form.gkjw'],
  },
  lintOnSave: false,
  pwa: {
    iconPaths: {
      favicon32: 'favicon.ico',
      favicon16: 'favicon.ico',
      appleTouchIcon: 'favicon.ico',
      maskIcon: 'favicon.ico',
      msTileImage: 'favicon.ico',
    },
  },
};
