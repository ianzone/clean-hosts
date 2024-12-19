# clean-hosts
每天产生一个未经DNS污染的hosts文件

TODO:
- [ ] gitee 同步
- [ ] gitee go 每天检查 ip 可用性，若不可用则生成失效域名列表
- [ ] 失效列表同步到 GitHub
- [ ] GitHub action 查询新 ip 并生成 json 文件，同步到 gitee
- [ ] gitee go 检查新 ip 是否可用，并更新 hosts 文件