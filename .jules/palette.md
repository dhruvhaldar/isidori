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

## 2026-05-22 - [Stale Data Feedback UX]
**Learning:** When performing async re-computations or form submissions that update existing result blocks on the screen, completely clearing the state (e.g. `setResult(null)`) before the fetch finishes causes a jarring layout shift and visually replaces the user's previous context with an empty state. This breaks continuity.
**Action:** Instead of clearing stale data entirely, retain the previous data in state and apply a dynamic CSS class (like `opacity-50 pointer-events-none transition-opacity`) to visually "dim" the block while `isLoading` is true. This smoothly communicates to the user that the data is stale and updating without breaking the layout.

## 2026-05-24 - [Aria-Live Region Verbosity]
**Learning:** Wrapping large data structures, matrices, or complex mathematical strings entirely in `aria-live="polite"` regions causes screen readers to read the entire DOM structure out loud every time it updates. This leads to massive, frustrating verbosity and navigation fatigue for screen reader users.
**Action:** Isolate `aria-live` regions specifically to status wrappers (e.g., around loading spinners or error messages) and provide visually hidden (`sr-only`) concise announcement messages upon completion, keeping the dense data elements outside the live region.

## 2026-05-25 - [Touch Device & Screen Reader Support for Inline Actions]
**Learning:** Hiding inline actions (like "Copy" buttons next to code blocks) using strict hover states (`opacity-0 group-hover:opacity-100`) makes them completely undiscoverable on touch devices (mobile/tablet) which lack a hover mechanism. Furthermore, when the action completes, failing to update `aria-label` or lacking `aria-live` means screen reader users receive no confirmation of success.
**Action:** Use responsive modifiers (`md:opacity-0 md:group-hover:opacity-100`) so the actions are visible by default on smaller touch devices and reveal on hover for larger screens. Always add `aria-live="polite"` and dynamically update `aria-label` or include a visually hidden announcement when the action (like copying) is successful.
## 2026-05-26 - Improve Navigation Touch Targets and Active State Clarity
**Learning:** Using only font-weight to indicate active state in primary navigation is insufficient for many users (especially with low contrast), and small inline links present usability issues on touch devices.
**Action:** Always wrap primary navigation links with generous padding (`px-3 py-2`) to meet minimum touch target sizes (44x44px equivalent), and use distinct background colors (`bg-accent text-accent-foreground`) alongside font-weight changes to unambiguously communicate the current active page.
## 2024-05-31 - Mobile Keyboard Optimization for Matrix Inputs
**Learning:** Using `type="text"` (required for `selectionStart` API to implement arrow-key cell navigation) triggers the full alphanumeric keyboard on mobile, making numeric matrix entry extremely tedious.
**Action:** Always combine `type="text"` with `inputMode="decimal"` for numeric grid inputs to ensure mobile users get a numeric keypad while preserving the text-selection APIs needed for desktop keyboard navigation.

## 2026-06-01 - [Keyboard Access for Overflowing Text]
**Learning:** Text containers (like mathematical expressions or matrices) that utilize `overflow-x-auto` to handle long strings are inaccessible to keyboard-only users unless they can be focused. If they overflow and cannot receive focus, a keyboard user cannot scroll to read the hidden content.
**Action:** Always add `tabIndex={0}`, a `role="region"`, a descriptive `aria-label`, and appropriate focus indicator classes (like `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1`) to `overflow-x-auto` text containers to allow keyboard users to focus and scroll them.

## 2026-06-03 - [Keyboard Cancellation for Inline Confirmations]
**Learning:** Inline confirmation patterns (like clicking "Clear" -> "Sure?") are great for preserving context compared to heavy modals. However, forcing users to wait for a timeout to cancel an accidental click causes friction and a feeling of lost control.
**Action:** Always provide escape hatches (e.g., listening for the 'Escape' key via `onKeyDown`, and resetting the state on `onBlur`) to instantly cancel and reset inline confirmation states, restoring user control.

## 2026-06-04 - Semantic Icons in Navigation for Scannability
**Learning:** Text-only navigation links in the primary header can blend together, making it difficult for users to quickly scan and identify their target page, especially when the navigation options map directly to visually distinct feature cards on the homepage.
**Action:** Always include consistent semantic icons alongside primary navigation text labels to improve visual recognition, create a cohesive design language across the application, and reduce cognitive load for users scanning the navigation bar. Ensure these icons are purely decorative by applying `aria-hidden="true"`.

## 2026-06-06 - [Bulk Disabling Forms with Fieldset]
**Learning:** In complex forms where computations take time, keeping inputs fully interactive allows users to modify data mid-computation, leading to frustrating state-mismatch bugs where the visible output doesn't match the inputs. Passing `disabled` props down to every individual input and button is tedious and prone to error.
**Action:** Leverage the native HTML5 `<fieldset>` element by wrapping the form controls in `<fieldset disabled={isLoading}>`. This automatically disables all descendant form controls and seamlessly applies Tailwind's `disabled:opacity-50 disabled:pointer-events-none` pseudo-classes in a clean, declarative manner.
## 2024-06-07 - Add missing tooltips to icon-only buttons
**Learning:** Sometimes icon-only buttons have `sr-only` text for screen readers, but lack a `title` attribute, leaving mouse users without hover feedback.
**Action:** When creating icon buttons, always include a descriptive `title` attribute along with `aria-label` or `sr-only` text so both mouse and screen reader users can understand the button's action.

## 2026-06-08 - [Keyboard Shortcuts inside Button Labels]
**Learning:** Adding visual keyboard shortcuts (`<kbd>`) inside a `<Button>` element pollutes the accessible name of the button, causing screen readers to read confusing text like "Submit command symbol return symbol".
**Action:** Always apply `aria-hidden="true"` to inline keyboard shortcut visual indicators inside interactive elements, and consider adding a `title` attribute to the button to explicitly describe the shortcut for mouse users without breaking the accessible name.

## 2026-06-11 - [Keyboard Access for Overflowing Navigation]
**Learning:** Navigation containers that use `overflow-x-auto` to handle long lists of links on smaller screens are inaccessible to keyboard-only users unless the container itself can be focused. If it cannot receive focus, a keyboard user cannot scroll to reach the hidden navigation items.
**Action:** Always add `tabIndex={0}`, a `role="region"`, a descriptive `aria-label`, and appropriate focus indicator classes to `overflow-x-auto` navigation containers to allow keyboard users to focus and scroll them.
## 2024-06-12 - Stale State Warning on Mutable Inputs
**Learning:** When displaying data derived from mutable inputs (like a simulation plot), failing to notify the user that their parameters have changed since the last calculation can lead to significant confusion, as the plot no longer represents the current inputs.
**Action:** Implement a 'stale state' to visually dim the derived UI elements (e.g., `opacity-70 grayscale-[0.5]`) and display an accessible warning (`role="alert"`) if inputs change post-calculation. Crucially, when implementing this in React with `useEffect`, track the last computed parameters using a `useRef` and compare them in an effect that depends *only* on the input parameters. Do not include simulation status flags (like `isSimulating` or `simData`) in the dependency array, as this causes an immediate false-positive stale state upon successful computation.

## 2026-06-14 - [Keyboard Access for Overflowing Matrices]
**Learning:** Matrix inputs that utilize `overflow-x-auto` to handle large grids are inaccessible to keyboard-only users unless the container itself can be focused. If they overflow and cannot receive focus, a keyboard user cannot scroll to view the hidden columns.
**Action:** Always add `tabIndex={0}`, a `role="region"`, a descriptive `aria-label`, and appropriate focus indicator classes (like `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 rounded-sm`) to `overflow-x-auto` matrix containers to allow keyboard users to focus and scroll them.
## 2026-06-17 - [Bulk Disabling Forms with Fieldset]
**Learning:** In complex forms where computations take time, keeping inputs fully interactive allows users to modify data mid-computation, leading to frustrating state-mismatch bugs where the visible output doesn't match the inputs. Passing `disabled` props down to every individual input and button is tedious and prone to error.
**Action:** Leverage the native HTML5 `<fieldset>` element by wrapping the form controls in `<fieldset disabled={isLoading}>`. This automatically disables all descendant form controls and seamlessly applies Tailwind's `disabled:opacity-50 disabled:pointer-events-none` pseudo-classes in a clean, declarative manner.
## 2026-06-18 - [Keyboard Form Submission Shortcut with Multiple Buttons]
**Learning:** When wrapping interactive elements in a `<form>` to enable native HTML submission and keyboard shortcuts (e.g., Enter or Cmd/Ctrl+Enter), any `<Button>` or `<button>` element inside the form defaults to `type="submit"`. This causes secondary actions (like "Check DDP" in a form meant for "Compute V*") to accidentally trigger unintended form submissions when clicked.
**Action:** Always explicitly add `type="button"` to secondary `<Button>` components within a `<form>`, and explicitly mark the primary action as `type="submit"`. Combine this with an `onSubmit` handler on the `<form>` and an `onKeyDown` handler that traps `Cmd/Ctrl + Enter` and calls `form.reportValidity()` before submission, providing a robust, keyboard-accessible experience.

## 2026-06-20 - [Educational Context in Complex Interfaces]
**Learning:** In complex engineering analysis tools where users must input abstract mathematical components (like "A", "B", "C" matrices or "f(x)", "g(x)" vector fields), omitting the underlying mathematical relationship (e.g., the state-space equations) increases cognitive load and alienates students who are still learning the material.
**Action:** Always include descriptive subheadings (like `<CardDescription>`) that explicitly show the governing equations (e.g., `dx/dt = Ax + Bu + Ed, y = Cx` or `dx/dt = f(x) + g(x)u, y = h(x)`) right above the input fields. This provides immediate, in-context educational grounding without requiring users to consult external documentation.

## 2026-06-25 - [Mobile Keyboard Optimization for Number Inputs]
**Learning:** Using `type="number"` without `inputMode="numeric"` or `inputMode="decimal"` often triggers a sub-optimal keyboard layout (sometimes just the standard text keyboard depending on the OS and browser).
**Action:** Always add `inputMode="numeric"` to positive integer `<Input type="number">` fields (and `inputMode="decimal"` for floats) to guarantee the best numeric keypad on iOS/Android.
