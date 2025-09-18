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

// 添加字体资源处理规则（用于 KaTeX 等字体）
rules.push({
  test: /\.(woff2?|ttf|eot|otf)$/i,
  type: 'asset/resource',
  generator: {
    filename: 'assets/fonts/[name][ext]'
  }
});

module.exports = {
  // Put your normal webpack config below here
  module: {
    rules,
  },
};
