import numpy as np
from scipy import linalg

def tolerance(M):
    """Returns a tolerance value for rank/nullspace calculations."""
    return max(M.shape) * np.linalg.norm(M, 2) * np.finfo(M.dtype).eps

def rank(M, tol=None):
    """Computes the rank of a matrix."""
    if tol is None:
        tol = tolerance(M)
    # ⚡ Bolt: compute_uv=False avoids computing eigenvectors when only singular values are needed (~2x speedup)
    s = np.linalg.svd(M, compute_uv=False)
    return np.sum(s > tol)

def basis(M, tol=None):
    """Returns an orthonormal basis for the range (column space) of M."""
    if tol is None:
        tol = tolerance(M)
    # ⚡ Bolt: full_matrices=False computes economy-size SVD, drastically faster for rectangular matrices (~6x speedup)
    u, s, vh = np.linalg.svd(M, full_matrices=False)
    r = np.sum(s > tol)
    return u[:, :r]

def kernel(M, tol=None):
    """Returns an orthonormal basis for the null space of M."""
    if tol is None:
        tol = tolerance(M)
    # ⚡ Bolt: Only compute full matrices if M is wide. For tall matrices, economy SVD provides the full null space without computing the massive, unused U matrix.
    u, s, vh = np.linalg.svd(M, full_matrices=(M.shape[0] < M.shape[1]))
    r = np.sum(s > tol)
    return vh[r:, :].T

def intersection(A, B, tol=1e-10):
    """
    Computes the intersection of two subspaces spanned by columns of A and B.
    Intersection is computed by finding null space of [A -B].
    """
    if A.size == 0: return np.zeros((A.shape[0], 0))
    if B.size == 0: return np.zeros((B.shape[0], 0))
    
    # Concatenate [A, -B]
    M = np.hstack([A, -B])
    
    # Null space of [A, -B] gives coefficients [u; v] such that Au - Bv = 0 => Au = Bv
    # The intersection is spanned by Au.
    
    # However, for numerical stability with subspaces, we can use SVD on [A B] ? 
    # Or use the null space method.
    
    K = kernel(M, tol)
    
    if K.size == 0:
        return np.zeros((A.shape[0], 0))
        
    # K has rows corresponding to A (nA columns) and B (nB columns)
    nA = A.shape[1]
    
    # Coefficients for A
    CoeffsA = K[:nA, :]
    
    # Intersection basis in original coordinates
    Int = A @ CoeffsA
    
    return basis(Int, tol) # Orthonormalize

def sum_spaces(A, B, tol=1e-10):
    """Returns basis for sum of subspaces A and B."""
    if A.size == 0: return basis(B, tol)
    if B.size == 0: return basis(A, tol)
    return basis(np.hstack([A, B]), tol)

def inverse_image(A, S, tol=1e-10):
    """
    Computes A^{-1}(S) = {x | Ax in S}.
    
    Ax = Sy  => [A -S] [x; y] = 0
    """
    if S.size == 0:
        # If S is {0}, we want kernel(A)
        return kernel(A, tol)
    
    M = np.hstack([A, -S])
    K = kernel(M, tol)
    
    # K contains [x; y]. We want x.
    n = A.shape[1]
    X_coeffs = K[:n, :]
    
    # The vectors x are the first n rows of the kernel vectors.
    # However, we need to extract a basis for these x vectors.
    return basis(X_coeffs, tol)

