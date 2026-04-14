## 2026-04-14 - [Dynamic Button Accessibility]
**Learning:** Using a static `aria-label` on buttons with dynamic state changes (e.g. 'Copy' changing to 'Copied') suppresses the state change announcement for screen readers because the static `aria-label` overrides the inner text content.
**Action:** Use `aria-live="polite"` on the button and a dynamic `sr-only` `<span>` to convey state changes to screen readers, while hiding visual dynamic text using `aria-hidden="true"`.
