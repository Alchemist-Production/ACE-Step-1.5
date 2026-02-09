## 2025-02-18 - Gradio Icon-Only Buttons
**Learning:** This Gradio app frequently uses icon-only buttons (like 🎲) without text labels or tooltips, making them inaccessible and unclear.
**Action:** Always verify if `gr.Button` has a descriptive label or if `info` params are available on associated components to provide context.

## 2025-02-18 - Time-based Input Clarity
**Learning:** Users struggle with time-based inputs (like start/end times) when units (seconds) and special values (like -1 for end) are not explicitly stated in the input's helper text.
**Action:** Always add `info` parameter to `gr.Number` components for time-based inputs, specifying units (e.g., "seconds") and meaning of special values (e.g., "0.0 for start", "-1 for end").
