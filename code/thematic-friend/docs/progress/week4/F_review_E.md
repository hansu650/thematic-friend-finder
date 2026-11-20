# F | Review of E's Week 4 evidence

Codex inspected the evidence included in PR #20 and present in the release baseline `05532a19db852e516629303f770afa141b672cb0`. See [PR #20](https://github.com/hansu650/thematic-friend-finder/pull/20).

- E's matrix covers unauthenticated and wrong-role access, the configured staff role, CSRF, receipt visibility and repeat resolution. The record identifies which cases use form login and which inherited tests use injected principals. [Permission matrix](E_permission_matrix.md)
- The stale receipt wording has a baseline failure and a retest against the fixed revision. The browser JSON and Maven excerpts are linked to the recorded test revision. [Test record](E_test_record.md) · [Defect and retest](E_defects_and_retests.md)
- The concurrency result covers two sessions of one staff account. The browser exercise covers one emulated viewport. Independent human review and product acceptance remain open.

Operational implications for A. Keep the established staff configuration when starting a restored release. Exercise the ordinary member receipt and the configured staff view with fictional data if the release changes that behavior. Keep report text, internal notes and credentials out of shared recovery evidence.
