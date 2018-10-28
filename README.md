# Code+报名网站

[说明文档](DOC.md)

### 部分逻辑

报名比赛需要`邮箱`,`帐号`,`详细资料`

修改邮箱需要`帐号`

### OAUTH支持

必须有帐号之后才能够使用OAUTH登录其他网站

* GET https://cp.thusaac.org/oauth/authorize
    * 参数: app_id
    * 参数: redirect_uri
    * 成功之后跳转到${redirect_uri}?code=[code]

* POST https://cp.thusaac.org/oauth/access_token
    * 参数: app_id
    * 参数: app_secret
    * 参数: code
    * 成功的话返回{"access_token":[access_token]}

* GET https://cp.thusaac.org/oauth/user
    * 参数: access_token
    * 成功的话返回json格式的用户信息

* POST https://cp.thusaac.org/oauth/contest_info
    * 参数: app_id
    * 参数: app_secret
    * 参数: userID
    * 对于特殊应用返回该用户的参赛列表
