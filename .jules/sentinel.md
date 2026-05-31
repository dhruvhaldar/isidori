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
