const rules = require('./webpack.rules');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});

// 添加图片资源处理规则
rules.push({
  test: /\.(png|jpe?g|gif|ico|svg)$/i,
  type: 'asset/resource',
  generator: {
    filename: 'assets/[name][ext]'
  }
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
};
