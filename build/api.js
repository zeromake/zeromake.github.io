const KoaRuoter = require('koa-router')
const co = require('co')
const fs = require('fs')
const path = require('path')
const pify = require('pify')
const readline = require('readline')
const yaml = require('js-yaml')
const marked = require('marked-zm')
const Prism = require('prismjs')
// const hljs = require('highlight.js')
const { postDir } = require('./config')

global.Prism = Prism

const router = new KoaRuoter()
let toc = []

// function zescapeFun(html, encode) {
//     html = html.replace(!encode ? /&(?!#?\w+;)/g : /&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
//     return html;
// }
marked.use(function(self) {
    const defaultImage = self.Renderer.prototype.image
    self.Renderer.prototype.image = function(href, title, text) {
        if (href.endsWith(".svg")) {
            return `<object data="${href}" type="image/svg+xml" title="${title}" alt="${text}"></object>`
        } else {
            return defaultImage.call(this, href, title, text)
        }
    }
    const defaultHead = self.Renderer.prototype.heading
    self.Renderer.prototype.heading = function(text, level) {
        // const escapedText = zescapeFun(text.toLowerCase());
        const tocItem = {
            text: text,
            level: level
            // escape: escapedText
        }
        toc.push(tocItem)
        var escapedText = text.toLowerCase();
        return '<h' + level + ' class="heading">' + text + '</h' + level + '>';
        // return defaultHead.call(this, text, level)
    }
    return {
        type: "image"
    }
})
marked.setOptions({
    langPrefix: 'language-',
    highlight: function (code, lang) {
        if (lang){
            try {
                lang = lang.trim().toLocaleLowerCase()
                if (!Prism.languages[lang]) {
                    if (lang === 'shell') {
                        lang = 'bash'
                    }
                    require('prismjs/components/prism-' + lang + '.min.js')
                }
                return Prism.highlight(code, Prism.languages[lang])
            } catch(e) {
                console.error(e)
            }
        }
        return code
    }
})

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
        let yamlData = ''
        let markdownData = ''
        const option = end ? { start: 0, end: end } : undefined
        const file = path.join(fileDir, fileName)
        const readableStream = fs.createReadStream(file, option)
        const read = readline.createInterface({ input: readableStream })
        read.on('line', function (line) {
            if (isYaml) {
                if (line === '') {
                    isYaml = false
                    return
                }
                yamlData += line + '\n'
            } else {
                markdownData += line + '\n'
            }
        })
        read.on('close', () => {
            const yamlObj = yaml.safeLoad(yamlData)
            // if (yamlObj.date) {
            //     yamlObj.date = new Date(yamlObj.date + 8 * 3600000)
            // }
            // if (yamlObj.date) {
            //     yamlObj.last_date = new Date(yamlObj.last_date + 8 * 3600000)
            // }
            yamlObj['filename'] = encodeURIComponent(fileName.substring(0, fileName.lastIndexOf('.')))
            resolve({ yaml: yamlObj, markdown: end ? null : markdownData })
        })
    })
}

const convert = function (fun) {
    return (ctx, next) => co(fun, ctx, next)
}

router.get('/api/posts.json', convert(function * (ctx, next) {
    const files = yield pify(fs.readdir)(postDir)
    const yamls = yield Promise.all(files.filter(filename => {
        if (filename.indexOf('.md') > 0) {
            return true
        }
    }).map(filename => readMarkdown(postDir, filename, 300).then(({ yaml }) => Promise.resolve(yaml))))
    yamls.sort((a, b) => b.date - a.date)
    ctx.body = yamls
    // yield pify(fs.readdir)(postDir)
}))
router.get('/api/pages/:page.json', convert(function * (ctx, next) {
    const page = ctx.params.page
    if (fs.existsSync(path.join(postDir, page + '.md'))) {
        const { yaml, markdown } = yield readMarkdown(postDir, page + '.md')
        const pageBody = markdown && marked(markdown)
        yaml['body'] = pageBody
        yaml['toc'] = toc
        toc = []
        ctx.body = yaml
    } else {
        ctx.status = 404
        ctx.body = '404|Not Blog Page'
    }
}))
module.exports = router
