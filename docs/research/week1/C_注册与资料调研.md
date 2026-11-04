# C｜注册与个人资料调研 / Registration and Profile Research

## 1. 来源与观察 / Sources and Observation Method

参考产品：[Soul](https://www.soulapp.cn/)、[Blued](https://www.blued.cn/)。查看日期均为2026年11月4日。由C实际操作并提供截图，结论仅限本次观察到的流程；官网用于确认产品来源，操作结论来自C的记录。

Reference products: [Soul](https://www.soulapp.cn/) and [Blued](https://www.blued.cn/). Both were observed on November 4, 2026. C used the apps and supplied screenshots. Findings are limited to the flows observed during these sessions. Official websites identify the products; findings about app behavior come from C’s records.

## 2. 流程对比与证据 / Flow Comparison and Evidence

**Soul：** 支持手机号验证码登录，微信登录需绑定手机号。据C实测，身高、体重、MBTI不可跳过，地区可跳过，兴趣可快捷选择。注册页展示性别、头像、昵称和生日；注册后可编辑签名、身高、体重。MBTI页提供测试或直接选择入口。

**Soul:** Supports sign-in using a phone number and verification code; WeChat sign-in requires linking a phone number. According to C’s testing, height, weight, and MBTI cannot be skipped, while region can be skipped. Interests can be selected from suggested options. The registration screen includes gender, avatar, nickname, and date of birth. The bio, height, and weight can be edited after registration. The MBTI screen offers a test or direct selection of a known type.

![证据一：Soul的MBTI入口 / Evidence 1: Soul MBTI options](./images/c-soul-mbti.jpg)

图一定位：页面底部提供“已知我的MBTI类型，去选择”和“开始鉴定”两个入口。

Figure 1 location: The bottom of the screen offers “Select my known MBTI type” and “Start the assessment.”

**Blued：** 支持手机号登录。据C实测，昵称、年龄、身高、体重不可跳过。修改资料页有头像、签名、生日、身高体重、标签等入口，右上角有“确认”按钮；C确认签名可保存。用户列表可展示“匀称”“肌肉”等体型标签。

**Blued:** Supports phone-number sign-in. According to C’s testing, nickname, age, height, and weight cannot be skipped. The profile editor includes an avatar, bio, date of birth, height and weight, and tags, with a “Confirm” button in the upper-right corner. C confirmed that the bio can be saved. User listings can display body-type labels such as “average build” and “muscular.”

![证据二：Blued修改资料页 / Evidence 2: Blued profile editor](./images/c-blued-edit.jpg)

图二定位：“我的签名”“出生日期”“身高体重”等为编辑入口，右上角为“确认”。

Figure 2 location: “My bio,” “Date of birth,” and “Height and weight” are editing entries; “Confirm” appears in the upper-right corner.

**观察限制：** 两款产品的错误输入和网络失败提示均未测试；Soul的保存提示及Blued保存成功提示的原文未记录，不推断具体行为。

**Observation limits:** Invalid-input and network-failure messages were not tested in either app. Soul’s save feedback and the exact wording of Blued’s save-success feedback were not recorded. No specific behavior is inferred for these cases.

## 3. 借鉴与取舍 / Design Lessons and Trade-offs

1. 借鉴Soul的分步引导与快捷兴趣选择，降低填写负担，帮助寻找共同话题。
   Adopt Soul’s step-by-step onboarding and suggested interest choices to reduce input effort and help users find shared topics.
2. 借鉴Blued集中展示结构化资料的方式，便于快速了解用户。
   Adopt Blued’s grouped presentation of structured profile information so users can understand a profile quickly.
3. 不建议照搬过多必填项。我们面向异性交友，建议身高、体重、MBTI选填，允许逐步完善资料。
   Avoid requiring too many profile fields. For our dating service for people seeking someone of a different gender, height, weight, and MBTI should be optional so users can complete their profiles gradually.

## 4. 项目字段建议 / Proposed Project Fields

以下为我们项目的候选建议，不代表参考产品的实际规则。

The following are proposals for our project, not descriptions of the reference products’ rules.

| 字段 / Field | 必填 / Required | 校验规则 / Validation | 用途 / Purpose |
|---|---|---|---|
| 手机号、验证码 / Phone number and verification code | 是 / Yes | 校验号码格式及验证码有效性 / Validate number format and code validity | 登录，不公开号码 / Sign-in; phone number stays private |
| 昵称 / Nickname | 是 / Yes | 去首尾空格后2–20个字符 / 2–20 characters after trimming surrounding whitespace | 展示身份 / Display name |
| 性别 / Gender | 是 / Yes | 男／女 / Male or female | 异性匹配 / Match users seeking a different gender |
| 出生日期 / Date of birth | 是 / Yes | 有效日期；是否仅限成年人待讨论 / Valid date; adults-only eligibility remains to be discussed | 计算并展示年龄 / Calculate and display age |
| 兴趣、交友意向 / Interests and dating intentions | 是 / Yes | 兴趣1–5项、不重复；意向从预设项选择 / 1–5 distinct interests; select an intention from preset options | 共同话题与期待 / Shared topics and expectations |
| 签名 / Bio | 否 / No | 最多200个字符 / Maximum 200 characters | 自我介绍 / Self-introduction |
| 身高、体重 / Height and weight | 否 / No | 正数，明确厘米／公斤 / Positive numbers, with centimeters and kilograms specified | 补充资料 / Additional profile details |
| 头像、城市、MBTI、体型 / Avatar, city, MBTI, and body type | 否 / No | 头像限制文件类型及大小，具体值待定；其余预设选择 / Restrict avatar file type and size, with limits to be defined; use preset choices for other fields | 个人展示 / Profile presentation |

不设置1／0／side或T／P／H角色字段。

The project will not include the role fields 1/0/side or T/P/H.

## 5. 用户故事与验收条件 / User Story and Acceptance Criteria

作为希望认识异性的新用户，我希望注册并编辑资料，以便找到兴趣和交友期待相近的人。

As a new user seeking someone of a different gender, I want to register and edit my profile so that I can find people with similar interests and dating expectations.

- 昵称为空时点击保存，应提示必填并保留其他输入。
  When the nickname is empty and the user selects Save, show a required-field message and retain all other input.
- 填齐必填项、跳过选填项时，应能完成注册。
  When all required fields are completed and optional fields are skipped, registration should succeed.
- 修改签名并成功保存后，重新进入资料页，应显示最新内容。
  After a bio is edited and successfully saved, reopening the profile should display the updated content.
- 网络失败时保存，应提示失败、保留输入并允许重试。
  When saving fails because of a network error, show a failure message, retain the input, and allow a retry.

## 6. 团队讨论 / Team Discussion

是否仅限成年人注册？交友意向以普通交友、认真恋爱还是两者并重？

Should registration be restricted to adults? Should the service support casual social connections, serious relationships, or both?
