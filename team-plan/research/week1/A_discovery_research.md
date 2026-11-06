# A Week 1 Research: Discovery and Filtering

Original research date: **2 November 2026**. English translation and six-person context update: **6 November 2026**. Products: Tinder and Bumble. Method: official-page and historical-source reading, without logged-in app testing or interviews. Codex assisted the search and organisation. A's confirmation and B's actual review remain to be recorded; translation does not establish that they occurred.

## Observations and evidence

| Topic | Tinder | Bumble |
|---|---|---|
| Filters and interests | The reviewed discovery documentation described age/distance preferences and controls for relaxing them. Interests can be shown on a profile. See [Discovery Settings](https://www.help.tinder.com/hc/en-us/articles/115003340963-Discovery-Settings), especially Dealbreakers, and [Interests](https://www.help.tinder.com/hc/en-us/articles/360046122691-Interests). | The reviewed official article described interest-badge filtering, with any selected interest sufficient rather than requiring all of them. See [Interest Badges](https://bumble.com/en-us/the-buzz/filter-by-interest-badges). |
| Explanation of suggestions | These sources did not establish whether each card explains its ranking. That remains unverified. | The [Discover page](https://bumble.com/en-us/features/discover/) described personalisation using profiles, prior matches, interests and goals. Per-card explanations were not verified. |
| No results | Official help suggested widening age/distance ranges. See [No profiles in Discovery](https://www.help.tinder.com/hc/en-us/articles/115003496123-I-m-not-seeing-profiles-in-Discovery). | The reviewed [filter guidance](https://support.bumble.com/hc/en-us/articles/28423691289629-Using-filters-to-set-your-preferences) discussed preferences, seeing others after exhausting the range and reducing excessive filters. The precise empty-state interface was not tested. |

These observations preserve what was recorded on 2 November. They are not a claim of re-testing the products on the translation date; behaviour may vary by region or version.

## Design choices for Mingle

1. Make filter rules visible. If multi-interest filters are added later, explicitly state whether any or all selected interests must match.
2. Explain genuine common interests so that the user has a concrete reason to begin a conversation.
3. Let users deliberately change or clear filters instead of silently widening them. This is easier to understand and verify.

The reference products primarily serve dating contexts. They do not by themselves establish a need for a campus friendship service; target-user assumptions need separate observation.

## Existing work and A's increment

The historical Django prototype already had interest/activity filtering, a common-interest calculation and a clear-filter action. That work was not new in the 2 November research submission. Its historical source remains identifiable at the pre-cleanup commit: [recommendation service](https://github.com/hansu650/thematic-friend-finder/blob/ae63188/social/services.py) and [discovery template](https://github.com/hansu650/thematic-friend-finder/blob/ae63188/templates/social/discover.html).

The 6 November Java baseline now includes filtering and shared labels and is assigned to A with explicit AI assistance. A's subsequent refinement should improve filter summaries, empty-state recovery and interaction clarity, with actual before/after evidence.

Candidate story: “As a browser, I want to understand selected filters and shared interests so that I can judge whether a suggestion meets my expectations.”

Acceptance proposals:

- Selecting Reading and Workout buddy keeps both conditions visible, returns people satisfying both and can be cleared.
- A card displays only the actual intersection of interests; a zero-intersection card does not invent common ground.
- An empty result keeps the selected values available for adjustment and does not silently broaden them.

## Discussion to hold

The proposed audience is people seeking friends or activity partners. Discuss whether explanation clarity or additional filter options should come first. Combine this evidence with B–F's findings before final prioritisation. The [kick-off file](../../meetings/week1_kickoff.md) remains an agenda, not a completed meeting record.
