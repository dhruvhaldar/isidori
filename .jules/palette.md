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
