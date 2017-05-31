const KoaRuoter = require('koa-router')
const co = require('co')
const fs = require('fs')
const path = require('path')
const router = new KoaRuoter()
const pify = require('pify')
const readline = require('readline')
const yaml = require('js-yaml')
const marked = require('marked-zm')
const hljs = require('highlight.js')
marked.setOptions({
    langPrefix: '',
    highlight: function (code, lang) {
        return hljs.highlightAuto(code).value
    }
})

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
            yamlObj['filename'] = fileName.substring(0, fileName.lastIndexOf('.'))
            resolve({ yaml: yamlObj, markdown: end ? null : markdownData })
        })
    })
}

const postDir = path.resolve(__dirname, 'posts')

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
    yield pify(fs.readdir)(postDir)
}))
router.get('/api/pages/:page.json', convert(function * (ctx, next) {
    const page = ctx.params.page
    if (fs.existsSync(path.join(postDir, page + '.md'))) {
        const { yaml, markdown } = yield readMarkdown(postDir, page + '.md')
        const pageBody = markdown && marked(markdown)
        yaml['body'] = pageBody
        ctx.body = yaml
    } else {
        ctx.status = 404
        ctx.body = '404|Not Blog Page'
    }
}))
module.exports = router
