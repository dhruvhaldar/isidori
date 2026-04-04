import time
import numpy as np

def original_sim(A, B, F, E, C, steps, dt, time_arr):
    x = np.zeros(A.shape[0])
    A_cl = A + B @ F
    y_out = []
    x_out = []
    d_out = []

    def disturbance(t):
        return np.sin(t)

    for t in time_arr:
        d_val = disturbance(t)
        dx = A_cl @ x + E.flatten() * d_val
        x = x + dx * dt

        y_val = C @ x

        x_out.append(x.tolist())
        y_out.append(y_val.tolist())
        d_out.append(d_val)
    return y_out, d_out

def optimized_sim(A, B, F, E, C, steps, dt, time_arr):
    n = A.shape[0]
    x = np.zeros(n)
    A_cl = A + B @ F

    x_out = np.zeros((steps, n))
    d_out = np.sin(time_arr)
    E_flat = E.flatten()

    A_discrete = np.eye(n) + A_cl * dt
    E_discrete = E_flat * dt

    for i in range(steps):
        x = A_discrete @ x + E_discrete * d_out[i]
        x_out[i] = x

    y_out = (C @ x_out.T).T
    return y_out.tolist(), d_out.tolist()

np.random.seed(0)
n = 100
m = 20
p = 10
A = np.random.randn(n, n)
B = np.random.randn(n, m)
F = np.random.randn(m, n)
E = np.random.randn(n, 1)
C = np.random.randn(p, n)

dt = 0.01
T = 100.0
steps = int(T / dt)
time_arr = np.linspace(0, T, steps)

# Warmup
original_sim(A, B, F, E, C, steps, dt, time_arr)
optimized_sim(A, B, F, E, C, steps, dt, time_arr)

t0 = time.time()
original_sim(A, B, F, E, C, steps, dt, time_arr)
t1 = time.time()
orig_time = t1 - t0

t0 = time.time()
optimized_sim(A, B, F, E, C, steps, dt, time_arr)
t1 = time.time()
opt_time = t1 - t0

print(f"Original: {orig_time:.4f} s")
print(f"Optimized: {opt_time:.4f} s")
print(f"Speedup: {orig_time/opt_time:.2f}x")
