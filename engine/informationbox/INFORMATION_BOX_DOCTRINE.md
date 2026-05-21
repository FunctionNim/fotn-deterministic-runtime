# Information Box Runtime Doctrine

The Information Box controls when resolved consequence becomes visible.

Rules:

1. Damage Intents may be visible before final outcome.
2. Target locks may be visible before final outcome.
3. Final survival, defeat, routing, and completed outcomes remain hidden until reveal authorization.
4. Information Box reveal occurs at the start of the End Step unless a higher system rule says otherwise.
5. Replay inspection must preserve hidden-resolution timing.
6. Watcher output must respect Information Box visibility.
7. Audit may record outcome before reveal, but player-facing visibility must wait for authorization.

Purpose:

The Information Box separates prediction from confirmed reality while preserving deterministic replay and audit integrity.
