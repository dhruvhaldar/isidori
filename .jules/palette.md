## 2026-04-14 - [Dynamic Button Accessibility]
**Learning:** Using a static `aria-label` on buttons with dynamic state changes (e.g. 'Copy' changing to 'Copied') suppresses the state change announcement for screen readers because the static `aria-label` overrides the inner text content.
**Action:** Use `aria-live="polite"` on the button and a dynamic `sr-only` `<span>` to convey state changes to screen readers, while hiding visual dynamic text using `aria-hidden="true"`.

## 2024-05-24 - [Spreadsheet UX in Form Inputs]
**Learning:** Controlled React numeric inputs that receive empty strings can accidentally parse them as `NaN`. Also, requiring users to manually backspace before typing over a zero is a common friction point in grid/matrix data entry.
**Action:** Use `value={Number.isNaN(val) ? "" : val}` to gracefully map `NaN` to an empty string. Add `onFocus={(e) => e.target.select()}` to mimic spreadsheet behavior, allowing instant overwriting on focus.

## 2026-04-21 - Optimize Images with next/image
**Learning:** Next.js heavily recommends using `next/image` to handle image loading which prevents layout shift and natively optimizes images. Skipping it triggers  lint warnings.
**Action:** Use `<Image>` instead of `<img>`, specifying `fill` along with existing parent `relative` classes.

## 2026-04-21 - Optimize Images with next/image
**Learning:** Next.js heavily recommends using next/image to handle image loading which prevents layout shift and natively optimizes images. Skipping it triggers lint warnings.
**Action:** Use <Image> instead of <img>, specifying fill along with existing parent relative classes.

## 2026-04-22 - [Mathematical Input Readability & Semantic Result Labels]
**Learning:** Mathematical variables and expressions are difficult to read in standard sans-serif fonts, as characters like '1', 'l', and 'I' blend together. Additionally, using standalone `<Label>` components for read-only result headers violates HTML semantics and causes screen reader confusion because they lack an associated form control.
**Action:** Apply `font-mono` to input fields that handle mathematical expressions to align with code-input patterns and improve legibility. Replace standalone `<Label>` components in read-only results with semantically correct heading tags (e.g., `<h3 className="text-sm font-medium leading-none">`) that preserve visual styling.

## 2026-04-23 - [Spreadsheet UX in Dimension Inputs]
**Learning:** Default numeric form inputs that snap to "1" on backspace present a frustrating UX. It prevents users from quickly clearing and typing a new number. A spreadsheet-like entry is preferred.
**Action:** Use `useState<number | "">` and `onFocus={(e) => e.target.select()}` to let users select and overwrite values immediately. Use ternary assignment in the `onChange` logic to gracefully handle empty inputs, mapping to empty string instead of `NaN` or a forced fallback.

## 2026-04-24 - [Matrix Cell Input UX]
**Learning:** Default HTML number inputs render up/down 'spin buttons'. In tightly packed grids or matrices (like `MatrixInput`), these spin buttons can overlap or misalign with the typed numbers, creating a confusing and ugly UX. Additionally, numbers are easier to scan in a matrix when aligned properly with a monospace font.
**Action:** Apply `font-mono` and use CSS/Tailwind rules (`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`) to completely hide native spin buttons on matrix inputs.

## 2026-04-25 - [Error State Accessibility]
**Learning:** Using only color (like a red background) to indicate error states in `role="alert"` messages violates WCAG guidelines because it fails to convey information to users who are color blind.
**Action:** Always pair color-coded feedback in alerts with clear iconography (e.g., using `AlertCircle` from lucide-react) to ensure the status is communicated through multiple visual channels.
## 2025-03-02 - React API Error Rendering Crash
**Learning:** Rendering raw API error responses (like `err.response?.data?.detail`) directly in React state causes a crash ("Objects are not valid as a React child") if the backend (e.g., FastAPI/Pydantic) returns an array of validation error objects for a 422 Unprocessable Entity.
**Action:** Always parse and format API error details (checking `Array.isArray`) into readable strings before setting them in React error states to prevent application crashes and provide actionable UI feedback.
## 2024-05-18 - [Smooth Entry Animations for Dynamic Results]
**Learning:** Adding subtle CSS animations to dynamic content elements (like error alerts or data tables) when they mount prevents jarring UI layout shifts. However, to maintain strict accessibility, these animation classes must be prefixed with `motion-safe:` to respect users who have 'prefers-reduced-motion' enabled at the OS level.
**Action:** Always use `motion-safe:animate-in motion-safe:fade-in` instead of bare `animate-in` when utilizing `tailwindcss-animate` for entry effects.
## 2026-05-18 - [Keyboard Form Submission Shortcut]
**Learning:** For forms containing textareas, pressing 'Enter' naturally inserts a newline. This limits quick keyboard submission and creates an accessibility/UX gap for advanced users. Providing a keyboard shortcut (`Cmd/Ctrl + Enter`) alongside a visual indicator (like a styled `<kbd>` element on the submit button) enhances usability.
**Action:** Use an `onKeyDown` handler on the `<form>` wrapper to trap `metaKey || ctrlKey` + `Enter`, call `preventDefault()`, and trigger submission. Add a visually clear, responsive `<kbd>` hint (hidden on mobile devices) to the primary action button.
## 2026-04-30 - [Disable Autocorrect on Math/Code Inputs]
**Learning:** Browsers and mobile keyboards frequently attempt to spell-check or auto-capitalize inputs containing mathematical variables or code-like expressions (e.g., changing "x1" to "X1" or flagging "sin(x1)" as a typo), which leads to a frustrating user experience when entering formulas.
**Action:** Always add `spellCheck={false}`, `autoCapitalize="none"`, and `autoCorrect="off"` to text inputs and textareas that are intended for code, variable names, or mathematical expressions to ensure raw input is preserved exactly as typed.
## 2026-05-18 - [Bulk Actions for Grid Data Entry]
**Learning:** In applications involving dense data entry like mathematical matrices or grids, clearing out default data or a previous system cell-by-cell requires excessive tabbing and backspacing, which is a significant point of UX friction and repetitive strain.
**Action:** Provide explicit, accessible bulk actions (like a "Clear" button with an `Eraser` icon) for editable grids/matrices so users can instantly reset all values to default/zero before entering new data.

## 2026-05-06 - Explicit Empty States for Zero-Dimensional Matrices
**Learning:** In geometric control theory, rendering zero-dimensional subspaces (like an empty V* basis matrix) is mathematically correct and common (representing the origin). However, completely hiding the `MatrixInput` DOM structure when `rows === 0` or `cols === 0` provides poor UX and lack of feedback to users, making them assume the component failed to render or the computation was buggy.
**Action:** Always provide explicit, styled empty states (e.g., using a dashed border, muted background, and a recognizable symbol like `∅`) for components that can mathematically evaluate to 'empty' or zero dimensions, rather than rendering nothing.

## 2026-05-19 - Accessible HTML Tables for SVG Charts
**Learning:** SVG charts generated by libraries like Recharts are inherently opaque and difficult to navigate for screen reader users. Simply providing an `aria-label` on the chart container is insufficient for data exploration.
**Action:** Always wrap complex SVG charts in an `aria-hidden="true"` container and provide an adjacent, screen-reader-only (`sr-only`) standard HTML `<table>` that contains a manageable subset of the underlying data points.

## 2026-05-19 - [Matrix Column Scaling UX]
**Learning:** Using `minmax(0, 1fr)` for CSS grid template columns on elements with a variable number of columns (like dynamic matrices) causes the columns to shrink infinitely to fit the container width. On narrow screens or with many columns, inputs become completely unreadable and unusable.
**Action:** Use a minimum width constraint like `minmax(4rem, 1fr)` on the grid template and wrap the grid in a horizontally scrollable container (`overflow-x-auto`). Add appropriate padding/negative margins to ensure keyboard focus rings (e.g. `focus-visible:ring-2`) are not clipped by the overflow boundaries.

## 2026-05-20 - [Spatial Keyboard Navigation in Matrices]
**Learning:** In highly dense spreadsheet-like interfaces, users expect to navigate adjacent input cells using arrow keys. However, detecting text boundaries (to prevent jumping cells while the user is actively typing a number) requires `selectionStart` and `selectionEnd`, which natively throw errors on `<input type="number">`.
**Action:** Change numeric matrix inputs to `type="text"` with `inputMode="decimal"`. Use localized string state inside the cell component to handle intermediate typing states (like `-` or `1.`), sync only valid parsed numbers to the parent, and implement an `onKeyDown` handler to allow spatial movement (Arrow Up, Down, Left, Right) only when the cursor is at the edges of the input value.

## 2026-05-19 - Native Validation on Custom Shortcut Submissions
**Learning:** When implementing custom form submission shortcuts (like Cmd/Ctrl + Enter) via an `onKeyDown` handler, calling the form's submit logic directly bypasses native HTML5 validation constraints (like the `required` attribute).
**Action:** Use `form.checkValidity()` and `form.reportValidity()` before executing the submission logic. This ensures the browser validates the inputs and displays the native validation tooltips properly.
