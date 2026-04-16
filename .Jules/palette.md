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
## 2026-04-01 - Accessible Next.js Link Buttons & Mobile Navigation
**Learning:** In Next.js App Router, wrapping a `<Button>` component inside a `<Link>` element creates invalid HTML (`<a><button>` nested interactive elements) which degrades accessibility and causes hydration errors. Also, relying solely on `hidden md:flex` for top navigation without a mobile menu fallback makes the application completely unusable on mobile devices.
**Action:** Use the `asChild` prop on Radix/shadcn-ui `<Button>` components when wrapping Next.js `<Link>` components (e.g. `<Button asChild><Link>...</Link></Button>`). Use horizontal scrolling (`overflow-x-auto whitespace-nowrap scrollbar-hide`) as a lightweight alternative to building complex mobile hamburger menus when navigation items are few.

## 2026-04-02 - Accessible Status Badges
**Learning:** Relying solely on background and text colors (like red/green) to indicate mathematical solvability or status results fails WCAG accessibility guidelines, preventing colorblind users from discerning the result. In addition, hardcoded specific colors can lack proper contrast in dark mode.
**Action:** Always pair color-coded status badges with descriptive iconography (e.g., using Lucide React icons like `CheckCircle` or `AlertTriangle`). Furthermore, always provide `dark:` variants to maintain sufficient contrast across themes.

## 2026-04-06 - Render Mathematical Data with UI Components
**Learning:** When outputting structured mathematical data like matrices to users, raw formats like JSON.stringify() are developer-centric and offer poor UX and readability.
**Action:** Use existing semantic, structured input components (like MatrixInput in readOnly mode) to display structured data output to maintain visual consistency and clarity.

## 2026-04-07 - Feature Card Click Targets
**Learning:** When using large Card components to describe features on a landing page, wrapping the entire Card in a Link (with hover and focus states) rather than relying on a small "Learn More" button dramatically improves the clickable area (applying Fitts's Law) and provides a more intuitive navigation experience for users.
**Action:** Always wrap structural overview cards in routing components (like Next.js <Link>) when their primary purpose is to act as gateways to deeper content pages.

## 2026-04-08 - Empty State Visual Polish
**Learning:** Relying on plain text and dashed borders for empty states, especially for complex components like charts, feels unfinished and unintuitive. Adding a descriptive decorative icon and subtle background styling creates a more polished, intentional layout that guides the user.
**Action:** When designing empty states for data visualizations or dynamic result areas, enhance plain text with a descriptive decorative icon (e.g., from lucide-react) and subtle background styling to create a polished, intentional layout.
## 2026-04-09 - Never suppress focus rings on read-only inputs
**Learning:** Suppressing focus rings (using `focus-visible:ring-0`) on `readOnly` inputs prevents keyboard users from knowing which input they are focused on. While disabled inputs skip focus entirely, read-only inputs intentionally accept focus so users can copy their values.
**Action:** When using read-only inputs (e.g., `readOnly={true}`), never suppress the focus ring. Read-only inputs must remain focusable for keyboard users to navigate and copy text, and removing the focus indicator violates WCAG accessibility guidelines.

## 2026-04-10 - Enhance Empty States with Descriptive Icons
**Learning:** Plain text empty states can feel unpolished and lack intentionality. Users benefit from visual cues that indicate an area is reserved for future content.
**Action:** Enhance plain text empty states with a descriptive decorative icon (e.g., from lucide-react) and subtle background styling (e.g., `bg-muted/10`, `border-dashed`) to create a polished, intentional layout.

## 2026-04-12 - Accessible Legend Layouts
**Learning:** When adding layout elements (like a "Copy" button) next to a `<legend>`, wrapping the `<legend>` inside a `<div className="flex...">` container invalidates the HTML. According to specifications, a `<legend>` must be the **direct first child** of a `<fieldset>` for screen readers to properly associate the group name with the inputs.
**Action:** When styling `<fieldset>` and `<legend>` elements (e.g., using Tailwind flexbox for alignment), ensure the `<legend>` remains the direct first child. Apply the layout utility classes directly to the `<legend>` (e.g., `<legend className="w-full flex justify-between items-center...">`) and wrap its text content in a `<span>` if necessary.
## 2026-04-15 - External Link Indicators
**Learning:** Links that open in a new tab (`target="_blank"`) without visual or semantic indicators can be disorienting for users, especially those using screen readers, as they may unexpectedly lose their context or back-button history.
**Action:** When creating external links, always provide both visual and semantic cues by including an external link icon (e.g., `ExternalLink` from `lucide-react`) with `aria-hidden="true"` and a screen-reader-only `<span>` containing text like '(opens in a new tab)'.

## 2026-04-16 - Visual and Semantic Active Navigation Links
**Learning:** Navigation links without active states make it difficult for users to determine their current location within an application. Relying solely on visual changes (like bold text or color changes) is insufficient for screen reader users.
**Action:** Always provide both visual (e.g., `font-bold text-foreground`) and semantic (e.g., `aria-current="page"`) active states on navigation links corresponding to the current route. In Next.js App Router, this can be achieved using a Client Component with the `usePathname` hook.
