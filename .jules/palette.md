## 2024-05-18 - Added "Required" labels to Nonlinear input fields
**Learning:** Required input fields without a clear visual indicator are inaccessible to users with cognitive disabilities, and confusing to all users. Screen readers announce "required" but sighted users need visual cues too.
**Action:** Always include a visual indicator like `*` (with `aria-hidden="true"`) alongside an explicit `<span className="sr-only">(required)</span>` text within the `<Label>` when an input is required.
## 2024-05-18 - Added "Required" visual indicators to Linear and Simulate matrix dimension inputs
**Learning:** Required input fields without a clear visual indicator are inaccessible to users with cognitive disabilities, and confusing to all users. Screen readers announce "required" but sighted users need visual cues too.
**Action:** Always include a visual indicator like `*` (with `aria-hidden="true"`) alongside an explicit `<span className="sr-only">(required)</span>` text within the `<Label>` when an input is required.
## 2024-05-18 - Added aria-invalid and aria-describedby to forms with server errors
**Learning:** Server-returned form errors displayed in a banner are visually clear, but assistive tech users navigating inputs won't know the inputs caused an error without `aria-invalid` and a programmatic link via `aria-describedby`.
**Action:** Always bind error state banners to the associated form controls or fieldsets using `aria-invalid` and `aria-describedby`.
