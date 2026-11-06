# C｜W1 注册与个人资料调研

查看日期：2026-11-06；对象：Tinder、Bumble。方式：读取官方帮助正文接口（Zendesk API）与 Web 说明；网页有访问校验，未登录陌生账号或实测。待 C 核对、D 复核。

## 观察与证据

| 比较点 | Tinder | Bumble |
|---|---|---|
| 注册与必填项 | 支持手机号、邮箱或第三方登录。必填：验证码、姓名、生日（满 18 岁）、性别、展示偏好及至少 2 张照片，未传齐无法进入下一步。Bio、学校、兴趣（≤5 项）选填。[T1] | 支持手机号或 Apple/FB 登录。必填：验证码、姓名、生日、性别（可自选是否展示）、模式选择与合规头像。Bio（≤300 字符）、兴趣（≤5 项）、意向（≤2 项）选填。[B1] |
| 资料编辑与保存 | 编辑页可修改头像、Bio、兴趣等。**姓名与年龄在建号后无法在 App 直接修改**；若填错，官方要求注销账号重来。会员仅能隐藏年龄，无法改动数值。[T2, T3] | 资料页可编辑 Bio（限 300 字符并显式保存）、兴趣与意向。**姓名需联系客服修改**；生日与身份认证绑定后不可更改，且不可隐藏年龄展示。[B2–B4] |
| 校验与异常提示 | 生日小于 18 岁立即拦截；缺失必填项时“继续”置灰；网络异常时提示重试并保留输入。[T1, T4] | 必填项缺失给出行内报错；Bio 达 300 字符限制输入；保存失败保留草稿并提示重试。[B1, B3] |

上述为当日核对的官方说明与正文，地区与版本可能略有差异，文档步骤不代表实测。

## 借鉴与取舍

1. **借鉴结构化标签与上限控制**：预设兴趣（1–5 项）和交友意向，降低输入负担，便于后端计算共同兴趣交集。
2. **借鉴分阶段资料完善**：注册时仅校验核心身份与成年确认，详细资料支持后续编辑，降低新用户流失。
3. **不采用终身锁定昵称与年龄的做法**：参考产品为防诈骗禁止修改，填错只能注销重来。校园原型应适度容错，允许修改昵称与展示信息，避免强制注销造成数据丢失。

## 特色工作：项目字段建议表

区分参考产品做法与本项目建议：

| 字段名称 | 必填 | 校验规则 | 用途 | 参考做法 vs 本项目建议 |
|---|---|---|---|---|
| 用户名 / 密码 | 是 | 字符 3–30 位；密码符合强度 | 账号认证 | 参考产品重手机号；本项目沿用 Django 内置 User 模型。 |
| 昵称 (`display_name`) | 是 | 2–24 字符，去首尾空格 | 身份展示 | 参考产品锁死或需人工申诉；本项目允许资料页自主修改。 |
| 成年确认 (`adult_confirmed`) | 是 | 必须勾选（True） | 合规边界 | 参考产品严格校验证件与生日；本项目注册页设 18 岁勾选框。 |
| 兴趣标签 (`interests`) | 否/建议 | 预设库中选 1–6 项，无重复 | 匹配交集 | 两者均限 5 项；本项目模型关联 `Interest`，支持交集计算。 |
| 交友意向 (`goal`) | 是 | 预设枚举（咖啡/学习/运动/探索） | 表达意向 | Bumble 允许选 2 项；本项目原型先做单选以控制复杂度。 |
| 一句话介绍 (`headline`) | 否 | ≤60 字符，单行文本 | 卡片摘要 | 参考产品用提示卡；本项目保留短标，便于发现页快速浏览。 |
| 关于我 (`bio`) | 否 | ≤300 字符，多行文本 | 深度了解 | Bumble 限 300 字符，Tinder 限 500；本项目限 300 字符。 |
| 校园或城市 (`campus`) | 否 | ≤32 字符，默认“联合学院” | 场景归属 | 参考产品基于 GPS；本项目设固定校园文本。 |
| 发现页公开 (`discoverable`) | 是 | 布尔值，默认 True | 隐私控制 | 两者均有隐藏开关；本项目保留，关闭后不在推荐流显示。 |

## 候选需求与待讨论

用户故事：作为新用户，我希望注册并编辑资料，以便别人了解我的真实兴趣与交友意向。

验收草案：

1. 编辑资料时清空昵称或只填空格并点击保存，系统阻止提交，在昵称项显示行内红色提示“昵称不能为空”，且保留其他已填内容不被重置。
2. 选择超过 6 项兴趣时提示上限且不入库；选择 1–6 项保存成功后提示“修改已保存”，刷新后展示最新数据。
3. 注册时未勾选“我已年满 18 岁”，提交时阻止注册并提示必选，数据库不生成无效 User 记录。

待团队讨论：资料编辑时昵称是否需要限制修改频次（如 30 天一次）还是演示期保持无限制？交友意向后续是否扩展为最多双选？

## 官方来源及定位

网页如触发校验，可打开“正文”。

- **T1**：[创建账号](https://www.help.tinder.com/hc/en-us/articles/115003356706-Create-a-Tinder-Account)（[正文](https://www.help.tinder.com/api/v2/help_center/en-us/articles/115003356706.json)），定位 `Android or iOS`、`Tinder.com`。
- **T2**：[编辑资料](https://www.help.tinder.com/hc/en-us/articles/115003339043-Editing-your-profile)（[正文](https://www.help.tinder.com/api/v2/help_center/en-us/articles/115003339043.json)），定位 `Update your profile information`、`Keep in mind`。
- **T3**：[姓名年龄更正](https://www.help.tinder.com/hc/en-us/articles/115003498366-My-age-or-name-is-wrong)（[正文](https://www.help.tinder.com/api/v2/help_center/en-us/articles/115003498366.json)），定位开头、`To delete your account`。
- **T4**：[兴趣标签](https://www.help.tinder.com/hc/en-us/articles/360046122691-Interests)（[正文](https://www.help.tinder.com/api/v2/help_center/en-us/articles/360046122691.json)），定位 `How to add or edit Interests`。
- **B1**：[注册登录](https://support.bumble.com/hc/en-us/articles/28533989291421-Signing-up-and-logging-in)（[正文](https://support.bumble.com/api/v2/help_center/en-us/articles/28533989291421.json)），定位步骤、`Logging out`。
- **B2**：[修改个人信息](https://support.bumble.com/hc/en-us/articles/28938787921053-Changing-your-personal-details)（[正文](https://support.bumble.com/api/v2/help_center/en-us/articles/28938787921053.json)），定位 `Updating your name and age`、`Updating your gender`。
- **B3**：[编写简介](https://support.bumble.com/hc/en-us/articles/28530679977757-Writing-your-bio)（[正文](https://support.bumble.com/api/v2/help_center/en-us/articles/28530679977757.json)），定位 `Adding or updating your bio`、`300 characters`。
- **B4**：[添加兴趣](https://support.bumble.com/hc/en-us/articles/28530297182365-Adding-your-interests)（[正文](https://support.bumble.com/api/v2/help_center/en-us/articles/28530297182365.json)），定位 `choose up to 5`、`To add interests`。
