# Pipeline Resolution Doctrine

Players declare intent.
The system executes consequence.

Rules:

1. All runtime actions resolve through ordered pipeline steps.
2. Pipelines must remain replay-safe.
3. Pipeline execution must be auditable.
4. Hidden runtime mutation outside pipelines is invalid.
5. Pipelines must resolve through deterministic sequencing.
6. Gold observability may inspect pipelines but may not alter them.

Pipeline flow:

Intent
→ RuntimeAction
→ Sequencing
→ Pipeline
→ Resolution
→ Constraint Check
→ Audit
→ State Commit

Purpose:

Pipeline resolution transforms player intention into deterministic consequence.
