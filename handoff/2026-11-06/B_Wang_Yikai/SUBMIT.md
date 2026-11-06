# B Wang Yikai Branch and Submission

Your branch is **w2/b-interface**. The Java baseline was merged in PR #8. The included ZIP is a dated starting snapshot; current main is the shared integration source. Keep the original W1 research branches as history.

## First Git checkout

In your chosen development folder, outside this extracted ZIP:

~~~powershell
git clone https://github.com/hansu650/thematic-friend-finder.git
cd thematic-friend-finder
git switch main
git pull --ff-only origin main
git switch -c w2/b-interface
~~~

If the repository or your branch already exists, continue that checkout instead of cloning or creating the branch again. Run git status first and preserve uncommitted work. Do not replace an existing working tree with this ZIP. If you began from the ZIP, copy only your own changed source/test/evidence files into your branch after comparing with current main.

A's discovery PR #9 remains a separate reviewable increment until merged. After accepted work reaches main, use git fetch origin and merge origin/main into your own branch, resolving any conflicts with the affected owner. An example screenshot or package is not a request to merge unreviewed code.

## Commit and open a PR

Use the canonical code/thematic-friend directory. Stage your changed source/test files and your progress/evidence files explicitly. Inspect git diff --cached before committing. Exclude target, .cache, .local, node_modules, runtime databases and credentials. Then:

~~~powershell
git commit -m "[W2][B] Describe the implemented change"
git push -u origin w2/b-interface
~~~

Open a PR to main in GitHub. Its description should state the previous behaviour, your actual change, test commands/results, relevant screenshots and any remaining limitation. Mark it Ready for review when implementation and necessary checks are complete. Reviewer: **C Tao Jiacheng**; A coordinates integration.

## Send to A

- PR URL and exact tested revision.
- Changed source and executable tests in the PR.
- B_progress.md with expected/actual results, command and exit codes, defect/fix if one occurred, references/AI assistance and review status.
- Normal/boundary, real test output and actual GitHub/Trello status captures. Code screenshots are optional for B–F.
- The shared-interface changes, unresolved issue and next owner, if any.

Put screenshots in the images folder beside your progress MD and logs in its evidence folder. Preview the Markdown. Move Trello to Review when ready; move to Done after acceptance/merge. Each person writes their own reflection from actual work. See [FINISH_LINE.md](./FINISH_LINE.md) for the remaining team evaluation and submission work.
