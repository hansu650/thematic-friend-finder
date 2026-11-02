# A｜W1 发现与筛选调研

日期：2026-11-02；对象：Tinder、Bumble。方式：官方网页与源码阅读，未登录 App 或访谈。Codex 辅助检索整理；待 A 核对、B 复核。

## 参考观察与证据

| 比较点 | Tinder | Bumble |
|---|---|---|
| 筛选与兴趣 | 发现设置支持年龄、距离等条件，另有控制是否放宽范围的开关；兴趣可展示在资料中。[发现设置](https://www.help.tinder.com/hc/en-us/articles/115003340963-Discovery-Settings) 的“Dealbreakers”、[兴趣说明](https://www.help.tinder.com/hc/en-us/articles/360046122691-Interests) 的开头段落。 | 官方说明可按兴趣徽章筛选；多选时命中任意一项即可，不要求全部匹配。[兴趣筛选](https://bumble.com/en-us/the-buzz/filter-by-interest-badges) 的“You can now filter by Interest Badges”。 |
| 推荐说明 | 上述资料没有说明每张卡是否解释排序原因，保留待验证。 | Discover 说明推荐参考资料、过往匹配、兴趣与目标等；未验证每张卡是否显示原因。[Discover](https://bumble.com/en-us/features/discover/) 的“PERSONALIZED AROUND YOU”。 |
| 没有结果 | 官方建议扩大年龄或距离等搜索范围。[无新资料帮助](https://www.help.tinder.com/hc/en-us/articles/115003496123-I-m-not-seeing-profiles-in-Discovery) 的“No new profiles around you?”。 | 可选择看完范围内的人后展示其他人，也建议调整过多的条件；具体空状态界面未验证。[筛选说明](https://support.bumble.com/hc/en-us/articles/28423691289629-Using-filters-to-set-your-preferences) 的“Basic filters”及末段提醒。 |

以上为当日查阅的官方说明，地区和版本可能不同，文档步骤不代表实测。

## 借鉴与取舍

1. 借鉴明确的筛选规则：显示当前条件；若以后支持多兴趣，明确“任一”还是“全部”，避免用户猜测结果。
2. 借鉴围绕兴趣建立联系的思路：展示真实共同标签，便于决定是否继续了解。
3. 本轮不采用无提示扩大范围的做法：用户主动选择修改或清除条件，便于理解与测试。两款产品偏恋爱场景，不能直接证明校园交友需求。

## 现有原型与 A 的开发候选

源码已有兴趣＋意向筛选、共同兴趣计算和清除入口。主卡显示共同兴趣数量，名称在详情；不计为本次新增。依据：[推荐逻辑](https://github.com/hansu650/thematic-friend-finder/blob/ae63188/social/services.py)、[发现页](https://github.com/hansu650/thematic-friend-finder/blob/ae63188/templates/social/discover.html)。

建议讨论三项小改进：①显示当前筛选条件摘要；②主卡优先显示最多两个真实共同兴趣；③无结果时仍显示条件并提供“修改条件”入口，保留已有清除功能。

用户故事：作为浏览者，我希望看懂筛选条件及共同兴趣，以便判断推荐是否符合预期。

验收草案：

- 选“阅读＋运动搭子”后，摘要准确，结果同时满足两项；清除后恢复默认。
- 卡片只显示双方交集中的兴趣，数量准确；零交集时不编造共同点。
- 无结果时显示当前条件，修改后保留原值供调整，不自动放宽筛选。

## 会前准备与待讨论

目标用户暂拟校园找朋友或活动搭子的人。上述三项为 A 的候选，须与 B–E 的调研共同排序。讨论问题：下一步优先让用户理解推荐，还是增加更多筛选项？

B–E 材料尚未汇总，会议与复核待进行。[W1 讨论记录](https://github.com/hansu650/thematic-friend-finder/blob/main/docs/team-plan/讨论记录/W1_启动与调研讨论.md) 保持待填写；本次提交个人调研和会前建议。
