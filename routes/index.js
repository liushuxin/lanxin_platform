const router = require('koa-router')()
const userModel = require('../lib/mysql')   //引入数据库方法
router.get('/', async (ctx, next) => {
  await  userModel.findUser()
        .then(result => {
          console.log( JSON.parse(JSON.stringify(result)))
           
        })
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
})

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
