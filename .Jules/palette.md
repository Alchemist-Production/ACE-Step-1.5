## 2025-02-18 - Gradio Icon-Only Buttons
**Learning:** This Gradio app frequently uses icon-only buttons (like 🎲) without text labels or tooltips, making them inaccessible and unclear.
**Action:** Always verify if `gr.Button` has a descriptive label or if `info` params are available on associated components to provide context.

## 2026-02-07 - Numeric Input Units and Sentinel Values
**Learning:** Users struggle to guess units (e.g., seconds vs steps) and sentinel values (e.g., -1 for "end of track") in Gradio numeric inputs without explicit guidance.
**Action:** Always use the `info` parameter on `gr.Number` to explicitly state the unit of measurement and the meaning of any special values like -1 or 0.
