# Spring Boot Engineering Contracts

The user-created project is `code/thematic-friend/`: Java 21, Spring Boot 4.1.2, Maven Wrapper, package `com.example.thematicfriend`. A controller calls a service, a service uses repositories and the controller supplies data to a Thymeleaf template. HTML is under `src/main/resources/templates/`; CSS/JavaScript is under `static/`. The browser displays the result.

| Route | Purpose | Owner |
|---|---|---|
| GET /, /login, /signup; POST /signup | Public pages and account creation | C, with A for structure |
| GET/POST /profile | Current user's profile | C |
| GET /discover | Interest/activity filtering | A/B |
| POST /decisions/{target} | Like or skip | D, with A for interaction |
| GET /connections, /conversations/{id} | Connections and conversation | D/B |
| POST /conversations/{id}/messages | Send a message | D |
| GET /api/conversations/{id}/messages | Poll later messages | D |
| POST /connections/{id}/end | End contact | D/E |
| /safety, POST /blocks/{target}, /reports/{target} | Safety controls | E |

All state-changing business actions use POST and CSRF protection. Actor identity comes from the authenticated session, never a submitted sender ID. Values are validated against defined lists. Templates escape user text and client-side messages use textContent.

Account data has a unique username and password hash. Public profiles contain display name, bio, interests, activity and discoverability. Decisions are directional; connections store a unique ordered member pair. Every conversation read/write checks participation, active status and both directions of blocking. Reports belong to the reporter. Any future staff-only fields need explicit role checks.

Persisted interest/activity values are English. Localised labels are resolved from message bundles. The default interface is English; the temporary session language selection accepts EN/Chinese. Free-text user content remains unchanged. See [application contracts](../code/thematic-friend/docs/CONTRACTS.md) for implementation detail and limits.

This is a single-instance local course prototype with H2 files and polling. F checks data retention after restart. The [Spring web guide](https://spring.io/guides/gs/serving-web-content/) and [database documentation](https://docs.spring.io/spring-boot/reference/data/sql.html) explain the underlying components.
