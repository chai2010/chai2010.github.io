# 个人主页

- https://chai2010.cn
- 必须使用 hugo 0.30 版本
- 手工生成html文件, 必须有 `.nojekyll` 文件，master分支用于显示
- 定制域名必须包含 `CNAME` 文件
- source对应源文件
- 较大的静态文件放在 https://github.com/chai2010/static-public

### 测试和运行

- 本地测试: `make`
- 部署服务: `make deploy`

<!--
### 注意点

gitment 添加评论时默认会将每个页面的 id 作为 label 创建.
但是 github 的 label 长度不得超出 50 个字符.

临时的缓解方案是用 `location.pathname` 作为 id, 省去域名部分.

最好还是文章控制下路径的长度.
-->
