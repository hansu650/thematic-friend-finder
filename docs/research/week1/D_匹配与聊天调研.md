# D | Week 1: Matching and Chat Research

**Review date:** 6 November 2026 (Beijing time).  
**Products:** [Tinder][t1] and [Hinge][h1].  
**Method:** Review of official help pages. No account-based testing, paid features, or contact with strangers was involved. Product behaviour below is reported by the official documentation, rather than personally tested.

## Comparison and evidence

- **Tinder:** A one-sided Like is not yet a match. Received Likes can be viewed on the Likes page, with full access requiring a subscription. Liking someone back creates a match ([evidence: Likes, "Already subscribed?"][t1]). Ordinary chat requires mutual interest ([messaging page, opening paragraph][t2]). Chat is available through a matching relationship; the current placement of new matches and historical conversations still needs practical verification. Unmatching removes each person from the other's match list and prevents further contact ([unmatching page, main text and "To Unmatch Someone"][t3]).
- **Hinge:** After a Like is sent, the other person's profile disappears from Discover while awaiting a response. The recipient sees a numerical badge in Likes You ([Likes, "Sending Likes" and "Receiving Likes"][h1]). Accepting the Like moves the person into Matches, which provides access to new matches and existing conversations ([matching page, "Messaging your Match"][h2]). Unmatching removes the conversation, prevents further messages, and cannot be reversed. Hide only removes a conversation from view while preserving the connection ([Unmatching, opening paragraphs and instructions][h3]).

## State flow and development recommendations

**No Like → One-sided Like (waiting) → Mutual Match (connection established) → Chat Enabled (messaging permitted) → Unmatched (entry removed; sending blocked).**

This flow summarises ordinary chat based on the sources above. A comment attached to a Hinge Like is not equivalent to an open conversation. The evidence directly checked was official wording; no transitions between real accounts were observed. Paid-feature exceptions, stale offline screens, and simultaneous unmatching and message sending remain unverified.

Two practices worth adopting:

1. Enable chat only after mutual consent, so each user retains control over whether to connect.
2. Distinguish hiding a conversation from ending a connection, so organising a chat list does not accidentally remove a match.

One practice not recommended is copying Tinder's paid access to received Likes. A campus project should make it easier, and less costly, to confirm mutual interest.

For next week's development, define shared relationship states and require the server to check the current relationship whenever a message is sent. This is a proposal for our project, not a claim about either product's internal implementation.

## Candidate user story and acceptance criteria

**User story:** As a user, I want to chat only after both people agree, so that I retain control over whom I connect with.

1. **Given** only one person has sent a Like, **when** either person attempts to send a chat message, **then** the request is rejected and no conversation is created.
2. **Given** one person has already sent a Like, **when** the other person likes them back, **then** exactly one match is created. Both users can open it from the match list and send messages; reopening the conversation shows its history.
3. **Given** either person has unmatched, **when** both users refresh their lists, **then** the corresponding entries disappear. If the other person sends from a stale chat screen, the interface reports that the connection has ended and the message is not delivered.

## Question for the team

After unmatching, should any conversation records be retained solely for reporting abuse? If so, who may access them, and for how long?

[t1]: https://www.help.tinder.com/hc/en-us/articles/115005246123-Likes
[t2]: https://www.help.tinder.com/hc/en-us/articles/115003341183-How-do-I-message-someone
[t3]: https://policies.tinder.com/web/safety-center/tools/unmatch/intl/en/
[h1]: https://help.hinge.co/hc/en-us/articles/36311632894995-Likes
[h2]: https://help.hinge.co/hc/en-us/articles/360011090134-How-Do-I-Match-with-Someone-and-Start-Chatting
[h3]: https://help.hinge.co/hc/en-us/articles/36311673303571-Unmatching
