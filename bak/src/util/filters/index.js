export function host (url) {
    const host = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    const parts = host.split('.').slice(-3)
    if (parts[0] === 'www') parts.shift()
    return parts.join('.')
}

export function timeAgo (time) {
    time = (new Date(time).getTime())
    const between = (Date.now() - time) / 1000
    if (between < 60) {
        return pluralize(between, '秒')
    } else if (between < 3600) {
        return pluralize(~~(between / 60), '分钟')
    } else if (between < 86400) {
        return pluralize(~~(between / 3600), '小时')
    } else if (between < (86400 * 30)) {
        return pluralize(~~(between / 86400), '天')
    } else if (between < (86400 * 365)) {
        return pluralize(~~(between / (86400 * 30)), '月')
    } else {
        return pluralize(~~(between / (86400 * 365)), '年')
    }
}
function fullNumber(num, size) {
    let str = '';
    for(let i = size - 1; i >= 1; i--) {
        const max = Math.pow(10, i);
        if(num >= max) {
            break;
        }
        str += '0';
    }
    return `${str}${num}`;
}
/**
 *
 * @param {string} time
 */
export function formatTime (time) {
    if (time) {
        const date = new Date(time);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dateStr = [date.getFullYear(), fullNumber(month, 2), fullNumber(day, 2)].join('-');
        let offset = Math.floor(date.getTimezoneOffset() / 60);
        let isFlag = false;
        if(offset < 0) {
            offset = -offset;
            isFlag = true;
        }
        const timeStr = `${fullNumber(date.getHours(), 2)}:${fullNumber(date.getMinutes(), 2)}:${fullNumber(date.getSeconds(), 2)}${isFlag ? '+' : '-'}${fullNumber(offset, 2)}:00`;
        return dateStr + ' ' + timeStr;
    } else {
        return ''
    }
}

export function formatDate (time) {
    if (time) {
        const date = new Date(time);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return [date.getFullYear(), fullNumber(month, 2), fullNumber(day, 2)].join('-');
    } else {
        return ''
    }
}

function pluralize (time, label) {
    return time + ' ' + label
}
