## 2026-04-14 - [Dynamic Button Accessibility]
**Learning:** Using a static `aria-label` on buttons with dynamic state changes (e.g. 'Copy' changing to 'Copied') suppresses the state change announcement for screen readers because the static `aria-label` overrides the inner text content.
**Action:** Use `aria-live="polite"` on the button and a dynamic `sr-only` `<span>` to convey state changes to screen readers, while hiding visual dynamic text using `aria-hidden="true"`.

## 2024-04-18 - Select all text on focus for numeric input fields
**Learning:** For numeric matrix inputs, users often want to completely replace the existing value (e.g. 0) rather than append to it (e.g. making it 05 instead of 5).
**Action:** Always add `onFocus={(e) => e.target.select()}` to numeric data-entry fields, specifically matrix cells, to reduce keystrokes and friction.

## 2024-04-18 - Handle NaN visually for input values
**Learning:** When passing `parseFloat("")` to a controlled input, React receives `NaN`, which gets rendered as the string "NaN". This looks buggy and breaks UX.
**Action:** Always map `NaN` to `""` for controlled numeric inputs (e.g. `value={Number.isNaN(val) ? "" : val}`).
