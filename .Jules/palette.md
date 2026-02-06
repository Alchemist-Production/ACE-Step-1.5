## 2025-02-18 - Gradio Icon-Only Buttons
**Learning:** This Gradio app frequently uses icon-only buttons (like 🎲) without text labels or tooltips, making them inaccessible and unclear.
**Action:** Always verify if `gr.Button` has a descriptive label or if `info` params are available on associated components to provide context.

## 2025-02-18 - Input Units and Magic Numbers
**Learning:** Numeric inputs like "Repainting Start/End" often lack visible units (seconds) or explanations for magic numbers (like -1 for "end"), causing user confusion.
**Action:** Use the `info` parameter in `gr.Number` (and update `i18n/*.json`) to explicitly state units and special values directly in the UI.
