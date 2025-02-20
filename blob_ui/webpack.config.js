module.exports = {
    // Votre configuration existante reste inchangée
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
              plugins: ['@babel/plugin-syntax-import-meta', '@babel/plugin-proposal-import-meta'] // Ajout du plugin ici
            }
          }
        },
        {
          test: /\.js$/,
          include: /node_modules\/@zip\.js/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-syntax-import-meta', '@babel/plugin-proposal-import-meta'] // Assurez-vous d'ajouter le plugin ici également
            }
          }
        }
      ]
    },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  resolve: {
    fallback: {
      "fs": false,
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser")
    }
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 9000
  }
};
