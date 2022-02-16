let babelEnvOpt = {
  targets: {
    browsers: ['defaults', 'ie >= 11, iOS >= 7, Android >= 4'],
    node: 8
  }
}

if (process.env['NODE_ENV'] !== 'test') {
  babelEnvOpt.modules = false
}

module.exports = {
  presets: [
    ['@babel/env', babelEnvOpt],
    '@babel/typescript',
  ],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/proposal-class-properties'],
    ['@babel/plugin-transform-runtime', {
      "regenerator": true
    }]
  ],
  env: {
    test : {
      presets: [["env", { "targets": { "node": "current" } }]]
    }
  }
}
