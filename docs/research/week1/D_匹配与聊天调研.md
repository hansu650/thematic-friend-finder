# D｜第一周：匹配与聊天调研

查看日期：2026-11-06（北京时间）。参考 [Tinder][t1]、[Hinge][h1]；方式：阅读官方帮助，未登录实测、付费或联系陌生人。以下产品行为均为官方说明。

## 比较与证据

- **Tinder**：单向喜欢尚非匹配；收赞可在 Likes 查看，完整查看需订阅；回赞后匹配（[证据：Likes，Already subscribed?][t1]）。普通聊天需双方同意（[聊天页首段][t2]）。聊天从匹配关系进入；新配对与历史聊天的当前分区位置待实测。解除后双方从匹配列表消失，不能再联系（[解除页正文及 To Unmatch Someone][t3]）。
- **Hinge**：发送喜欢后，对方从发现页消失，等待回应；接收方 Likes You 显示数字角标（[Likes，Sending/Receiving Likes][h1]）。接受后进入 Matches，新匹配和已有会话均从此进入（[匹配页，Messaging your Match][h2]）。解除后会话消失、无法再发消息，且不可恢复；Hide 只隐藏会话、保留关系（[Unmatching 首段及操作步骤][h3]）。

## 状态流程与开发建议

未喜欢 → 单向喜欢（等待）→ 双向匹配（关系成立）→ 可聊天（权限开放）→ 解除联系（入口移除、禁止发送）。这是依据上述资料归纳的普通聊天流程；Hinge 的随赞评论不等于开放会话。直接核对的是官方文案，未观察真实账号转换；付费例外、离线旧页面及解除与发送并发仍待验证。

值得借鉴：①双向同意后开放聊天，保留选择权；②区分隐藏与解除，避免整理列表时误断联系。不建议照搬 Tinder 的付费查看收赞，校园项目应降低确认意愿的成本。下周建议统一关系状态，并由服务端按当前关系校验每次发送。

## 候选用户故事与验收

作为用户，我希望双方同意后再聊天，以便保留选择权。

1. 仅一方喜欢时，尝试发消息，应拒绝发送且不生成会话。
2. 对方回赞时，应只生成一个匹配；双方从匹配列表打开后可发送，重进可见历史。
3. 任一方解除后，刷新应移除双方入口；另一方在旧页面发送，应提示联系已解除且消息不送达。

团队讨论：解除后是否保留仅供举报使用的记录，谁可访问、保留多久？

[t1]: https://www.help.tinder.com/hc/en-us/articles/115005246123-Likes
[t2]: https://www.help.tinder.com/hc/en-us/articles/115003341183-How-do-I-message-someone
[t3]: https://policies.tinder.com/web/safety-center/tools/unmatch/intl/en/
[h1]: https://help.hinge.co/hc/en-us/articles/36311632894995-Likes
[h2]: https://help.hinge.co/hc/en-us/articles/360011090134-How-Do-I-Match-with-Someone-and-Start-Chatting
[h3]: https://help.hinge.co/hc/en-us/articles/36311673303571-Unmatching
