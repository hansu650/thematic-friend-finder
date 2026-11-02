# Friend Finding App · 专题项目

专题项目主题 2「Friend Finding App」的本地网站。2026-10-30 按用户要求改为探探界面原型，参考官方 App Store 的大图卡片、卡片内操作按钮、底部导航、新配对与消息列表。桌面也采用居中的 App 布局。人物照片暂不处理，使用照片占位和文字头像。本项目并非探探官方服务；验证范围见 [验证记录](docs/VERIFICATION.md)。

## 本机启动

在 PowerShell 中运行：

```powershell
Set-Location 'D:\daima\codex\thematic-friend-finder'
.\start.ps1
```

打开 <http://127.0.0.1:8765/>，点击「进入本地演示」。脚本会迁移数据库并补齐演示资料，保留已存在的资料修改、匹配和消息；不会每次启动重置体验。端口冲突时可用 `.\start.ps1 -Port 8766`。在运行窗口按 Ctrl+C 停止。

现有环境是项目独立的 `.conda/`，Python 3.11.15、Django 5.2.18。没有向 Anaconda base 安装依赖。若换电脑，先定位本机 Anaconda，再在项目中创建独立环境并安装 `requirements.txt`：

```powershell
& 'D:\kaifagongju\anaconda3\Scripts\conda.exe' create --prefix '.\.conda' python=3.11 pip -y
& '.\.conda\python.exe' -m pip install --cache-dir '.\.pip-cache' -r requirements.txt
```

## 已实现的流程

- 注册、密码登录、成年自我声明、昵称／介绍／兴趣与发现设置。
- 按共同兴趣和交友意向排序，显示具体共同兴趣；兴趣和意向筛选。
- 喜欢、无感（跳过）、超级喜欢、反悔上一次未配对的操作、重看跳过的人；按钮、方向键和卡片拖动入口。超级喜欢仍需对方同意后才能聊天。
- 双向喜欢形成唯一匹配，双方可发文字消息；页面每 3 秒检查新消息。
- 解除匹配、双向屏蔽、取消屏蔽、举报与自己的举报状态。
- Django 管理后台的举报列表（需另行建立管理员账号）。
- 发现、配对、消息、我的四个底部入口；新配对与消息列表、消息搜索、照片占位详情、手机可用的隐私安全与退出入口。

六个演示身份完全虚构。初次初始化时，林予安已喜欢小周，因此小周喜欢林予安会进入匹配成功页。可从「本地演示」切换身份，验证双方消息。若已有这段匹配，直接从「匹配」或「消息」继续。演示身份没有可用密码，开发模式外禁用身份切换。

## 验证

```powershell
& '.\.conda\python.exe' manage.py check
& '.\.conda\python.exe' manage.py test social --verbosity 2
& '.\.conda\python.exe' manage.py makemigrations --check --dry-run
```

当前验收见 [验证记录](docs/VERIFICATION.md)。后端测试使用独立的内存测试数据库。`.local/` 是本机运行数据，包含 SQLite 数据库与本地密钥；不要提交到 Git。截图只能证明界面状态，权限规则由功能测试另行验证。

## 代码结构

| 位置 | 用途 |
|---|---|
| `config/settings.py` | 本地与生产配置边界 |
| `social/models.py` | 资料、兴趣、喜欢、匹配、消息、屏蔽、举报 |
| `social/services.py` | 推荐排序、互相喜欢与联系权限 |
| `social/views.py` / `forms.py` | 页面、消息接口与输入校验 |
| `templates/` / `static/` | 页面、样式、交互；不需要前端构建工具 |
| `social/tests.py` | 关键行为与权限回归测试 |
| `social/management/commands/seed_demo.py` | 可重复执行的虚构演示资料初始化 |
| `docs/` | 评分目标、开发计划、证据模板、验证记录 |

技术选择：Django 模板 + 少量原生 JavaScript + SQLite。第一阶段采用易于团队阅读和复现的单体结构。大规模推荐、WebSocket、高并发部署均未完成；现有排序只对当前资料集有效，消息采用轮询。

## 开发边界与后续

这是一版可继续开发的本地原型，尚未公开上线。照片上传、真实用户研究、账号恢复、访问限流、数据导出／删除、正式保留期限、生产部署与完整无障碍评估仍待完成。成年确认不等于身份核验，消息没有端到端加密，举报需要实际管理员处理。

生产部署必须关闭 `DJANGO_DEBUG` 和 `MEETLY_DEMO`，通过安全配置提供 `DJANGO_SECRET_KEY`、允许的域名与 HTTPS，并完成 [开发计划](docs/PROJECT_PLAN.md) 中的上线检查；不要把当前开发服务器暴露到公网。

先阅读 [开发计划与评分对应](docs/PROJECT_PLAN.md) 和 [过程证据模板](docs/EVIDENCE.md)。初始搭建由 Codex 辅助完成，不代表任何团队成员已完成个人贡献。后续成员应使用自己的身份提交、解释与验证其真实工作。当前暂按五人协作，角色方案见下方团队计划，最终分工由实际讨论确认。

## 团队协作与本周任务

仓库：<https://github.com/hansu650/thematic-friend-finder>。当前按五人（A–E）安排，A 为组长；每人均有开发主责及特色职责。先完成第一周调研和分工，再开展两个两周 Sprint。

- [五周计划与文件入口](docs/team-plan/README.md)
- [A：发现与筛选调研](docs/team-plan/每周任务/W1_个人任务/A_第一周任务.md)
- [B：界面与导航调研](docs/team-plan/每周任务/W1_个人任务/B_第一周任务.md)
- [C：注册与资料调研](docs/team-plan/每周任务/W1_个人任务/C_第一周任务.md)
- [D：匹配与聊天调研](docs/team-plan/每周任务/W1_个人任务/D_第一周任务.md)
- [E：屏蔽与举报调研](docs/team-plan/每周任务/W1_个人任务/E_第一周任务.md)
- [本周调研提交目录](docs/research/week1/README.md)

成员在各自分支提交材料、发起 PR，交叉复核后由 A 合并到 `main`。A 自己的调研先由 B 复核。私有仓库的成员访问需要 A 添加实际 GitHub 账号；角色文件中的 A–E 不是 GitHub 用户名。

仓库保存代码、计划和真实过程证据。正式考核按学校要求提交 MMUTube 视频及 Moodle 个人反思；五周计划的日期是组内安排，学校截止时间须另行核实。课程课件原件未包含在仓库中。
