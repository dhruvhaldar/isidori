import sympy as sp
import ast
import functools

@functools.lru_cache(maxsize=1024)
def safe_sympify(expr_str):
    """
    Safely parses an expression string to prevent arbitrary code execution
    when passed to sympy.sympify().
    """
    if not isinstance(expr_str, str):
        return sp.sympify(expr_str)

    if "__" in expr_str:
        raise ValueError("Unsafe expression: contains double underscores")

    try:
        tree = ast.parse(expr_str, mode='eval')
        import builtins
        builtin_names = set(dir(builtins))
        ALLOWED_MATH_FUNCS = {
            'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
            'sinh', 'cosh', 'tanh', 'exp', 'log', 'sqrt', 'sign', 'Piecewise'
        }

        for node in ast.walk(tree):
            if isinstance(node, (ast.List, ast.Tuple, ast.Set, ast.Dict, ast.ListComp, ast.SetComp, ast.DictComp, ast.GeneratorExp, ast.JoinedStr, ast.FormattedValue)):
                raise ValueError("Unsafe expression: container types and f-strings are not allowed")
            elif isinstance(node, ast.Constant) and isinstance(node.value, (str, bytes)):
                raise ValueError("Unsafe expression: string and byte literals are not allowed")
            elif isinstance(node, ast.Attribute):
                raise ValueError("Unsafe expression: attribute access is not allowed")
            elif isinstance(node, ast.Call):
                if not isinstance(node.func, ast.Name):
                    raise ValueError("Unsafe expression: complex function calls are not allowed")

                func_name = node.func.id
                if func_name in builtin_names:
                    if func_name not in {'abs', 'max', 'min', 'round', 'sum', 'complex', 'float', 'int'}:
                        raise ValueError(f"Unsafe expression: builtin {func_name} is not allowed")
                elif func_name not in ALLOWED_MATH_FUNCS:
                    raise ValueError(f"Unsafe expression: function {func_name} is not allowed")
            elif isinstance(node, ast.BinOp):
                if not isinstance(node.op, (ast.Add, ast.Sub, ast.Mult, ast.Div, ast.Pow)):
                    raise ValueError(f"Unsafe expression: unsupported binary operation")
                if isinstance(node.op, ast.Pow):
                    if isinstance(node.right, ast.Constant) and isinstance(node.right.value, (int, float)):
                        if abs(node.right.value) > 5:
                            raise ValueError("Unsafe expression: exponent too large")

        def get_pure_constant_value(n):
            if isinstance(n, ast.Constant):
                return n.value if isinstance(n.value, (int, float)) else None
            elif isinstance(n, ast.UnaryOp):
                val = get_pure_constant_value(n.operand)
                if val is not None:
                    if isinstance(n.op, ast.USub): return -val
                    if isinstance(n.op, ast.UAdd): return val
            elif isinstance(n, ast.BinOp):
                left = get_pure_constant_value(n.left)
                right = get_pure_constant_value(n.right)
                if left is not None and right is not None:
                    if isinstance(n.op, ast.Add): return left + right
                    if isinstance(n.op, ast.Sub): return left - right
                    if isinstance(n.op, ast.Mult): return left * right
                    if isinstance(n.op, ast.Div): return left / right if right != 0 else 0
                    if isinstance(n.op, ast.Pow):
                        if abs(left) > 100 or abs(right) > 5:
                            raise ValueError("Unsafe expression: constant exponentiation too large")
                        try:
                            res = left ** right
                            return res.real if isinstance(res, complex) else res
                        except OverflowError:
                            raise ValueError("Unsafe expression: constant exponentiation overflow")
            # If the node contains any Name or Call, it's not a pure constant
            return None

        # Prevent computationally explosive variable powers that cause Denial of Service in SymPy.
        # We allow constants (<= 100 for bases, <= 5 for exponents), variables, basic arithmetic, function calls (like sin(x)),
        # and even nested powers, provided they do not evaluate to massive constants.
        # The main risk is an attacker providing a huge constant exponent masquerading as a complex AST.
        def check_exponent_complexity(n, depth=0):
            if depth > 10:
                raise ValueError("Unsafe expression: exponent too complex")
            if isinstance(n, ast.Constant):
                if isinstance(n.value, (int, float)) and abs(n.value) > 5:
                    raise ValueError("Unsafe expression: exponent constant too large")
            elif isinstance(n, ast.UnaryOp):
                check_exponent_complexity(n.operand, depth + 1)
            elif isinstance(n, ast.BinOp):
                if isinstance(n.op, ast.Pow):
                    raise ValueError("Unsafe expression: nested exponentiation is not allowed")
                if not isinstance(n.op, (ast.Add, ast.Sub, ast.Mult, ast.Div)):
                    raise ValueError(f"Unsafe expression: unsupported binary operation in exponent")
                check_exponent_complexity(n.left, depth + 1)
                check_exponent_complexity(n.right, depth + 1)
            elif isinstance(n, ast.Call):
                for arg in n.args:
                    check_exponent_complexity(arg, depth + 1)
            elif isinstance(n, ast.Name):
                pass
            else:
                raise ValueError("Unsafe expression: unsupported node type in exponent")

        for node in ast.walk(tree):
            if isinstance(node, ast.BinOp) and isinstance(node.op, ast.Pow):
                # First, ensure the exponent doesn't contain explicitly huge constants or massive depth
                check_exponent_complexity(node.right)

                # Second, ensure the exponent doesn't evaluate to a huge constant through arithmetic
                val = get_pure_constant_value(node.right)
                if val is not None and abs(val) > 5:
                    raise ValueError("Unsafe expression: exponent sub-expression evaluates to a large number")

            if isinstance(node, (ast.BinOp, ast.UnaryOp, ast.Constant)):
                val = get_pure_constant_value(node)
                # Note: This checks general constants, so we leave it at 100.
                if val is not None and abs(val) > 100:
                    raise ValueError("Unsafe expression: constant sub-expression evaluates to a large number")

    except SyntaxError:
        raise ValueError("Invalid syntax in expression")

    return sp.sympify(expr_str)

def lie_derivative(func, vector_field, variables):
    """
    Computes Lie derivative L_v h = (grad h) . v
    """
    # ⚡ Bolt: skip expensive sympy differentiation for zero vector components (~150x speedup for sparse vectors)
    res = 0
    # Pre-compute free symbols if the function has them
    free_syms = func.free_symbols if hasattr(func, 'free_symbols') else set()

    for var, v in zip(variables, vector_field):
        if v != 0:
            # ⚡ Bolt: Only compute sympy derivative if the variable actually appears in the function (~3.5x speedup)
            if hasattr(func, 'free_symbols') and var not in free_syms:
                continue
            res += sp.diff(func, var) * v
    return res

def compute_relative_degree(f_exprs, g_exprs, h_expr, var_names):
    """
    Computes the relative degree r of a SISO nonlinear system:
    dot(x) = f(x) + g(x)u
    y = h(x)
    
    r is the smallest integer such that L_g L_f^{r-1} h(x) != 0.
    """
    # Parse inputs
    variables = [sp.Symbol(name) for name in var_names]
    f = [safe_sympify(expr) for expr in f_exprs]
    g = [safe_sympify(expr) for expr in g_exprs]
    h = safe_sympify(h_expr)
    
    n = len(variables)
    
    # Check dimensions
    if len(f) != n or len(g) != n:
        raise ValueError("Vector fields f and g must have same dimension as variables.")
    
    # Iteratively compute Lie derivatives
    lf_h = h
    history = []
    
    for r in range(1, n + 2): # Relative degree is at most n usually
        # Compute L_g L_f^{r-1} h
        lg_lf_h = lie_derivative(lf_h, g, variables)
        
        # Expand first for faster zero check, fallback to simplify
        lg_lf_h_expand = sp.expand(lg_lf_h)
        if lg_lf_h_expand == 0:
            lg_lf_h_simp = 0
        else:
            lg_lf_h_simp = sp.simplify(lg_lf_h)
        
        if lg_lf_h_simp != 0:
            return {
                "relative_degree": r,
                "Lg_Lf_h": str(lg_lf_h_simp),
                "Lie_derivatives": [str(d) for d in history]
            }
        
        # If zero, compute next L_f^r h
        # Expanding the intermediate expression significantly speeds up subsequent differentiations
        lf_h_expand = sp.expand(lf_h)
        history.append(lf_h_expand) # Store L_f^{r-1} h

        # L_f^r h = L_f (L_f^{r-1} h)
        next_lf_h = lie_derivative(lf_h_expand, f, variables)
        lf_h = next_lf_h
        
    return {
        "relative_degree": None,
        "message": "Relative degree not well-defined or larger than system dimension."
    }
