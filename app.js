const Koa = require("koa");
const app = new Koa();
const axios = require("axios");
const views = require("koa-views");
const json = require("koa-json");
const onerror = require("koa-onerror");
const bodyparser = require("koa-bodyparser");
const logger = require("koa-logger");
const router = require("koa-router")();
const querystring = require("querystring");

const index = require("./routes/index");
const users = require("./routes/users");

// error handler
onerror(app);

// middlewares
app.use(
  bodyparser({
    enableTypes: ["json", "form", "text"],
  })
);
app.use(json());
app.use(logger());
app.use(require("koa-static")(__dirname + "/public"));

app.use(
  views(__dirname + "/views", {
    extension: "pug",
  })
);

// 支持第三方登录github
const config = {
  client_id: "6675fb9aa82b51f1b876",
  client_secret: "d8882d993d924d73c3c5b132635b7d64a00a6d28",
};

router.get("/github/login", async (ctx) => {
  // 重定向到github服务器
  let path = `https://github.com/login/oauth/authorize`;
  path += `?client_id=${config.client_id}`;
  //跳转 github 服务器
  ctx.redirect(path);
});

router.get("/auth/github/callback", async (ctx, next) => {
  console.log("callback...");
  const { code } = ctx.query;
  console.log("code", code);

  const params = {
    client_id: config.client_id,
    client_secret: config.client_secret,
    code: code,
  };
  let ret = await axios.post(
    "https://github.com/login/oauth/access_token",
    params
  );
  // console.log("ret", ret.data);
  const data = querystring.parse(ret.data);
  const { access_token } = data;
  console.log("access_token", access_token);
  const url = `https://api.github.com/user`;
  headers = { Authorization: `token ${access_token}` };
  console.log("url", url);
  ret = await axios.get(url, { headers });
  console.log("user", ret.data);
  ctx.body = ret.data;
});
app.use(router.routes());

// logger
app.use(async (ctx, next) => {
  const start = new Date();
  await next();
  const ms = new Date() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});

// routes
app.use(index.routes(), index.allowedMethods());
app.use(users.routes(), users.allowedMethods());

// error-handling
app.on("error", (err, ctx) => {
  console.error("server error", err, ctx);
});

module.exports = app;
