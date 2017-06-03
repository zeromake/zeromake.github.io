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
export function formatTime (time) {
    if (time) {
        const date = new Date(time)
        const month = date.getMonth() + 1
        const day = date.getDate()
        return [date.getFullYear(), month > 9 ? month : '0' + month, day > 9 ? day : '0' + day].join('-')
    } else {
        return ''
    }
}
function pluralize (time, label) {
    return time + ' ' + label
}
