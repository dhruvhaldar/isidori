## 2024-05-31 - [Recursive AST Function Call Bypass]
**Vulnerability:** SymPy polynomial inflation DoS bypass via `ast.Call` wrapping.
**Learning:** Returning a hardcoded degree for `ast.Call` nodes during AST validation allows attackers to bypass recursive degree checks by placing computationally expensive payloads inside function arguments (e.g., `sin(((x**10)**10)**10)`).
**Prevention:** When validating Python AST mathematical expressions recursively, always iterate over and evaluate the arguments (`n.args`) of `ast.Call` nodes to correctly determine the maximum mathematical degree.

## 2024-05-31 - [Unhandled ZeroDivisionError in AST Validation]
**Vulnerability:** Masking ZeroDivisionError during AST mathematical validation (by returning 0 instead of propagating the error) allows attackers to bypass complexity checks for malicious payloads like `x**(1/0)`.
**Learning:** Returning default values (like `0`) for mathematical errors hides the true state of the expression from validators, leading to Application-Layer DoS vulnerabilities if unchecked components reach SymPy.
**Prevention:** When manually evaluating Python AST nodes (e.g. `ast.Div` or `ast.Pow`) before passing them to SymPy, explicitly handle ZeroDivisionError (e.g. from `1/0` or `0**-1`) by throwing a validation error, instead of returning dummy constant values.
## 2024-06-03 - [SymPy UnaryOp DoS Bypass]
**Vulnerability:** Application-Layer DoS via `ast.Pow` exponent validation bypass.
**Learning:** When validating Python AST `ast.Pow` exponents to prevent polynomial inflation DoS, checking the magnitude of `ast.Constant` nodes directly is insufficient. Negative values (e.g., `-10`) or simple arithmetic parse as `ast.UnaryOp` or `ast.BinOp`. This allows attackers to bypass size limits.
**Prevention:** Always recursively evaluate the true mathematical value of the right-hand node (the exponent) before applying size limits, rather than directly checking if the node is an `ast.Constant`.

## 2024-06-03 - [Spoofable X-Forwarded-For Rate Limiting]
**Vulnerability:** Rate limit bypass and Denial of Service.
**Learning:** When implementing IP-based rate limiting behind a reverse proxy, blindly trusting the `X-Forwarded-For` header to determine the client IP allows attackers to trivially spoof their IP to bypass limits or cause DoS for other users.
**Prevention:** Only extract the IP from `X-Forwarded-For` if the request is cryptographically verified or network-verified to come from a trusted proxy server. Otherwise, fall back to `request.client.host` or use established proxy middleware that handles trusted IP lists.

## 2024-06-06 - [SymPy Complex Number DoS Bypass]
**Vulnerability:** Application-Layer DoS via `ast.Pow` exponent validation bypass using complex numbers.
**Learning:** When validating Python AST `ast.Constant` nodes to prevent Application-Layer DoS (e.g., limiting exponent magnitudes for SymPy), explicitly include `complex` in the type checks alongside `int` and `float`. Omitting `complex` allows attackers to bypass magnitude bounds using complex arithmetic (e.g., `10j * 10j` evaluating to `-100`). Additionally, Python's `complex` type does not support ordering operators (like `>=`), so attempting direct numeric comparisons will raise a `TypeError`.
**Prevention:** Always explicitly include `complex` in type checks when validating mathematical constants. When validating the magnitude of nodes that may contain `complex` numbers, use `abs(value)` rather than relational operators (e.g., `>=`).

## 2024-06-07 - Rate Limiting Reverse Proxy DoS
**Vulnerability:** IP-based rate limiting blocked all users simultaneously behind a reverse proxy.
**Learning:** `request.client.host` returned the proxy's IP instead of the actual user's IP. Blindly trusting `X-Forwarded-For` without validating trusted proxies could allow attackers to spoof IPs and bypass rate limits.
**Prevention:** Validate that the direct connection `request.client.host` comes from a trusted proxy before extracting the client IP from `X-Forwarded-For`, picking the rightmost untrusted IP to prevent spoofing.
## 2024-06-08 - [SymPy Division DoS Bypass]
**Vulnerability:** Application-Layer DoS via `ast.Div` polynomial inflation bypass.
**Learning:** When recursively calculating the polynomial degree of a Python AST to prevent Application-Layer DoS (e.g., SymPy polynomial inflation), returning only the left operand's degree for `ast.Div` operations is insufficient. Attackers can bypass polynomial expansion size limits by sending chained division-by-fraction payloads (e.g., `x / (1/x)` evaluates to `x^2`, but the previous checker incorrectly measured it as degree 1). If submitted multiple times, this causes exponential inflation during `sympy.expand()`.
**Prevention:** Explicitly handle `ast.Div` by adding the algebraic degree bounds of both operands (`left_deg + right_deg`), ensuring the check provides a safe mathematical upper bound against division-based polynomial inflation.
## 2024-06-03 - [Rate Limiting Memory Leak]
**Vulnerability:** The custom in-memory rate limiting middleware previously only cleaned up expired request timestamps for the IP address making the *current* request. This caused a memory leak over time, as expired timestamps and dictionary keys for IPs that no longer made requests were never purged.
**Learning:** In-memory rate limiting dictionary mechanisms that map IPs to request histories must proactively perform cleanup across all stored clients, not just the active requester, to prevent the structure from growing indefinitely and eventually causing an Out-Of-Memory (OOM) Denial-of-Service condition.
**Prevention:** Iterate through all stored IPs periodically (or on every request) to purge expired timestamps, and explicitly delete keys from the dictionary when their associated lists become empty (e.g., `del self.clients[client_ip]`).

## 2026-06-10 - Fix Missing CORS/Security Headers on 429 Responses
**Vulnerability:** Fast API `add_middleware` registers middleware in reverse order. `RateLimitMiddleware` was registered last, making it the outermost wrapper. Its early 429 responses bypassed `CORSMiddleware` and `SecurityHeadersMiddleware`.
**Learning:** Middlewares handling auth/rate-limiting must execute *inside* security and CORS middlewares so their short-circuit responses receive crucial security headers.
**Prevention:** Register application-level early-exit middleware (like Rate Limiting) *before* `CORSMiddleware` and `SecurityHeadersMiddleware` via `app.add_middleware()`.
## 2025-06-19 - [CRITICAL] Prevent Application-Layer DoS via AST Traversal Bypass
**Vulnerability:** Attackers could bypass the SymPy polynomial degree limits (Application-Layer DoS) by dynamically computing large constants inside exponents paired with variables (e.g., `(y+1)**((x-x) + 5*5*4)`).
**Learning:** Because `(x-x)` contains a variable, `get_pure_constant_value` returns `None` at the top level of the exponent, falling back to a hardcoded low degree multiplier in `get_poly_degree`. However, SymPy easily simplifies `(x-x) + 100` to `100` and then executes the massive polynomial expansion, leading to CPU exhaustion. The AST size checker missed the `100` because it only checked `ast.Constant` nodes directly inside exponents, missing mathematically evaluated sub-trees.
**Prevention:** When recursively validating Python AST exponents, always evaluate the true mathematical value of *every sub-node* inside the exponent using a bottom-up evaluator (`get_pure_constant_value`), enforcing the strict constant limit (`<= 5`) on all calculable intermediate values.

## 2024-07-11 - Prevent Application-Layer DoS via Deeply Nested AST
**Vulnerability:** SymPy expressions with deep nesting (e.g., `sin(sin(...(x)...))`) caused exorbitant execution times in `sp.diff` and `sp.expand`, leading to a Denial of Service (DoS) vulnerability in the backend, because existing checks only validated polynomial degrees.
**Learning:** AST evaluation must protect against depth-based complexity, as deep nesting bypasses degree checks (e.g., function arguments default to degree 1).
**Prevention:** Implement a recursive AST depth check before evaluation and reject any AST that exceeds a safe depth limit (e.g., 50).
