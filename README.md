# @webpart/env

与自定义环境相关的文件检测与过滤功能。


`npm install @webpart/env`

``` javascript

const Env = require('@webpart/env');

//指定当前环境名称为 `dev`。
let env = new Env('dev', {
    'dev': '**/*.env.dev.{ext}',

    'prd': [
        '**/*.env.prd.css',
        '**/*.env.prd.less',
        '**/*.env.prd.html',
        '**/*.env.prd.js',
    ],
});

//获取指定文件所属的环境名。
//返回 'prd';
env.check('htdocs/config.env.prd.js'); 

//返回 '';
env.check('htdocs/hello.js'); 

let files = env.filter([
    'htdocs/test.env.dev.js',
    'htdocs/config.env.dev.js',
    'htdocs/config.env.prd.js',
]);

//由于当前环境名称为 `dev`，则过滤后的 files 为：
files = [
    'htdocs/test.env.dev.js',
    'htdocs/config.env.dev.js',
];


```

