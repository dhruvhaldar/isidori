import numpy as np
from api.engine.utils import intersection, basis, kernel

np.random.seed(0)
A_raw = np.random.randn(10, 5)
B_raw = np.random.randn(10, 6)
A = basis(A_raw)
B = basis(B_raw)

proj_A_perp = A - B @ (B.T @ A)
K = kernel(proj_A_perp)

print("K is orthonormal?", np.allclose(K.T @ K, np.eye(K.shape[1])))
