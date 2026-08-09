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
## 2024-05-18 - Ensure Keyboard Visual Parity on interactive containers
**Learning:** Adding hover effects (like `group-hover:opacity-100`) to internal elements of complex interactive components is great for mouse users, but leaves keyboard users without the same visual feedback when they focus the component.
**Action:** Always pair `group-hover` utility classes with their focus equivalents, like `group-focus-visible` (for buttons) or `group-focus-within` (for container cards or groups with inner buttons), to ensure equal visual feedback for all interaction modes.
## 2024-05-18 - Allow Global Form Shortcuts to Bypass Component Listeners
**Learning:** Intercepting all `Enter` key presses within custom grid components (like matrix inputs) prevents users from utilizing global form submission shortcuts (like `Cmd/Ctrl + Enter`) while focused on those inputs, disrupting power-user workflows.
**Action:** When implementing keyboard navigation inside custom components (e.g., using `Enter` to move down rows), explicitly check for modifier keys (`e.metaKey || e.ctrlKey`) and bypass `e.preventDefault()` to ensure global shortcuts can successfully bubble up to the parent form.

## 2024-05-18 - Avoid Shortcut Collisions with Nested Component Patterns
**Learning:** Assigning `Shift+Enter` to a secondary form action (like "Check DDP") conflicts with the standard interaction pattern of a nested spreadsheet/matrix grid, where `Shift+Enter` is expected to navigate 'up'. This prevents the user from triggering the form action while focused in the grid.
**Action:** When assigning keyboard shortcuts to form actions, avoid combinations that natively conflict with the expected behavior of inner components. Use alternative modifiers (like `Cmd/Ctrl + Shift + Enter`) to prevent collision and ensure reliable execution.
## 2026-07-07 - Added keyboard visual parity for the Clear matrix button
**Learning:** Adding hover effects (like `hover:text-destructive`) to secondary/ghost buttons is great for mouse users, but leaves keyboard users without the same visual feedback when they focus the component via tab navigation, leading to an inconsistent accessible experience.
**Action:** Always pair visual hover state classes (`hover:[state]`) with their corresponding focus equivalent (like `focus-visible:[state]`) to ensure keyboard users receive equal visual context for interactive elements.
## 2026-07-17 - Ensure Keyboard Visual Parity for Hover States
**Learning:** Relying solely on `hover:` utility classes for visual feedback (e.g., background color changes, text color changes, or underlines) leaves keyboard users without the same visual context when navigating via `Tab`. This inconsistency degrades the accessible experience and can make it difficult for keyboard users to track focus.
**Action:** Always pair visual `hover` state classes with their corresponding focus equivalent (e.g., `focus-within:bg-muted/50` for `hover:bg-muted/50` on container elements, `focus-visible:underline` for `hover:underline` on links, and `focus-visible:text-foreground/80` for `hover:text-foreground/80`) to ensure equal visual feedback for all interaction modes.
## 2026-07-18 - Ensure Keyboard Visual Parity for Hover States\n**Learning:** Relying solely on `hover:` utility classes for visual feedback (e.g., background color changes, text color changes, or underlines) leaves keyboard users without the same visual context when navigating via `Tab`. This inconsistency degrades the accessible experience and can make it difficult for keyboard users to track focus.\n**Action:** Always pair visual `hover` state classes with their corresponding focus equivalent (e.g., `focus-within:bg-muted/50` for `hover:bg-muted/50` on container elements, `focus-visible:underline` for `hover:underline` on links, and `focus-visible:text-foreground/80` for `hover:text-foreground/80`) to ensure equal visual feedback for all interaction modes.

## 2024-05-18 - Matrix Input Auto-Correction
**Learning:** When allowing flexible typing states in complex inputs (like "-" or "0." in matrix cells), users may leave the input blurred in an intermediate, invalid state. Without correction, this can cause NaN payloads or silent calculation failures.
**Action:** Always implement an `onBlur` handler that auto-corrects or resets invalid intermediate states to a safe default (like "0") and formats the input cleanly, preventing confusing errors while maintaining a smooth typing experience.
## 2024-05-18 - Added aria-describedby to Clickable Cards
**Learning:** When making entire complex UI cards clickable by wrapping only the main title text in a `<Link>` and expanding its clickable area with a pseudo-element (the 'Clickable Card' pattern), screen readers will only read the title text when the link is focused. This leaves assistive technology users without the context provided by the card's description or lists, forcing them to manually navigate the DOM to discover what the link does.
**Action:** Always add explicit `id` attributes to the supplementary content within a complex clickable card (like `<CardDescription>` and `<CardContent>`) and bind them to the main `<Link>` element using the `aria-describedby` attribute (e.g., `aria-describedby="desc-id list-id"`). This ensures complete context is announced for screen reader users when they focus the card link.
## 2024-05-18 - Dimension Input Auto-Correction
**Learning:** When allowing flexible typing in numeric dimension inputs (like matrix rows/cols), users may leave the input blurred in an empty state (`""`). If the component internally falls back to `1` without reflecting it visually, a disconnect occurs between the UI state (e.g. `1x1` matrix displayed) and the input field (shows blank).
**Action:** Always implement an `onBlur` handler on numeric dimension inputs to auto-correct blank or invalid values (`< 1`) to the safe default (like `1`). This prevents visual disconnects and ensures the UI truthfully reflects the internal state.
## 2024-08-03 - Accessible Scrollable Landmarks
**Learning:** When making semantic landmark elements (like `<nav>`) horizontally scrollable for keyboard users by wrapping them in a `role="group"` and `tabIndex={0}` container, placing the primary landmark label (e.g., `aria-label="Main navigation"`) on the outer group causes screen readers to double-announce or miscategorize the structure. The outer container acts as a generic grouping mechanism, not the navigation landmark itself.
**Action:** Always place the primary descriptive `aria-label` directly on the semantic landmark element (e.g., `<nav aria-label="Main navigation">`). Provide a distinct, supplementary label to the outer scrollable container (e.g., `aria-label="Scrollable navigation container"`) or leave it unlabelled if the context is obvious, ensuring clear semantic separation.
## 2024-08-05 - Visual Parity for group focus states
**Learning:** When trying to ensure equal visual feedback on cards/containers that have `group` and `hover:bg-muted` classes when their nested focusable elements receive focus, using `focus-within:bg-muted` will trigger if *any* inner element receives focus (including clicks). However, `has-[:focus-visible]` correctly matches only when the element is focused via keyboard, ensuring consistent behavior between hover and keyboard navigation without breaking mouse interactions.
**Action:** Use `has-[:focus-visible]` instead of `focus-within` for matching keyboard focus states in parent containers.
## 2024-05-18 - Prevent Empty State Layout Shifts on Error
**Learning:** When displaying an error message (like a banner) inside a card that also has an empty state placeholder (e.g., "Run computation to see results"), hiding the empty state when the error is present causes the card to collapse. This jarring layout shift negatively impacts the user experience.
**Action:** Always maintain the structural consistency of the UI by leaving the empty state placeholder visible when displaying error messages, unless the error explicitly invalidates the need for the placeholder.

## 2026-07-20 - Added Focus Ring to Skip Links
**Learning:** Implementing "skip to main content" links that transition from `sr-only` to `focus:not-sr-only` makes them visible, but without an explicit focus ring (e.g. `focus-visible:ring-2`), keyboard users may not instantly recognize it as the currently focused element, creating a disconnect with standard application focus styles.
**Action:** When implementing 'skip to main content' links, explicitly apply visual focus ring styles (e.g., `focus-visible:ring-2 focus-visible:ring-offset-2`) to ensure keyboard users see a clear, standard focus indicator when the link appears.

## 2026-07-20 - Added Visual Hint for Cancellation State
**Learning:** Destructive actions that transform into a confirmation state (like a 'Clear' button turning into 'Sure?') and support keyboard cancellation (like 'Escape') often hide this power-user feature from sighted keyboard and mouse users.
**Action:** Always provide a subtle visual hint (like a `<kbd>Esc</kbd>` badge) when an action enters a cancelable confirmation state, ensuring the interaction model is discoverable and accessible.
