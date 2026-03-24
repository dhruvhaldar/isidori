## $(date +%Y-%m-%d) - [CRITICAL] Remote Code Execution via Sympy
**Vulnerability:** Arbitrary code execution in `/api/nonlinear/reldeg` where user-provided expressions were passed directly to `sympy.sympify()`. Since `sympy.sympify` internally calls `eval()`, an attacker could pass malicious Python code like `eval('__import__("os").system(...)')` to compromise the server.
**Learning:** `sympy.sympify()` is fundamentally unsafe for untrusted input. The standard `parse_expr` even with restrictions can still be bypassed. A dedicated AST-based validator must be used to thoroughly inspect the expression tree before any evaluation.
**Prevention:** I implemented a `safe_sympify` wrapper that leverages Python's `ast.parse` to traverse the abstract syntax tree and explicitly block attributes (to prevent access to `os.system` or dunders) and strictly allowlist builtins like `abs` and `max`. Always wrap `sympy.sympify()` calls with an AST-validator when dealing with user input.

## 2024-05-24 - [HIGH] Overly Permissive CORS
**Vulnerability:** The FastAPI backend had CORS configured with `allow_origins=["*"]` while `allow_credentials=True`.
**Learning:** This combination allows any attacker website to make authenticated cross-origin requests by having the browser reflect the Origin header. Fastapi/Starlette explicitly forbids this in newer versions.
**Prevention:** Hardcode sensible defaults for development (e.g., localhost) and use environment variables (e.g., `CORS_ORIGINS`) to allow operators to securely define allowed origins in production. Never combine `*` with credentials.
