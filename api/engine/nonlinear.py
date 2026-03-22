import sympy as sp

def lie_derivative(func, vector_field, variables):
    """
    Computes Lie derivative L_v h = (grad h) . v
    """
    grad = [sp.diff(func, var) for var in variables]
    return sum(g * v for g, v in zip(grad, vector_field))

def compute_relative_degree(f_exprs, g_exprs, h_expr, var_names):
    """
    Computes the relative degree r of a SISO nonlinear system:
    dot(x) = f(x) + g(x)u
    y = h(x)
    
    r is the smallest integer such that L_g L_f^{r-1} h(x) != 0.
    """
    # Parse inputs
    variables = [sp.Symbol(name) for name in var_names]
    f = [sp.sympify(expr) for expr in f_exprs]
    g = [sp.sympify(expr) for expr in g_exprs]
    h = sp.sympify(h_expr)
    
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
