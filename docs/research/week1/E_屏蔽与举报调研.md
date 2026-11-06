# E｜W1 屏蔽与举报调研

查看日期：2026-11-06；对象：Tinder、Bumble。方式：读取官方帮助正文接口；网页有访问校验，未登录或实测。Codex 辅助整理，待 E 核对、A 复核。

## 观察与证据

| 比较点 | Tinder | Bumble |
|---|---|---|
| 入口 | 资料底部可屏蔽；资料、聊天三点可举报；聊天三点可解除匹配。[T1–T3] | 资料底部可屏蔽或举报；聊天三点有“Block and Report”和解除匹配。[B1–B3] |
| 举报与反馈 | 选择原因、补充详情；普通举报说明未明确必填字段与结果查询方式，保留待验证。[T2] | App 按提示提交；解除匹配后可找客服，建议提供姓名、原因、聊天截图。Help Hub→Notifications 可查进度。[B2] |
| 屏蔽边界 | 双方不可见资料；永久生效，功能尚非全量开放。解除匹配仅确认双方移出匹配列表。[T1、T3] | 移除匹配、阻止后续联系，且无法取消屏蔽；是否再次出现在发现页、能否重新匹配未明示。[B1] |

两者入口都有资料与聊天路径；底部入口需滚动，实际易找程度待实测。上述均为官方说明，不能据此证明接口权限已验证。

## 借鉴与取舍

1. 借鉴双入口，遇到问题时就近处理。
2. 借鉴举报进度查询，减少提交后的不确定感。
3. 不采用 Bumble 不可取消屏蔽的做法，误操作难纠正；建议确认提示及屏蔽管理入口。

## 下周安全验证与协调建议

以下为候选场景，尚未执行：

1. A 屏蔽 B 后，双方推荐和匹配均排除对方；旧聊天、直连接口发送均被拒绝。
2. 双方同时发消息与屏蔽，屏蔽生效后新消息不可送达；刷新、重登仍生效。
3. 举报遇断网保留输入并提示重试；重复提交不重复建单，不向被举报者泄露举报人。

Trello：开始及状态变化即更新，交付附 PR、自查证据；按 Ready→In Progress→Review→Testing→Done 流转。每人进行中≤1，Review/Testing 各≤2；Blocked 留原列并计入限额，记原因、处理人、下次检查时间。E 每日跟进，超过一天请 A 协调拆分或调整；各人先测自身功能，复核与验证通过才 Done。

## 候选需求

故事：作为用户，我希望屏蔽或举报不合适的联系，以便控制后续互动。

验收草案：

- 已匹配时确认屏蔽，双方不能再发消息，刷新后仍有效。
- 已选择举报原因且服务端保存成功时，显示“已收到”；保存失败时保留内容并允许重试。

讨论：解除匹配与屏蔽的区别如何提示，屏蔽时是否保留可供举报的聊天证据？

## 官方来源及定位

网页如触发校验，可打开“正文”。

- **T1**：[屏蔽](https://www.help.tinder.com/hc/en-us/articles/12425789312013-Block-a-Profile)（[正文](https://www.help.tinder.com/api/v2/help_center/en-us/articles/12425789312013.json)），定位开头、`Blocking a profile`、`Note`。
- **T2**：[举报](https://www.help.tinder.com/hc/en-us/articles/115003822043-Reporting-profiles-and-content)（[正文](https://www.help.tinder.com/api/v2/help_center/en-us/articles/115003822043.json)），定位 `Report in app or Tinder.com`、`After you report`。
- **T3**：[解除匹配](https://www.help.tinder.com/hc/en-us/articles/115003360106-Unmatching-someone)（[正文](https://www.help.tinder.com/api/v2/help_center/en-us/articles/115003360106.json)），定位 `Unmatching`。
- **B1**：[屏蔽](https://support.bumble.com/hc/en-us/articles/28783382700701-Blocking-someone)（[正文](https://support.bumble.com/api/v2/help_center/en-us/articles/28783382700701.json)），定位开头、`On the Bumble app`、`Note`。
- **B2**：[举报](https://support.bumble.com/hc/en-us/articles/28783343585565-Reporting-someone)（[正文](https://support.bumble.com/api/v2/help_center/en-us/articles/28783343585565.json)），定位提交步骤、客服补报段、`What happens when you report`。
- **B3**：[解除匹配](https://support.bumble.com/hc/en-us/articles/28777122258333-Unmatching-someone)（[正文](https://support.bumble.com/api/v2/help_center/en-us/articles/28777122258333.json)），定位 `How to unmatch`、`Things to know`。

待 A 复核；团队讨论、Trello 实际更新与下周任务确认尚未进行。
