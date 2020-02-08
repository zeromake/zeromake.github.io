const fs = require('fs')
const path = require('path')
const readline = require('readline')
const pify = require('pify')
const yaml = require('js-yaml')
const { Feed } = require('feed')
const marked = require('./markdown-it-renderer')()
const { postDir, aloneDir } = require('./config')
const isProd = process.env.NODE_ENV === 'production'

// const postDir = './posts'
// const aloneDir = './alone'
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
        const option = end ? { start: 0, end } : undefined
        const file = path.join(fileDir, fileName)
        const readableStream = fs.createReadStream(file, option)
        const read = readline.createInterface({ input: readableStream })
        let yamlStart = false
        read.on('line', function (line) {
            if (isYaml) {
                if (!yamlStart && line === '---') {
                    yamlStart = true
                    return
                }
                if (yamlStart && line === '---') {
                    isYaml = false
                    more = true
                    return
                }
                yamlData += line + '\n'
            } else if (more) {
                markdownData += line + '\n'
                if (line.startsWith('#')) {
                    return
                }
                if (line.startsWith('+') || line.startsWith('-')) {
                    line = line.substr(1)
                }
                if (line.trim() === '<!--more-->') {
                    more = false
                    return
                }
                moreData += line + '\n'
            } else {
                markdownData += line + '\n'
            }
        })
        read.on('close', () => {
            if (more) {
                moreData = null
            }
            const yamlObj = yaml.safeLoad(yamlData)
            yamlObj.filename = encodeURIComponent(fileName.substring(0, fileName.lastIndexOf('.')))
            resolve({ yaml: yamlObj, markdown: end ? null : markdownData, more: moreData })
        })
    })
}

function dictToArray(obj) {
    const tmp = []
    for (const key in obj) {
        tmp.push(key)
    }
    return tmp
}

const fsReaddir = pify(fs.readdir)

async function readPosts(render = false) {
    const end = render ? null : 1000
    const files = await fsReaddir(postDir)
    const types = Object.create(null)
    const tags = Object.create(null)
    const yamls = await Promise.all(files.filter((filename) => {
        if (filename.indexOf('.md') > 0) {
            return true
        }
    }).map(filename => readMarkdown(postDir, filename, end).then(({ yaml, more, markdown }) => {
        if (Array.isArray(yaml.tags)) {
            yaml.tags.forEach(function (tag) {
                if (tag) {
                    tags[tag] = true
                }
            })
        }

        // 私有文章仅在本地开发模式显示
        if (yaml.private && isProd) {
            return Promise.resolve(null)
        }
        if (yaml.type) {
            types[yaml.type] = true
        }
        if (render) {
            yaml.content = marked.render(markdown)
        } else {
            yaml.content = more ? marked.render(more) : null
        }
        yaml.file = filename.substr(0, filename.length - 3)
        return Promise.resolve(yaml)
    })))
    const data = yamls.filter(i => !!i).sort((a, b) => b.date - a.date)
    return {
        posts: data,
        types: dictToArray(types),
        tags: dictToArray(tags)
    }
}

async function Posts(ctx) {
    ctx.body = await readPosts()
}
async function Page(ctx) {
    const page = ctx.params.page
    if (fs.existsSync(path.join(postDir, page + '.md'))) {
        const { yaml, markdown } = await readMarkdown(postDir, page + '.md')
        let pageBody = markdown
        let toc = null
        if (markdown) {
            [pageBody, toc] = marked.renderToc(markdown)
        }
        yaml.body = pageBody
        yaml.toc = toc
        ctx.body = yaml
    } else {
        ctx.status = 404
        ctx.body = '404|Not Blog Page'
    }
}

async function Alone(ctx) {
    const page = ctx.params.page
    const fileName = page + '.md'
    if (fs.existsSync(path.join(aloneDir, fileName))) {
        const { yaml, markdown } = await readMarkdown(aloneDir, fileName)
        let pageBody = markdown
        let toc = null
        if (markdown) {
            [pageBody, toc] = marked.renderToc(markdown)
        }
        yaml.body = pageBody
        yaml.toc = toc
        ctx.body = yaml
    } else {
        ctx.status = 404
        ctx.body = '404|Not blog alone page'
    }
}
const feedConfig = {
    title: 'zeromake\'blog',
    description: 'keep codeing and thinking!',
    id: 'https://blog.zeromake.com',
    link: 'https://blog.zeromake.com',
    language: 'zh',
    favicon: 'https://blog.zeromake.com/favicon.ico',
    copyright: 'All rights reserved 2019, zeromake<a390720046@gmail.com>',
    updated: new Date(),
    generator: 'Feed for Node.js',
    feedLinks: {
        atom: 'https://blog.zeromake.com/api/atom.xml'
    },
    author: {
        name: 'zeromake',
        email: 'a390720046@gmail.com',
        link: 'https://github.com/zeromake'
    }
}

async function FeedContoller(ctx) {
    const { posts } = await readPosts(true)
    const feed = new Feed(feedConfig)
    for (const post of posts.slice(0, 5)) {
        const url = `https://blog.zeromake.com/pages/${post.file}`
        feed.addItem({
            title: post.title,
            id: url,
            link: url,
            content: post.content,
            date: post.last_date
        })
    }
    ctx.body = feed.atom1()
}

module.exports = {
    Posts,
    Page,
    Alone,
    Feed: FeedContoller
}
