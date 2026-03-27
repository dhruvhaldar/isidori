import numpy as np
from .utils import basis, kernel, intersection, sum_spaces, inverse_image, rank

def compute_v_star(A, B, C, tol=1e-10):
    """
    Computes the maximal controlled invariant subspace V* contained in Ker(C).
    Algorithm:
    V_0 = Ker(C)
    V_{k+1} = V_k \cap A^{-1}(V_k + Im(B))
    """
    n = A.shape[0]
    
    # Im(B)
    ImB = basis(B, tol)
    
    # V_0 = Ker(C)
    V = kernel(C, tol)
    
    # Iteration
    for k in range(n + 1):
        # V_next = V \cap A^{-1}(V + ImB)
        
        # Step 1: V + ImB
        S = sum_spaces(V, ImB, tol)
        
        # Step 2: A^{-1}(S)
        PreS = inverse_image(A, S, tol)
        
        # Step 3: V \cap PreS
        V_next = intersection(V, PreS, tol)
        
        # Check convergence
        # If dimensions are same, we are done (since V_next is subset of V)
        if V_next.shape[1] == V.shape[1]:
            return V_next
            
        V = V_next
        
    return V

def check_disturbance_decoupling(A, B, E, C, tol=1e-10):
    """
    Checks if DDP (Disturbance Decoupling Problem) is solvable.
    Solvable iff Im(E) is subset of V*.
    """
    V_star = compute_v_star(A, B, C, tol)
    
    # Check if Im(E) \subset V*
    # This is true if rank([V_star E]) == rank(V_star)
    
    ImE = basis(E, tol)
    
    # If E is zero, it's always solvable
    if ImE.size == 0 or ImE.shape[1] == 0:
        return True, V_star, np.zeros((B.shape[1], A.shape[0])) # F is dummy

    # Check inclusion
    # Concatenate [V_star, ImE]
    combined = np.hstack([V_star, ImE])
    
    rank_V = rank(V_star, tol)
    rank_comb = rank(combined, tol)
    
    is_solvable = (rank_comb == rank_V)
    
    F = None
    if is_solvable:
        # Compute feedback F such that (A + BF)V* \subset V*
        F = compute_feedback_matrix(A, B, V_star, tol)
        
    return is_solvable, V_star, F

def compute_feedback_matrix(A, B, V_star, tol=1e-10):
    """
    Computes a feedback matrix F such that (A + BF)V* \subset V*.
    This is required for DDP synthesis.
    
    Condition: For every v \in V*, Av \in V* + Im(B).
    So Av = v' + Bu.
    We need to find F such that Fv = -u (roughly, depending on definition u = Fx).
    Usually u = Fx. So (A + BF)v \in V*.
    Av + B(Fv) \in V*.
    
    Since V* is controlled invariant, for every basis vector v_i of V*,
    Av_i = w_i + B u_i where w_i \in V*.
    So B u_i = Av_i - w_i.
    This means Av_i \in V* + Im(B), which is true by definition.
    
    We need to find F such that F v_i = -u_i?
    No, we need (A+BF)v_i \in V*.
    Av_i + B F v_i = w_i \in V*.
    B F v_i = w_i - Av_i.
    
    So we need to solve for F v_i = u_i where B u_i \in V* - Av_i ?
    Actually, it's simpler:
    Solve B u_i = - (Av_i mod V*).
    Or rather, find u_i such that Av_i + B u_i \in V*.
    
    For each basis vector v_i of V*:
    Av_i can be decomposed into a part in V* and a part in Im(B) (modulo V* intersection Im(B)? No).
    
    By definition of V*: A V* \subset V* + Im(B).
    So for each v_i, Av_i = v'_i + B u_i.
    Then (A - B u_i/|v_i| * <?,?>) ...
    Let's set F v_i = -u_i.
    Then (A + BF) v_i = A v_i - B u_i = v'_i \in V*.
    
    So the algorithm is:
    1. Let V* = [v_1, ..., v_k].
    2. For each i, solve [V*  B] [x; y] = A v_i.
       Since A v_i \in V* + Im(B), a solution exists.
       Here x corresponds to coefficients for V*, y corresponds to coefficients for B (which is -u_i).
       So B (-y) = - B y.
       Wait, [V* B] [x; y] = V* x + B y = A v_i.
       We want (A + BF) v_i \in V*.
       A v_i + B (F v_i) = V* x.
       So B (F v_i) = V* x - A v_i = - B y.
       So we can choose F v_i = -y.
    3. Construct F. We defined F on V*. We can define F on the orthogonal complement of V* arbitrarily (e.g. 0).
    """
    n = A.shape[0]
    m = B.shape[1]
    k = V_star.shape[1]
    
    if k == 0:
        return np.zeros((m, n))
    
    # Matrix [V* B]
    M = np.hstack([V_star, B])
    
    # ⚡ Bolt: Vectorize lstsq to solve M [X; Y] = A V* in a single call (~18x speedup)
    # A @ V_star gives all Av_i vectors as columns.
    # sol will contain [X; Y] where Y has size (m, k).
    sol, residuals, rank_M, s = np.linalg.lstsq(M, A @ V_star, rcond=tol)

    # y = sol[k:]
    # F_part = -y
    F_part = -sol[k:, :]
        
    # Now we have F defined on basis V*.
    # F [v_1 ... v_k] = [u_1 ... u_k] (where u_i = -y_i)
    # F V* = U_mat
    # F = U_mat @ (V*)^+ (pseudo inverse of V*)
    
    U_mat = F_part
    
    # Since V* has orthonormal columns, (V*)^+ = (V*)^T
    F = U_mat @ V_star.T
    
    return F

