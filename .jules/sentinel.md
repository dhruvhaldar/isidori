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
