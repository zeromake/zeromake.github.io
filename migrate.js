const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const readline = require('readline')
const pify = require('pify')
const yaml = require('js-yaml')


function hasText(text) {
    return text.length > 0 && !text.startsWith("$$")
}

const reg = /\$([^\$]+)\$/ig

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
        let texStart = false
        let admonition = false
        read.on('line', function (line) {
            let text = line.trim()
            if (text.startsWith('$$') && text.endsWith('$$') && text.length > 4) {
                line = `<div class="katex-display">\n${text}\n</div>`
                text = line
            } else if (text.startsWith('$$')) {
                if (texStart) {
                    texStart = false
                    const tmp = text.substring(0, text.length - 2)
                    line = `${tmp}${hasText(tmp) ? "\n" : ""}$$\n</div>`
                    text = line
                } else {
                    texStart = true
                    const tmp = text.substring(2)
                    line = `<div class="katex-display">\n$$${hasText(tmp) ? "\n" : ""}${tmp}`
                    text = line
                }
            } if (text.startsWith("!!!")) {
                if (admonition) {
                    admonition = false
                } else {
                    admonition = true
                }
                return
            } else {
                // handel
                if (reg.test(text)) {
                    line = text.replace(reg, "<span class=\"katex\">$$1$</span>")
                }
            }
            if (admonition) {
                line = `> ${line}`
            }

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

const fsReaddir = pify(fs.readdir)

const postDir = "./posts"

async function readPosts() {
    const end = null
    const files = await fsReaddir(postDir)
    const yamls = await Promise.all(files.filter((filename) => {
        if (filename.indexOf('.md') > 0) {
            return true
        }
    }).map(filename => readMarkdown(postDir, filename, end).then(({ yaml, _, markdown }) => {
        yaml.content = markdown
        yaml.file = filename.substr(0, filename.length - 3)
        return Promise.resolve(yaml)
    })))
    const data = yamls.filter(i => !!i).sort((a, b) => b.date - a.date)
    return data
}


readPosts().then(async function (resp) {
    for (post of resp) {
        const text = post.content
        delete post.content
        const name = post.file
        delete post.file
        delete post.filename
        post.lastmod = post.last_date
        delete post.last_date
        if (!post.lastmod) {
            post.lastmod = post.date
        }
        post.categories = [post.type]
        delete post.type
        post.slug = name
        post.draft = !!post.private
        delete post.private
        const meta = yaml.safeDump(post)
        const out = path.join("content", name + ".md")
        await fse.writeFile(out, `---\n${meta}---\n${text}`)
    }
})
