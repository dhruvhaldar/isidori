import time
import numpy as np
from api.engine.linear import compute_v_star

np.random.seed(42)

dim_n = 50
dim_m = 10
dim_p = 10

A = np.random.randn(dim_n, dim_n)
B = np.random.randn(dim_n, dim_m)
C = np.random.randn(dim_p, dim_n)

start_time = time.time()
for _ in range(5):
    V_star = compute_v_star(A, B, C)
end_time = time.time()
print(f"Time taken: {end_time - start_time} seconds")
