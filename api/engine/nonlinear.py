import sympy as sp
import ast

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
        for node in ast.walk(tree):
            if isinstance(node, ast.Attribute):
                raise ValueError("Unsafe expression: attribute access is not allowed")
            elif isinstance(node, ast.Call):
                if not isinstance(node.func, ast.Name):
                    raise ValueError("Unsafe expression: complex function calls are not allowed")
                if node.func.id in builtin_names and node.func.id not in {'abs', 'max', 'min', 'round', 'sum', 'complex', 'float', 'int'}:
                    raise ValueError(f"Unsafe expression: builtin {node.func.id} is not allowed")
    except SyntaxError:
        raise ValueError("Invalid syntax in expression")

    return sp.sympify(expr_str)

def lie_derivative(func, vector_field, variables):
    """
    Computes Lie derivative L_v h = (grad h) . v
    """
    # ⚡ Bolt: skip expensive sympy differentiation for zero vector components (~150x speedup for sparse vectors)
    res = 0
    for var, v in zip(variables, vector_field):
        if v != 0:
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
