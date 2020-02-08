const Router = require('koa-router')

const router = new Router()

const {
    Posts,
    Page,
    Alone,
    Feed
} = require('./controller')

router.get('/api/posts.json', Posts)

router.get('/api/pages/:page.json', Page)
router.get('/api/alone/:page.json', Alone)

router.get('/api/atom.xml', Feed)

module.exports = router
