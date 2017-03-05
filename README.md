logs-loader
=======================

## [Logs Loader](https://gasite.in.ua/open-source/logs-loader/)

Embed meaningful logs into your webpack bundle.


## Requirements

- [Node](https://nodejs.org) 7.5.0 or newer (not tested on earlier versions)
- [Typescript](https://www.typescriptlang.org) 2.1.5 or newer (not tested on earlier versions)
- [Babel](https://babeljs.io) 6.2.2 or newer (not tested on earlier versions)


## Installation
```sh
npm i logs-loader --save-dev
```
or
```sh
yarn add logs-loader --dev
```

## Usage
A webpack loader that enhances your logs by adding the file and the object logging.
# src/index.js
```javascript
const test = ['test'];
console.info(test.length);
```
# webpack.config.js
```javascript
const path = require("path");
module.exports = {
  entry: {
    app: path.resolve(__dirname, "src", "index.js")
  },
  output: {
      path: path.resolve(__dirname, "build"),
      filename: "app.js"
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        use: [
          {
            loader: 'babel-loader',
            query: {
              babelrc: false,
              extends: path.resolve(__dirname, '.babelrc'),
              plugins: [
                ...(
                  !production ? [
                      "react-hot-loader/babel",
                    ] : []
                ),
                ...(
                  production ? [
                      "transform-remove-console",
                      // ["transform-replace-object-assign", "simple.assign"],
                    ] : []
                ),
              ],
            },
          },
          {loader: 'ts-loader', options: {transpileOnly: false}},
          {loader: 'tslint-loader'},
          {
            loader: 'logs-loader',
            query: {
              patterns: ["console"],
            },
          },
        ],
      },
      {
        test: /\.jsx?$/,
        include: [
          path.resolve(__dirname, 'src'),
        ],
        use: [
          {loader: 'babel-loader'},
          {
            loader: 'logs-loader',
            query: {
              patterns: ["console"],
            },
          },
        ],
      },
    ],
  },
};
```
# build/app.js
```javascript
const test = ['test'];
console.log("/src/index.js:2:test.length", test.length);
```
By default it modifies all console commands: console.error, console.log... But it can be customized. To modify all winstons logs the "patterns" would be:
# webpack.config.js
```javascript
query: {
  patterns: ["winston"],
},
```
# src/index.js
```javascript
const test = ['test'];
winston(test.length);
winston.info(test.length);
```
# build/app.js
```javascript
const test = ['test'];
winston("/src/index.js:2:test.length", test.length);
winston.info("/src/index.js:3:test.length", test.length);
```
Or
# webpack.config.js
```javascript
query: {
  patterns: ["winston"],
  customLevels: ["debug1", "debug2"],
},
```
# src/index.js
```javascript
const test = ['test'];
winston.debug1(test.length);
winston.debug2(test.length);
```
# build/app.js
```javascript
const test = ['test'];
winston.debug1("/src/index.js:2:test.length", test.length);
winston.debug2("/src/index.js:3:test.length", test.length);
```


#### Properties
| Props        | Options           | Default  | Description |
| ------------- |-------------| -----| -------- |
| patterns | string | Array[string] | ["console"] | Sets pattern of logger call.|
| customLevels | string | Array[string] | [] | Sets additional custom logging levels.|


## Contribute

1. [Submit an issue](https://github.com/gordienkotolik/logs-loader/issues)
2. Fork the repository
3. Create a dedicated branch (never ever work in `master`)
4. The first time, run command: `yarn` into the directory
5. Fix bugs or implement features


## License
This project is licensed under the terms of the
[MIT license](https://github.com/gordienkotolik/logs-loader/blob/master/LICENSE)