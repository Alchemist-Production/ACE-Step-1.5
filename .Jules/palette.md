## 2025-02-18 - Gradio Icon-Only Buttons
**Learning:** This Gradio app frequently uses icon-only buttons (like 🎲) without text labels or tooltips, making them inaccessible and unclear.
**Action:** Always verify if `gr.Button` has a descriptive label or if `info` params are available on associated components to provide context.

## 2026-02-14 - Numeric Input Units
**Learning:** Numeric inputs for time (start/end points) lacked unit indicators and special value explanations (e.g., -1), causing user confusion about precision and behavior.
**Action:** Always add `info` parameter to `gr.Number` components to explicitly state units (seconds) and explain special values.
