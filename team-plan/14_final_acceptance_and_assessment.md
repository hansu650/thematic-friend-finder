# Mingle Core Flow and Final Acceptance

Current scope, revised 14 November 2026: profiles, discovery and mutual likes, conversations, account/safety controls and the approved activity feed. The approved reference interface is the current UI baseline. Precise location and personal profile uploads remain outside this revision. Public hosting is a proposed delivery step and is not yet verified. C owns product acceptance; A leads implementation and integration. Use the [six-week plan](./16_six_week_evidence_plan.md) for current dates and evidence priorities.

## What this round achieves

When the six increments have been reviewed, integrated and tested together, the core product can be feature-complete for the agreed coursework scope. Completing a feature PR or collecting screenshots alone does not complete the assessment. User observation, improvements, reproducible handover, the team demonstration and six individual reflections follow.

A owns the AI-assisted core and interface/integration revision, now merged through PR #15. B, C, D, E and F have merged their first increments through PRs #16, #11, #10, #14 and #13. Local source was aligned with main including PR #16 and automatically checked on 14 November. The [verification report](../code/thematic-friend/docs/releases/2026-11-14-main-verification.md) records the precise scope, defects and retests. D's new reliability extension and final team acceptance need their own evidence.

| Owner | Assigned result | Completion evidence |
|---|---|---|
| A Qin Tian | Serve as Scrum Master and Lead Developer; own and explain the baseline; refine discovery and match feedback; agree shared contracts; review and integrate all modules; lead final acceptance and demonstration organisation | Discovery regressions, real screenshots, actual technical/process decisions and shared project-selection work, contract agreements, reviewed PRs, integrated flow results and release/handover record |
| B Wang Yikai | Live unsaved profile preview, interest counter and accessible responsive interaction; coordinate usability observation | Preview/refresh and five-interest boundary tests, keyboard/390 px results, observed issues and one justified improvement |
| C Tao Jiacheng | Product Owner; shared project selection, backlog/acceptance decisions and retained account/session contribution | Invalid requests leave credentials unchanged; old/new login behaviour, agreed session invalidation and persistence verified |
| D Zhou Ziyue | Per-participant unread state, bounded history and the assigned delivery/retry follow-up | Two-session unread tests, history beyond 100 messages, ordering/duplicate checks and permission rejection |
| E Wu Zhuoda | Restricted report review and meaningful safety permissions; coordinate regression and defect evidence | Staff/ordinary/anonymous tests, private notes, valid status/handler/time and actual regression/defect/retest records |
| F Song Peitong | Stopped-database backup/restore and independent reproduction | Checksums, safe disposable restore, rejection of unsafe/corrupt/occupied targets and another person's clean-copy run |

The proposed allocation is **A 50 h, C 40 h, D 34 h and B/E/F 28 h each**, including development, testing, review, coordination, demonstration and reflection preparation. These are estimates requiring capacity confirmation, not claimed hours. A owns integration and fixes shared integration problems; each member remains responsible for their own work.

## Integrated product acceptance

Run these checks on one recorded integrated commit. Record expected and actual results, environment, tester and evidence links. A coordinates; the indicated member supplies their module's checks.

| ID | End-to-end behaviour | Owners | Current final-acceptance state |
|---|---|---|---|
| CORE-01 | Create fictional accounts, sign in, edit a profile and reload; unsaved preview stays local and saved values persist | A/B/C | Integrated automated checks pass on 14 Nov; owner acceptance pending |
| CORE-02 | Apply both filters; see genuine shared interests; clear a single condition; recover from empty results; hidden/self/blocked profiles are excluded | A/B | Java/browser checks pass on 14 Nov; independent acceptance pending |
| CORE-03 | One-sided like cannot create chat; reciprocal/repeated decisions create one connection and open the correct match/conversation | A/D | Integrated automated checks pass on 14 Nov; owner acceptance pending |
| CORE-04 | Two sessions exchange persisted messages; unread state belongs to the recipient; older history loads without gaps or duplicates | D/C/A | Unread/history merged in PR #10; new retry extension pending |
| CORE-05 | Change password using the current credential; invalid/anonymous/CSRF requests are rejected; session policy is explicit and tested | C/A | Password change merged in PR #11; final acceptance remains evidence-based |
| CORE-06 | End/block contact, deny further access as specified, submit a private report and let authorised staff handle it; unrelated users cannot read it | E/D/C/A | Staff workflow merged in PR #14; retain permission and confidentiality checks |
| CORE-07 | Use the core flow at desktop and 390 px with keyboard/buttons and reduced motion; validation, loading, empty and failure states remain understandable | B/A with module owners | Selected automated flows pass at emulated widths; physical-device and observed-user acceptance pending |
| CORE-08 | Build from a clean source copy, restart using the same data, back up a stopped H2 fixture database, restore to a fresh destination and verify known records | F/A | Backup/restore merged in PR #13; independent reproduction and real-H2 recovery still need evidence |
| EVENT-01 | Browse/search activities and exercise implemented creation, saving and attendance with two accounts; verify selected records after restart | A/C | Browser and real-H2 restoration checks pass on 14 Nov; product acceptance pending |

The final submitted interface is English. The temporary development language switch is removed or disabled and verified at the final freeze. If a physical phone is tested, record the real device; an emulated 390 px check remains labelled emulated.

## From development to submission

1. **Assign and agree:** distribute each named package, confirm capacity, and record account/session, read-state, staff-role and data-path agreements before overlapping edits. Task/instruction updates were completed on 6 November and A's implementation has resumed; actual owner agreements remain pending.
2. **Build and review:** each owner delivers a focused feature, meaningful executable tests and their own evidence. B reviews A; C reviews B; D reviews C; E reviews D; F reviews E; A reviews F. Completed PRs are Ready for review.
3. **Integrate and observe:** A integrates accepted work and runs CORE-01–08. B coordinates real, consented task observation; record the task, outcome, difficulty and changes made. Each owner fixes issues in their area. Do not manufacture participants, feedback or failed tests.
4. **Evaluate and reproduce:** compare the final outcome with the brief and original plan; explain supported strengths, remaining weaknesses, changed priorities and what the team learned. F coordinates a second person's reproduction. A records the final revision and known limits.
5. **Demonstrate and reflect:** produce one team video of at most 15 minutes and one completed reflection per person. Verify the video URL and uploaded files. The supplied Moodle screenshot shows 18 December 2026 at 13:00, with no visible timezone; the internal finish is 4 December. Recheck the same Moodle account before upload.

## Evidence for the highest assessment band

The assessment's highest band is **86–100%**. This is a target for the quality of the work and reasoning, not a checklist that guarantees 100. The assessment allocates **25% to the group demonstration and 75% to each individual's reflection**.

| Assessment requirement | Evidence to prepare | Responsible people |
|---|---|---|
| A thoroughly designed, innovative working MVP and a detailed account of its lifecycle (p. 7) | Explain the user problem, alternatives and references, requirements, design choices, implementation, validation, iteration and handover. Justify Mingle's interest-based, mutual-choice flow with actual design decisions and feedback; do not claim copying a reference screen is innovation. | A leads; all owners explain their changes |
| Insightful evaluation of both product and project (p. 8) | Compare outcomes with objectives; analyse useful and weak choices, defects, scope changes, teamwork and tradeoffs. Link claims to real results and decisions, and explain what should change next. | Whole team, facilitated by A with test evidence coordinated by E |
| Thorough, creative professional goals and action plans (p. 9) | Each person connects actual learning and evidence to their PDP and sets a specific next action, method and way to judge improvement. | Every member individually |
| Significant contribution, teamwork/leadership and critical reflection (p. 9) | Show a useful contribution to the shared outcome as well as the assigned module: peer testing, resolving an integration issue, helping a decision or improving a process. Analyse the effect, different perspectives and remaining weakness. | Every member individually |

The official reflection template asks about **Your Project; Your Team; Your Project Management Approach; Ethical and Legal Considerations; Your Professional Development**. Use real incidents and your own judgement in every section. For ethics/legal/sustainability, document what was researched, what design/data choices followed and what remains limited; a generic compliance sentence is insufficient. Keep sources and AI assistance explicit.

The video should cover requirements, design, the product in use, each person's responsibility, evaluation and continuation/handover. Production polish is not a separate marking category in the specification. Each member must include the shared MMUTube URL in their own reflection, and submit the reflection using the provided template.

## Screenshots and contribution evidence

Every member submits their source and executable tests, readable real test output, normal/boundary results, an actual PR/check status and an updated personal Trello card, plus a short progress record. Capture only enough images to explain the result; screenshot counts are not a grading quota.

Qin Tian has retained two editor screenshots to explain A's implementation and test. **B–F are not required to submit code screenshots**; a brief code explanation and links to their changed source/test files are sufficient. Each named package is self-contained for the member's task. A may send selected photos separately; members do not need an example ZIP.

## Source basis

- Thematic Project 1CWK100 Assessment Specification, unit 6G5Z0046_2627_9FHU: p. 4 weights; p. 5 demonstration format and 15-minute maximum; p. 6 individual reflection and submission; pp. 7–9 highest-band criteria.
- Thematic Project 1CWK100 Reflection Template: the five sections named above, personal details and demonstration URL.
- List of Projects, topic 2, Friend Finding App: a website/mobile product supporting social contact, with ethical and legal considerations; a matching algorithm is an optional extension.
- Qin Tian's confirmed scope and distribution decisions on 6 November 2026. Internal milestones and recommended evidence practices are team planning choices, not additional university rules.
