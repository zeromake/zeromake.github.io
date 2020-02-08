const TABLE_NAME = 'hljs-ln'
const LINE_NAME = 'hljs-ln-line'
const CODE_BLOCK_NAME = 'hljs-ln-code'
const NUMBERS_BLOCK_NAME = 'hljs-ln-numbers'
const NUMBER_LINE_NAME = 'hljs-ln-n'
const DATA_ATTR_NAME = 'data-line-number'
const BREAK_LINE_REGEXP = /\r\n|\r|\n/g

/**
 *
 * @param {string} code
 * @param {object} [options]
 * @param {boolean} options.singleLine
 * @returns {string}
 */
function lineNumbers(code, options) {
    options = options || {
        singleLine: false
    }

    // convert options
    const firstLineIndex = options.singleLine ? 0 : 1
    const lines = getLines(code)
    return addLineNumbersBlockFor(lines, firstLineIndex)
}

function addLineNumbersBlockFor(lines, firstLineIndex) {
    if (lines[lines.length - 1].trim() === '') {
        lines.pop()
    }
    if (lines.length > firstLineIndex) {
        let html = ''
        for (let i = 0, l = lines.length; i < l; i++) {
            const lineIndex = i + 1
            const line = lines[i]
            html += `<tr><td class="${
                LINE_NAME
            } ${
                NUMBERS_BLOCK_NAME
            }" ${
                DATA_ATTR_NAME
            }="${
                lineIndex
            }"><div class="${
                NUMBER_LINE_NAME
            }" ${
                DATA_ATTR_NAME
            }="${
                lineIndex
            }">${
                lineIndex
            }</div></td><td class="${
                LINE_NAME
            } ${
                CODE_BLOCK_NAME
            }" ${
                DATA_ATTR_NAME
            }="${
                lineIndex
            }"><div class="${
                LINE_NAME
            }">${
                line.length > 0 ? line + '' : ' '
            }</div></td></tr>`
        }
        return `<table class="${TABLE_NAME}">${html}</table>`
    }
    return lines.join('\n')
}

function getLines(text) {
    if (text.length === 0) {
        return []
    }
    return text.split(BREAK_LINE_REGEXP)
}

module.exports = lineNumbers
