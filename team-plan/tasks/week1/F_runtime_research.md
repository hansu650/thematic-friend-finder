# F Song Peitong Week 1 Task: Runtime and Handover Research

Named owner: **Song Peitong (F)**. Reviewer: **A Qin Tian**.

You are member F, the sixth member of the team. Your role combines **Developer** with responsibility for **builds, demo data and reproducible startup**. The project is a browser-based website using Java 21, Spring Boot, Thymeleaf and a file-based H2 database.

## Your research

Read the [Spring guide to serving web content](https://spring.io/guides/gs/serving-web-content/) and [Spring Boot database documentation](https://docs.spring.io/spring-boot/reference/data/sql.html). Explain:

1. What Java 21, Maven Wrapper, Thymeleaf and H2 each do in this project.
2. How starting the application in IntelliJ IDEA differs from building a JAR and running `java -jar`.
3. Where the application should store its database, and why a file database can retain data after a restart.
4. How another team member could check the prerequisites, start the website and confirm that it is working.
5. How to verify that profiles, connections and messages survive a restart without deleting existing data.

You do not need to buy hosting or install another programming language. Use fictional accounts for any trial. Describe only operations you actually performed as tested; label the rest as proposed checks.

## What to submit

Write approximately **500–800 English words** in Markdown, including:

- At least two official sources, access dates and the sections you used.
- A short prerequisite list and a proposed startup procedure.
- A data-directory recommendation with a reason.
- A restart-persistence test with expected results.
- One handover user story and at least two observable acceptance criteria.
- One question for the team discussion.

Suggested story: “As a teammate, I want to start the same website from the handover instructions so that I can test my changes without depending on the original developer.”

Example acceptance criteria: a teammate can open the home page after following the documented steps; a message created with fictional accounts remains available after a clean restart using the same database directory.

## GitHub submission

Repository: [hansu650/thematic-friend-finder](https://github.com/hansu650/thematic-friend-finder).

| Item | Value |
|---|---|
| Branch | `w1/f-research` |
| Research file | `docs/research/week1/F_runtime_research.md` |
| Image folder | `docs/research/week1/images/`, with filenames beginning `f-` |
| PR title | `[W1][F] Runtime and handover research` |
| Base branch | `main` |
| Reviewer and merger | A |

1. Accept the repository invitation. If the private repository is unavailable, give A your GitHub username so that A can arrange access.
2. Create `w1/f-research` from the latest `main`.
3. Add your Markdown file and any necessary evidence. Keep images beside the Markdown in `images` and link them using relative paths, such as `./images/f-startup.png`.
4. Open a Pull Request into `main`. State what you investigated, where the file is and what still needs discussion.
5. Address A's comments in the same branch. Mark the PR Ready for review when the work and checks are complete; A reviews and merges it.

## Timing and completion

Aim for a draft by **7 November 2026**, followed by the team discussion on **8 November**. Allow roughly **2–3 hours** for research and review. These are proposed internal dates, not the university deadline. As a new member, do not backfill work or attendance from before you joined.

Finish when the sources and links can be checked, the startup and persistence steps are clear, and performed tests are distinguished from planned tests.

Your next task is [Week 2 runtime and handover development](../week2/F_runtime.md). The A-owned baseline already includes scripts and demo data. Your Week 2 increment is backup/restore tooling and independent reproduction, with actual evidence.

## UI and test handover

Use [the UI reference map](../../12_ui_reference_map.md), especially references All implemented screens as reproduction targets. Your scope is backup and restore, clean-copy setup and reproduction. Complete [your six test scenario groups](../testing/F_tests.md) with executable checks and evidence. Follow [the weekly photo and screenshot plan](../../13_testing_and_weekly_evidence.md).
