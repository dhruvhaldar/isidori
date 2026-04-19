import pytest
import numpy as np
import sys
import os

# Add api to path
sys.path.append(os.path.join(os.path.dirname(__file__), '../../api'))

from engine.linear import compute_v_star, check_disturbance_decoupling
from engine.nonlinear import compute_relative_degree

def test_compute_v_star_trivial():
    # A = I, B = 0, C = 0 (zero rows, n columns)
    # Actually C needs to be matrix.
    # Let n=2. C = [[0, 0]]. Ker(C) = R^2.
    # V* should be R^2 (identity matrix basis).
    
    A = np.eye(2)
    B = np.zeros((2, 1))
    C = np.zeros((1, 2))
    
    V_star = compute_v_star(A, B, C)
    
    # V_star should have rank 2
    assert V_star.shape[1] == 2

def test_compute_v_star_integrator_chain():
    # y = x1, x1_dot = x2, x2_dot = u
    # A = [[0, 1], [0, 0]]
    # B = [[0], [1]]
    # C = [[1, 0]]
    # Relative degree 2. V* should be {0}.
    
    A = np.array([[0, 1], [0, 0]])
    B = np.array([[0], [1]])
    C = np.array([[1, 0]])
    
    V_star = compute_v_star(A, B, C)
    
    # V_star should be empty or zero columns
    assert V_star.shape[1] == 0

def test_check_ddp_solvable():
    # Example from simulation script
    A = np.array([[0, 1], [2, 0]])
    B = np.array([[0], [1]])
    C = np.array([[1, -1]])
    E = np.array([[1], [1]])
    
    is_solvable, V_star, F = check_disturbance_decoupling(A, B, E, C)
    
    assert is_solvable
    assert V_star.shape[1] >= 1
    # Check if F makes (A+BF)V* subset V*
    # We can check A_cl @ V_star lies in V_star
    
    A_cl = A + B @ F
    # Project columns of A_cl @ V_star onto orthogonal complement of V_star
    # Or check rank([V_star, A_cl @ V_star]) == rank(V_star)
    
    combined = np.hstack([V_star, A_cl @ V_star])
    # rank of combined should be rank of V_star
    # Using simplistic rank check:
    u, s, vh = np.linalg.svd(combined)
    rank_comb = np.sum(s > 1e-10)
    
    u_v, s_v, vh_v = np.linalg.svd(V_star)
    rank_v = np.sum(s_v > 1e-10)
    
    assert rank_comb == rank_v

def test_check_ddp_unsolvable():
    # Same system but E not in V*
    # V* is span{(1, 1)}. E = [1, 0].
    
    A = np.array([[0, 1], [2, 0]])
    B = np.array([[0], [1]])
    C = np.array([[1, -1]])
    E = np.array([[1], [0]])
    
    is_solvable, V_star, F = check_disturbance_decoupling(A, B, E, C)
    
    assert not is_solvable

def test_relative_degree_simple():
    # dot(x1) = x2
    # dot(x2) = u
    # y = x1
    # f = [x2, 0], g = [0, 1], h = x1
    
    f = ["x2", "0"]
    g = ["0", "1"]
    h = "x1"
    vars = ["x1", "x2"]
    
    res = compute_relative_degree(f, g, h, vars)
    
    assert res["relative_degree"] == 2
    assert "1" in str(res["Lg_Lf_h"]) or res["Lg_Lf_h"] == "1"

def test_relative_degree_undefined():
    # dot(x) = x + u
    # y = x^2 (if relative degree is defined)
    # Lg h = 2x. If x!=0, rel deg 1.
    # But if Lg h is identically zero?
    # Example: dot(x1)=x2, dot(x2)=x2, y=x1. g=[0, 0].
    # Lg h = 0. Lg Lf h = 0...
    
    f = ["x2", "x2"]
    g = ["0", "0"]
    h = "x1"
    vars = ["x1", "x2"]
    
    res = compute_relative_degree(f, g, h, vars)
    
    assert res["relative_degree"] is None

def test_relative_degree_large_variable_name():
    from pydantic import ValidationError
    from api.index import NonlinearSystemInput

    # Unbounded variable length should raise a validation error
    data = {"f": ["x"], "g": ["x"], "h": "x", "vars": ["x" * 100]}

    with pytest.raises(ValidationError) as exc_info:
        NonlinearSystemInput(**data)

    assert "Variable name exceeds maximum length" in str(exc_info.value)

def test_sympify_dos_protection():
    from api.engine.nonlinear import safe_sympify

    # Valid expressions should parse fine
    safe_sympify("x**(y*z)")
    safe_sympify("x**(y+z)")
    safe_sympify("x**int(5)")

    # Nested exponentiation should be rejected
    with pytest.raises(ValueError, match="Unsafe expression: nested exponentiation is not allowed"):
        safe_sympify("x**(y**z)")

    # Unsupported binary operations in exponents should be rejected
    with pytest.raises(ValueError, match="Unsafe expression: unsupported binary operation"):
        # We can simulate unsupported binary operations using python bitwise/shift operators
        # Sympy's safe_sympify uses python's ast to parse, and things like bitwise shifts are ast.LShift
        safe_sympify("x**(y<<z)")

    # Unsupported binary operations anywhere in the expression should be rejected
    with pytest.raises(ValueError, match="Unsafe expression: unsupported binary operation"):
        safe_sympify("x << y")

    # F-strings should be rejected
    with pytest.raises(ValueError, match="Unsafe expression: f-strings are not allowed"):
        safe_sympify("f'test'")
