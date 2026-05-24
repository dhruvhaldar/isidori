## 2024-05-31 - [Recursive AST Function Call Bypass]
**Vulnerability:** SymPy polynomial inflation DoS bypass via `ast.Call` wrapping.
**Learning:** Returning a hardcoded degree for `ast.Call` nodes during AST validation allows attackers to bypass recursive degree checks by placing computationally expensive payloads inside function arguments (e.g., `sin(((x**10)**10)**10)`).
**Prevention:** When validating Python AST mathematical expressions recursively, always iterate over and evaluate the arguments (`n.args`) of `ast.Call` nodes to correctly determine the maximum mathematical degree.

## 2024-05-31 - [Unhandled ZeroDivisionError in AST Validation]
**Vulnerability:** Masking ZeroDivisionError during AST mathematical validation (by returning 0 instead of propagating the error) allows attackers to bypass complexity checks for malicious payloads like `x**(1/0)`.
**Learning:** Returning default values (like `0`) for mathematical errors hides the true state of the expression from validators, leading to Application-Layer DoS vulnerabilities if unchecked components reach SymPy.
**Prevention:** When manually evaluating Python AST nodes (e.g. `ast.Div` or `ast.Pow`) before passing them to SymPy, explicitly handle ZeroDivisionError (e.g. from `1/0` or `0**-1`) by throwing a validation error, instead of returning dummy constant values.
