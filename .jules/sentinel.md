## 2024-05-31 - [Recursive AST Function Call Bypass]
**Vulnerability:** SymPy polynomial inflation DoS bypass via `ast.Call` wrapping.
**Learning:** Returning a hardcoded degree for `ast.Call` nodes during AST validation allows attackers to bypass recursive degree checks by placing computationally expensive payloads inside function arguments (e.g., `sin(((x**10)**10)**10)`).
**Prevention:** When validating Python AST mathematical expressions recursively, always iterate over and evaluate the arguments (`n.args`) of `ast.Call` nodes to correctly determine the maximum mathematical degree.
