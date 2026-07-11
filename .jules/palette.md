## 2024-05-18 - Added "Required" labels to Nonlinear input fields
**Learning:** Required input fields without a clear visual indicator are inaccessible to users with cognitive disabilities, and confusing to all users. Screen readers announce "required" but sighted users need visual cues too.
**Action:** Always include a visual indicator like `*` (with `aria-hidden="true"`) alongside an explicit `<span className="sr-only">(required)</span>` text within the `<Label>` when an input is required.
## 2024-05-18 - Added "Required" visual indicators to Linear and Simulate matrix dimension inputs
**Learning:** Required input fields without a clear visual indicator are inaccessible to users with cognitive disabilities, and confusing to all users. Screen readers announce "required" but sighted users need visual cues too.
**Action:** Always include a visual indicator like `*` (with `aria-hidden="true"`) alongside an explicit `<span className="sr-only">(required)</span>` text within the `<Label>` when an input is required.
## 2024-05-18 - Added aria-invalid and aria-describedby to forms with server errors
**Learning:** Server-returned form errors displayed in a banner are visually clear, but assistive tech users navigating inputs won't know the inputs caused an error without `aria-invalid` and a programmatic link via `aria-describedby`.
**Action:** Always bind error state banners to the associated form controls or fieldsets using `aria-invalid` and `aria-describedby`.
## 2026-07-07 - Added visual error styling for invalid form fields
**Learning:** Setting `aria-invalid="true"` announces the error to screen reader users, but without corresponding visual styles (e.g., red border), sighted users are left without immediate contextual feedback on the specific fields that failed validation, causing them to rely only on the general error banner.
**Action:** Always bind the `aria-invalid` attribute to explicit visual styles (e.g., `aria-[invalid=true]:border-destructive` and `group-aria-[invalid=true]:border-destructive`) to ensure parity between assistive technology and visual cues.
## 2024-05-18 - Added primary metrics to aria-live completion announcements
**Learning:** Screen reader users rely on `aria-live` announcements for asynchronous task completion. Stating only "Computation complete" forces users to manually navigate the DOM to find the result.
**Action:** When a computation or async task completes, always include the primary outcome or key metric directly in the `aria-live` announcement (e.g., "Computation complete. Relative degree is 2").

## 2024-05-18 - Ensuring Keyboard Visual Parity on interactive containers
**Learning:** Adding hover effects (like `group-hover:translate-x-1`) to internal elements of complex interactive components (like links disguised as cards) is great for mouse users, but leaves keyboard users without the same visual feedback when they focus the component.
**Action:** Always pair `group-hover` utility classes with their focus equivalents, like `group-focus-visible` (for buttons) or `group-focus-within` (for container cards with inner links), to ensure equal visual feedback for all interaction modes.
## 2026-07-11 - Fixed keyboard visual parity issue caused by responsive Tailwind classes overriding focus states
**Learning:** When using responsive utility classes (like `md:opacity-0`) to hide elements, they appear later in the generated CSS stylesheet and will override base pseudo-class variants (like `focus:opacity-100`). This causes interactive elements like buttons to remain invisible when keyboard users tab to them on larger screens, breaking accessibility.
**Action:** When hiding interactive elements on larger screens (e.g. `md:opacity-0`), always ensure you provide corresponding responsive focus variants (like `md:focus:opacity-100` or `md:group-focus-within:opacity-100`) to guarantee keyboard users receive the same visual feedback as mouse users hovering over the element.
