const Koa = require('koa')
const convert = require('koa-convert')

const app = new Koa()
app.use(convert(function * (next) {
    this.request.socket.on('data', function (res) {
        console.log(res)
    })
    console.log(this.request.body)
    this.body = 'HELLO'
}))
app.listen(8086, '0.0.0.0', () => {
    console.log('server started at localhost: 8086')
})
