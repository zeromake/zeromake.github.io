
const QuickLRU = require('quick-lru');
const { default: hash } =  require('@emotion/hash');

/**
 * @param {(s: string) => any} fun
 * @param {import('quick-lru').Options} opt
 * @returns {(key: string) => any}
 */
module.exports = function(fun, opt) {
    const cache = new QuickLRU(opt);
    /**
     * @param {string} key
     */
    return (key) => {
        const h = hash(key);
        if (cache.has(h)) {
            return cache.get(h);
        } else {
            const res = fun(key);
            cache.set(h, res);
            return res;
        }
    }
}
