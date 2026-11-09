# Implemented Contract and Member Discussion

A's discovery increment changes the mutual-like redirect to GET /matches/{connectionId}. That participant-only page opens the existing GET /conversations/{connectionId}; the ID and chat API stay the same. It adds no database columns. Filters use existing English option values, with translated labels only in the UI.

The following are proposals/checkpoints, **not recorded team agreements**:

| Owners | Decision to confirm before integration |
|---|---|
| A + B | Keep unsaved preview separate from persistence; preserve discovery form IDs and CSRF forms if shared CSS/JS changes. |
| A + C | Document the session invalidation rule after password change and how staff roles are stored/granted. |
| A + C + D | Use per-participant read markers, stable message-ID ordering and a bounded older-history cursor; agree the POST read acknowledgement. |
| A + C + E | Controlled staff setup; ordinary sign-up cannot grant staff access; enforce report access on the server and keep internal notes private. |
| A + F | Treat APP_DATA_DIR as the configured database directory; verify stopped-app backup/restore on disposable data before any real replacement. |

Record the actual agreed fields/routes, decision date and participants in the shared contracts document after discussion. A continues integration when the members' implementations and reviews are ready.
