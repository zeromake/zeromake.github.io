

const TABLE_NAME = 'hljs-ln',
    LINE_NAME = 'hljs-ln-line',
    CODE_BLOCK_NAME = 'hljs-ln-code',
    NUMBERS_BLOCK_NAME = 'hljs-ln-numbers',
    NUMBER_LINE_NAME = 'hljs-ln-n',
    DATA_ATTR_NAME = 'data-line-number',
    BREAK_LINE_REGEXP = /\r\n|\r|\n/g;
function lineNumbersInternal (code, options) {
    // define options or set default
    options = options || {
        singleLine: false
    };

    // convert options
    var firstLineIndex = !!options.singleLine ? 0 : 1;

    code = duplicateMultilineNode(code, '');

    return addLineNumbersBlockFor(code, firstLineIndex);
}

function addLineNumbersBlockFor (code, firstLineIndex) {
    const lines = getLines(code);
    // if last line contains only carriage return remove it
    if (lines[lines.length-1].trim() === '') {
        lines.pop();
    }
    if (lines.length > firstLineIndex) {
        let html = '';

        for (let i = 0, l = lines.length; i < l; i++) {
            const lineIndex = i + 1;
            const line = lines[i];
            html += `<tr><td class="${LINE_NAME} ${NUMBERS_BLOCK_NAME}" ${DATA_ATTR_NAME}="${lineIndex}"><div class="${NUMBER_LINE_NAME}" ${DATA_ATTR_NAME}="${lineIndex}"></div></td><td class="${LINE_NAME} ${CODE_BLOCK_NAME}" ${DATA_ATTR_NAME}="${lineIndex}"><div class="${LINE_NAME}">${line.length > 0 ? line : ' '}</div></td></tr>`;
        }

        return `<table class="${TABLE_NAME}">${html}</table>`;
    }

    return code;
}


/**
 * Method for fix multi-line elements implementation in highlight.js
 * @param {string} innerHTML
 */
function duplicateMultilineNode(code, className) {
    const lines = getLines(code);
    let result = '';
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineText = line.length > 0 ? line : ' ';
        result += `${lineText}\n`;
        // result += `<span class="${className}">${lineText}</span>\n`;
    }
    return result.trim();
}

function getLines (text) {
    if (text.length === 0) return [];
    return text.split(BREAK_LINE_REGEXP);
}

// function getLinesCount (text) {
//     return (text.trim().match(BREAK_LINE_REGEXP) || []).length;
// }

// function async (func) {
//     setTimeout(func, 0);
// }

// /**
//  * {@link https://wcoder.github.io/notes/string-format-for-string-formating-in-javascript}
//  * @param {string} format
//  * @param {array} args
//  */
// function format (format, args) {
//     return format.replace(/\{(\d+)\}/g, function(m, n){
//         return args[n] ? args[n] : m;
//     });
// }
module.exports = lineNumbersInternal
