/**
* 管理与自定义环境相关的文件。
* 注意：此模块是一个单实例模块，在当前项目都为多实例的情况下，不是一种很好的设计。
* @namespace
* @name Env
*/

const path = require('path');
const $String = require('@definejs/string');
const Patterns = require('@definejs/patterns');

const mapper = new Map();


class Env {
    constructor(name, name$patterns) {
        let meta = {
            'name': name,           //当前环境名称。
            'list': [],             //item = { name, patterns, };
            'name$patterns': {},    //
            'this': this,
        };

        Object.entries(name$patterns).forEach(([name, patterns]) => {
            if (!Array.isArray(patterns)) {
                patterns = [patterns];
            }

            meta.list.push({ name, patterns, });
            meta.name$patterns[name] = patterns;
        });

        mapper.set(this, meta);

        Object.assign(this, {
            'name': meta.name,
        });

    }

    /**
    * 检测指定的文件所属的环境名称。
    * @param {string} file 必选，要检测的文件路径。
    * @returns {string} 返回被检测文件所属的环境名称。
    *   如果不属于任何环境，则返回空字符串。
    */
    check(file) {
        let meta = mapper.get(this);

        let item = meta.list.find((item) => {
            //后缀名，不包括 `.`，如 `js`。
            let ext = path.extname(file).slice(1);

            let patterns = item.patterns.map((pattern) => {
                return $String.format(pattern, { ext, });
            });

            let matches = Patterns.match(patterns, [file]);
            return matches.length > 0;
        });

        return item ? item.name : '';
    }

    /**
    * 过滤出符合当前环境的文件列表。
    * @param {Array} files 要进行过滤的文件列表。
    * @returns 
    */
    filter(files) {
        let meta = mapper.get(this);

        //未设定当前环境名称，则不进行过滤，原样返回。
        if (!meta.name) {
            return files;
        }

        files = files.filter(function (file) {
            let name = meta.this.check(file);
            return !name || name == meta.name;
        });

        return files;
    }

    /**
    * 分析统计与环境相关的文件信息。
    * 已重载 stat(files);
    * 已重载 stat(dir, patterns);
    * 已重载 stat(dir, patterns, excludes);
    * @param {string} dir 基目录。 一般是 `htdocs/`。
    * @param {Array} patterns 要获取的文件的模式列表。 
    * @param {Array} excludes 要排除的文件的模式列表。 
    */
    stat(dir, patterns, excludes) {
        let files =
            Array.isArray(dir) ? dir : //重载 stat(files);
                Patterns.getFiles(dir, patterns || ['**/*'], excludes);


        let meta = mapper.get(this);
        let name$env = {};

        meta.list.forEach((item) => {
            name$env[item.name] = {
                'patterns': item.patterns,
                'files': [],
            };
        });

        files.forEach((file) => {
            let name = meta.this.check(file);

            //不属于任何环境。
            if (!name) {
                return;
            }

            name$env[name].files.push(file);
        });

        return name$env;
    }

}


module.exports = Env;