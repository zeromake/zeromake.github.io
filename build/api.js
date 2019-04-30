const KoaRuoter = require('koa-router')
const co = require('co')
const fs = require('fs')
const path = require('path')
const pify = require('pify')
const readline = require('readline')
const yaml = require('js-yaml')
const { postDir } = require('./config')
const marked = require('./renderer')()
const router = new KoaRuoter()

/**
* 读取yaml,markdown的混合文件
* @param {String} fileDir - 文件夹
* @param {String} fileName - 文件名
* @param {Number} end - 文件读取截断(可选)
* @returns {Promise.resolve(Object{yaml, markdown})} 返回一个Promise对象
*/
const readMarkdown = function (fileDir, fileName, end) {
    return new Promise(function (resolve, reject) {
        let isYaml = true
        let more = false
        let yamlData = ''
        let markdownData = ''
        let moreData = ''
        const option = end ? { start: 0, end: end } : undefined
        const file = path.join(fileDir, fileName)
        const readableStream = fs.createReadStream(file, option)
        const read = readline.createInterface({ input: readableStream })
        read.on('line', function (line) {
            if (isYaml) {
                if (line === "---") {
                    return
                }
                if (line === '...') {
                    isYaml = false
                    more = true
                    return
                }
                yamlData += line + '\n'
            } else if(more) {
                markdownData += line + '\n'
                if(line.startsWith('#')) {
                    return
                }
                if(line.startsWith('+') || line.startsWith('-')) {
                    line = line.substr(1)
                }
                if(line === '<!--more-->') {
                    more = false
                    return
                }
                moreData += line + '\n'
            } else {
                markdownData += line + '\n'
            }
        })
        read.on('close', () => {
            if(more) {
                moreData = null
            }
            const yamlObj = yaml.safeLoad(yamlData)
            yamlObj['filename'] = encodeURIComponent(fileName.substring(0, fileName.lastIndexOf('.')))
            resolve({ yaml: yamlObj, markdown: end ? null : markdownData, more: moreData })
        })
    })
}

const convert = function (fun) {
    return (ctx, next) => co(fun, ctx, next)
}
function dictToArray(obj) {
    const tmp = []
    for (const key in obj) {
        tmp.push(key)
    }
    return tmp
}

router.get('/api/posts.json', convert(function * (ctx, next) {
    const files = yield pify(fs.readdir)(postDir)
    const types = Object.create(null)
    const tags = Object.create(null)
    const yamls = yield Promise.all(files.filter(filename => {
        if (filename.indexOf('.md') > 0) {
            return true
        }
    }).map(filename => readMarkdown(postDir, filename, 1000).then(({ yaml, more }) => {
        yaml.tags.forEach(function(tag) {
            if (tag) {
                tags[tag] = true
            }
        });
        if (yaml.type) {
            types[yaml.type] = true
        }
        yaml.content = more ? marked.render(more) : null
        return Promise.resolve(yaml)
    })))
    yamls.sort((a, b) => b.date - a.date)
    const data = {
        posts: yamls,
        types: dictToArray(types),
        tags: dictToArray(tags)
    }
    ctx.body = data
}))
router.get('/api/pages/:page.json', convert(function * (ctx, next) {
    const page = ctx.params.page
    if (fs.existsSync(path.join(postDir, page + '.md'))) {
        const { yaml, markdown } = yield readMarkdown(postDir, page + '.md')
        const pageBody = markdown && marked.render(markdown)
        yaml['body'] = pageBody
        yaml['toc'] = marked.toc();
        ctx.body = yaml
    } else {
        ctx.status = 404
        ctx.body = '404|Not Blog Page'
    }
}))
module.exports = router
