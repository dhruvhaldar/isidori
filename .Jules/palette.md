## 2025-03-01 - Matrix Grouping with Fieldset
**Learning:** Using `div` and `Label` for complex input matrices causes screen readers to read individual inputs without context. Wrapping the entire matrix in a `<fieldset>` and using a `<legend>` significantly improves accessibility by grouping the inputs semantically and providing immediate context when users focus on any input within the matrix.
**Action:** Always wrap groups of closely related inputs (like multi-dimensional matrices or coordinate inputs) in a `<fieldset>` with a `<legend>` instead of generic `div` and `Label` components.

## 2024-05-24 - Missing Async Loading States
**Learning:** This app heavily relies on complex math computations executed asynchronously via API endpoints (V* computation, DDP checking, simulation), but previously lacked loading state feedback or `aria-busy` indicators. This causes severe accessibility/UX issues since screen readers and typical users cannot determine if an action is processing or failed silently.
**Action:** When adding new analytical or computation-heavy features to this app, ensure `isLoading` or specific computation states are implemented to visually (disabled button, text change) and programmatically (`aria-busy`) denote the pending operation.

## 2024-05-18 - Improve Loading Feedback & Input Validation
**Learning:** For async operations, missing visual loading indicators (like spinners) causes user confusion, especially when operations take noticeable time. Furthermore, unbounded number inputs in forms can lead to application crashes (e.g., `RangeError` when resizing matrices below 1). Small `<input type="number" min="1">` constraints drastically improve input robustness.
**Action:** Always include visual loading indicators (like `Loader2` combined with `isLoading` states) for computational buttons. Ensure dimension inputs default to sensible minimums (`min="1"`) to avoid application crashes or bad states.
## 2026-03-29 - Refactor inline footer styles for contrast and accessibility
**Learning:** Hardcoded inline styles (like `color: "#272e3f"`) break accessibility in dark mode themes by failing WCAG contrast guidelines and prevent hover/focus states from working cleanly.
**Action:** Always use semantic Tailwind utility classes (e.g., `text-foreground`, `hover:underline`, `focus-visible:ring-2`) for consistent theming and proper keyboard accessibility.

## 2026-03-30 - Skip Links for Next.js Layouts
**Learning:** Next.js single-page application navigations can trap keyboard users in the header on every navigation unless there is an accessible way to skip to the main content. The main container must also be explicitly made focusable via tabIndex={-1} so that the browser correctly shifts focus away from the skip link.
**Action:** Always include a 'Skip to main content' link as the first element in the body of the root layout, and ensure the main tag has id='main-content' and tabIndex={-1} with outline-none applied.

## 2026-03-31 - Native Forms for Input Validation and Keyboard Accessibility
**Learning:** Using simple `div` tags and React `onClick` handlers for data-entry forms prevents native browser validation (like the `required` attribute) from functioning correctly and breaks the expected keyboard UX (submitting a form by pressing 'Enter'). This forces users to manually tab to the submit button.
**Action:** Always wrap data-entry fields and their associated submit button in a native `<form>` element with an `onSubmit` handler, and ensure the submit button has `type="submit"`. This guarantees built-in HTML5 validation works and allows users to submit the form seamlessly using the 'Enter' key.
