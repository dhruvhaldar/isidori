## 2025-03-01 - Matrix Grouping with Fieldset
**Learning:** Using `div` and `Label` for complex input matrices causes screen readers to read individual inputs without context. Wrapping the entire matrix in a `<fieldset>` and using a `<legend>` significantly improves accessibility by grouping the inputs semantically and providing immediate context when users focus on any input within the matrix.
**Action:** Always wrap groups of closely related inputs (like multi-dimensional matrices or coordinate inputs) in a `<fieldset>` with a `<legend>` instead of generic `div` and `Label` components.

## 2024-05-24 - Missing Async Loading States
**Learning:** This app heavily relies on complex math computations executed asynchronously via API endpoints (V* computation, DDP checking, simulation), but previously lacked loading state feedback or `aria-busy` indicators. This causes severe accessibility/UX issues since screen readers and typical users cannot determine if an action is processing or failed silently.
**Action:** When adding new analytical or computation-heavy features to this app, ensure `isLoading` or specific computation states are implemented to visually (disabled button, text change) and programmatically (`aria-busy`) denote the pending operation.
