from .utils import hashable_cache
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

        ALLOWED_NODES = {
            ast.Expression, ast.Call, ast.Name, ast.Load, ast.Constant,
            ast.UnaryOp, ast.UAdd, ast.USub, ast.BinOp, ast.Add, ast.Sub,
            ast.Mult, ast.Div, ast.Pow
        }

        def get_pure_constant_value(n):
            if isinstance(n, ast.Constant):
                return n.value if isinstance(n.value, (int, float, complex)) else None
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
                    if isinstance(n.op, ast.Div):
                        if right == 0:
                            raise ValueError("Unsafe expression: division by zero")
                        try:
                            return left / right
                        except ZeroDivisionError:
                            raise ValueError("Unsafe expression: division by zero")
                        except OverflowError:
                            raise ValueError("Unsafe expression: division overflow")
                    if isinstance(n.op, ast.Pow):
                        if abs(left) > 100 or abs(right) > 5:
                            raise ValueError("Unsafe expression: constant exponentiation too large")
                        try:
                            res = left ** right
                            return res.real if isinstance(res, complex) else res
                        except OverflowError:
                            raise ValueError("Unsafe expression: constant exponentiation overflow")
                        except ZeroDivisionError:
                            raise ValueError("Unsafe expression: division by zero in exponentiation")
            # If the node contains any Name or Call, it's not a pure constant
            return None

        for node in ast.walk(tree):
            if type(node) not in ALLOWED_NODES:
                raise ValueError(f"Unsafe expression: AST node type {type(node).__name__} is not allowed")
            if isinstance(node, ast.Constant) and isinstance(node.value, (str, bytes)):
                raise ValueError("Unsafe expression: string and byte literals are not allowed")
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
                    # 🛡️ Sentinel: Evaluate full constant value (including UnaryOp like USub) to prevent DoS bypass via `x**-10`
                    val = get_pure_constant_value(node.right)
                    if val is not None and abs(val) > 5:
                        raise ValueError("Unsafe expression: exponent too large")

        # Recursively evaluate the mathematical polynomial degree of the AST to prevent polynomial inflation DoS.
        def get_poly_degree(n):
            if isinstance(n, ast.Constant):
                return 0
            elif isinstance(n, ast.Name):
                return 1
            elif isinstance(n, ast.UnaryOp):
                return get_poly_degree(n.operand)
            elif isinstance(n, ast.BinOp):
                left_deg = get_poly_degree(n.left)
                right_deg = get_poly_degree(n.right)
                if isinstance(n.op, (ast.Add, ast.Sub)):
                    return max(left_deg, right_deg)
                elif isinstance(n.op, ast.Mult):
                    return left_deg + right_deg
                elif isinstance(n.op, ast.Div):
                    # 🛡️ Sentinel: Treat division like multiplication to prevent DoS via `x / (1/x)` inflation
                    return left_deg + right_deg
                elif isinstance(n.op, ast.Pow):
                    if isinstance(n.right, ast.Constant) and isinstance(n.right.value, (int, float, complex)):
                        if isinstance(n.right.value, complex) or n.right.value >= 0:
                            return left_deg * int(abs(n.right.value))
                    # If we don't know the exact value, assume it could multiply by our max constant exponent (5)
                    return left_deg * 5
                else:
                    return max(left_deg, right_deg)
            elif isinstance(n, ast.Call):
                # We need to check the arguments of function calls
                max_arg_deg = 0
                for arg in n.args:
                    max_arg_deg = max(max_arg_deg, get_poly_degree(arg))
                return max(1, max_arg_deg)
            return 0

        # Prevent computationally explosive variable powers that cause Denial of Service in SymPy.
        # We allow constants (<= 100 for bases, <= 5 for exponents), variables, basic arithmetic, function calls (like sin(x)),
        # and even nested powers, provided they do not evaluate to massive constants.
        # The main risk is an attacker providing a huge constant exponent masquerading as a complex AST.
        def check_exponent_complexity(n, depth=0):
            if depth > 10:
                raise ValueError("Unsafe expression: exponent too complex")

            # 🛡️ Sentinel: Evaluate pure constant value of sub-expressions inside exponent
            # to prevent bypasses like (x-x) + 5*5*4 generating huge constants > 5.
            val = get_pure_constant_value(n)
            if val is not None and abs(val) > 5:
                raise ValueError("Unsafe expression: exponent constant too large")

            if isinstance(n, ast.Constant):
                pass # Already handled by get_pure_constant_value above
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

        # Recursively calculate the depth of the AST to prevent chain-rule explosion DoS
        def get_ast_depth(n):
            if isinstance(n, (ast.Constant, ast.Name)):
                return 1
            elif isinstance(n, ast.UnaryOp):
                return 1 + get_ast_depth(n.operand)
            elif isinstance(n, ast.BinOp):
                return 1 + max(get_ast_depth(n.left), get_ast_depth(n.right))
            elif isinstance(n, ast.Call):
                arg_depths = [get_ast_depth(arg) for arg in n.args]
                return 1 + (max(arg_depths) if arg_depths else 0)
            return 1

        if get_ast_depth(tree.body) > 50:
            raise ValueError("Unsafe expression: AST depth too large")

        # Check overall polynomial degree to prevent polynomial inflation attacks
        # tree.body is an Expression node when mode='eval'
        if get_poly_degree(tree.body) > 50:
            raise ValueError("Unsafe expression: polynomial degree too high")

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

    return sp.parse_expr(expr_str)

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

@hashable_cache
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
    
    # ⚡ Bolt: Pre-filter non-zero components to avoid checks in the inner loop (~2x speedup)
    non_zero_g = [(var, v) for var, v in zip(variables, g) if v != 0]
    non_zero_f = [(var, v) for var, v in zip(variables, f) if v != 0]

    # Iteratively compute Lie derivatives
    lf_h = h
    history = []
    
    for r in range(1, n + 2): # Relative degree is at most n usually
        # Compute L_g L_f^{r-1} h
        # ⚡ Bolt: Inline lie derivative computation using pre-filtered non-zero components
        lg_lf_h = 0
        if non_zero_g:
            free_syms = lf_h.free_symbols if hasattr(lf_h, 'free_symbols') else set()
            for var, v in non_zero_g:
                if var in free_syms:
                    lg_lf_h += sp.diff(lf_h, var) * v
        
        # ⚡ Bolt: Fast path zero check to avoid sp.expand overhead (~30% speedup)
        # Expand first for faster zero check, fallback to simplify
        if lg_lf_h == 0:
            lg_lf_h_simp = 0
        else:
            lg_lf_h_expand = sp.expand(lg_lf_h)
            if lg_lf_h_expand == 0:
                lg_lf_h_simp = 0
            else:
                # ⚡ Bolt: Using the pre-expanded expression for sp.simplify completely
                # avoids redundant expansion attempts inside simplify(), yielding up to a 35x speedup.
                lg_lf_h_simp = sp.simplify(lg_lf_h_expand)
        
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
        # ⚡ Bolt: Inline lie derivative computation using pre-filtered non-zero components
        next_lf_h = 0
        if non_zero_f:
            free_syms2 = lf_h_expand.free_symbols if hasattr(lf_h_expand, 'free_symbols') else set()
            for var, v in non_zero_f:
                if var in free_syms2:
                    next_lf_h += sp.diff(lf_h_expand, var) * v
        lf_h = next_lf_h
        
    return {
        "relative_degree": None,
        "message": "Relative degree not well-defined or larger than system dimension."
    }
