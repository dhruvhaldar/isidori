import numpy as np
import time

A_cl = np.random.randn(10, 10)
E_flat = np.random.randn(10)
steps = 100000
dt = 0.01
d_out = np.random.randn(steps)

x_out = np.zeros((steps, 10))
x = np.zeros(10)

start = time.time()
for i in range(steps):
    d_val = d_out[i]
    dx = A_cl @ x + E_flat * d_val
    x = x + dx * dt
    x_out[i] = x
end = time.time()
print("Original loop time:", end - start)

x_out2 = np.zeros((steps, 10))
x = np.zeros(10)

start = time.time()
A_step = np.eye(10) + A_cl * dt
E_step = E_flat * dt
for i in range(steps):
    x = A_step @ x + E_step * d_out[i]
    x_out2[i] = x
end = time.time()
print("Optimized loop time:", end - start)

print("Same result:", np.allclose(x_out, x_out2))
