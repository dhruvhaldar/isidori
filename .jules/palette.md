## 2026-04-14 - [Dynamic Button Accessibility]
**Learning:** Using a static `aria-label` on buttons with dynamic state changes (e.g. 'Copy' changing to 'Copied') suppresses the state change announcement for screen readers because the static `aria-label` overrides the inner text content.
**Action:** Use `aria-live="polite"` on the button and a dynamic `sr-only` `<span>` to convey state changes to screen readers, while hiding visual dynamic text using `aria-hidden="true"`.

## 2024-05-24 - [Spreadsheet UX in Form Inputs]
**Learning:** Controlled React numeric inputs that receive empty strings can accidentally parse them as `NaN`. Also, requiring users to manually backspace before typing over a zero is a common friction point in grid/matrix data entry.
**Action:** Use `value={Number.isNaN(val) ? "" : val}` to gracefully map `NaN` to an empty string. Add `onFocus={(e) => e.target.select()}` to mimic spreadsheet behavior, allowing instant overwriting on focus.
