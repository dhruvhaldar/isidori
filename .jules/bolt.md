## 2026-03-05 - SymPy Lie Derivative Bottleneck
**Learning:** Repeated applications of `sympy.simplify()` during sequential differentiation (like computing Lie derivatives) causes exponential expression tree bloat, slowing down computation from seconds to minutes as dimensionality increases (e.g., from 0.86s to 158s for 8 vars).
**Action:** Use `sympy.expand()` to pre-check expressions for zero and to simplify intermediate derivatives before taking the next derivative. Only fallback to `sympy.simplify()` if `expand()` does not yield zero but a zero-check is necessary.

## 2025-03-05 - Subspace Operations SVD Bottleneck
**Learning:** Geometric control algorithms heavily rely on SVD for rank and basis computations (`np.linalg.svd`). By default, NumPy computes full `M x M` and `N x N` unitary matrices (`U` and `V`), which is extremely slow when concatenating tall/wide matrices for subspace sums and intersections.
**Action:** Always use `compute_uv=False` when only singular values are needed (e.g., `rank`), and `full_matrices=False` when computing bases for rectangular matrices to compute the drastically faster "economy-size" SVD.

## 2026-03-05 - Sparse Vector Field Differentiation Bottleneck
**Learning:** Control systems often involve sparse vector fields (e.g., `g = [0, 0, 1]`). Computing Lie derivatives `(grad h) . v` unconditionally differentiates the function `h` with respect to all variables, even when the corresponding vector component is exactly 0. This results in an enormous amount of wasted symbolic computation.
**Action:** When computing sums of symbolic derivatives multiplied by vector components, always check `if v != 0:` to skip the expensive `sympy.diff` computation for zero components. This yields a massive (~150x) speedup for sparse vectors.

## 2026-03-28 - Geometric Subspace Intersection/Inverse Bottleneck
**Learning:** Using concatenated matrices `[A, -B]` or `[A, -S]` to compute null spaces for geometric operations (intersection and inverse image) requires computing the SVD of a large block matrix, which is slow.
**Action:** Subspace bases (`B` and `S`) returned by geometric algorithms are already orthonormal. Use orthogonal projection formulas like `(I - B B^T) A` to isolate the vectors belonging to the orthogonal complement, then compute the null space. This reduces the size of the matrix passed to SVD and leads to a 2x-3x speedup.

## 2026-03-30 - Subspace Summation Bottleneck
**Learning:** Computing the sum of two subspaces $A$ and $B$ (e.g. `basis(np.hstack([A, B]))`) is computationally expensive because it requires performing SVD on an augmented matrix `[A, B]` where the dimension scales linearly with the size of both sub-bases.
**Action:** Since $A$ and $B$ are typically already orthonormal bases in the context of geometric control (e.g., intermediate steps of $V^*$), their sum can be computed significantly faster (~2.7x speedup) by projecting $B$ onto the orthogonal complement of $A$ ($B_{\perp} = B - A A^T B$), computing the basis of $B_{\perp}$, and concatenating it with $A$.

## 2026-04-01 - SymPy Sparse Differentiation Unnecessary Free Symbols Bottleneck
**Learning:** Even when avoiding differentiation of zero vector components, calling `sympy.diff(func, var)` when `var` does not appear in `func` is slow. Checking if `var` is in `func.free_symbols` avoids doing the full differentiation work just to return `0`, yielding another ~3-4x speedup over the previous sparse-vector optimization for variables absent from the function.
**Action:** When computing Lie derivatives (or differentiating with SymPy in a loop), always check `if hasattr(func, 'free_symbols') and var not in func.free_symbols:` to skip `sympy.diff` if the variable isn't present in the expression.

## 2026-04-05 - Simulation Loop Vectorization
**Learning:** When simulating state space models in Python, using list appends and re-evaluating properties like `E.flatten()` inside the simulation loop is slow.
**Action:** Pre-allocate numpy arrays for state tracking, pre-compute input signals, flatten matrices before the loop, and use vectorized operations outside the loop to calculate outputs. This reduces loop overhead and leverages BLAS optimizations for a ~2x speedup.

## 2024-05-18 - Euler Simulation Loop Bottleneck
**Learning:** In Python numerical simulation loops (e.g., simple Euler integration), repeatedly calculating `A_cl @ x + E_flat * d_val` and adding to `x` inside a loop of 10,000+ steps causes significant overhead due to scalar multiplications and matrix additions that could be factored out.
**Action:** Precompute loop-invariant matrices for the simulation step outside the main loop, such as `A_step = np.eye(dim) + A_cl * dt` and `E_step = E_flat * dt`, and then run `x = A_step @ x + E_step * d_out[i]` inside the loop. This reduces the number of operations per step and speeds up the simulation by ~1.7x.

## 2024-05-18 - Intersection Basis Orthonormality Regressions
**Learning:** When computing the intersection of two subspaces `A` and `B` using the null space kernel `K` of the concatenated matrix or orthogonal projection, it is tempting to skip a final orthonormalization (e.g., returning `A @ K` instead of `basis(A @ K)`) under the false assumption that multiplying an orthonormal matrix by an orthonormal basis of a kernel yields an orthonormal result. The components of `K` often have scaled norms depending on the null space computation, making `A @ K` mathematically incorrect without normalization.
**Action:** Never skip the final orthonormalization step (e.g., `basis(Int, tol)`) when returning the basis for a subspace intersection unless the mathematical guarantee is absolute and thoroughly tested against arbitrary matrices.

## 2026-04-07 - React Matrix Input Re-render Bottleneck
**Learning:** In React form interfaces handling multi-dimensional matrices, passing unstable `onChange` closures to individual cell inputs causes $O(N \times M)$ component re-renders per keystroke. Furthermore, modifying one matrix on a page triggers re-renders of all other matrices because they share the parent's state.
**Action:** Extract cells into `React.memo` components, stabilize the `onChange` handler using `useRef` and `useCallback` to track the latest state, and wrap the entire `MatrixInput` component in `React.memo` to skip rendering unmodified matrices.

## 2026-04-08 - Vectorized Disturbance Multiplication in Simulation Loops
**Learning:** In the `api/index.py` simulation loop, executing `E_step * d_out[i]` inside the 10,000-iteration loop performed unnecessary repeated scalar-to-vector multiplications.
**Action:** Always pre-compute and broadcast such scalar multiplications outside the loop. Using `E_d = d_out[:, np.newaxis] * E_step` created a pre-scaled matrix of disturbances, shifting the heavy lifting to C/C++ backend extensions and speeding up the Python `for` loop iteration by ~33%.
## 2024-04-09 - Reuse SVD Results to Avoid Redundant Tolerance SVD Computations
**Learning:** Functions computing mathematical subspace ranks, bases, and kernels often require dynamic tolerance checks involving the 2-norm (largest singular value) of the matrix. Calling `np.linalg.norm(M, 2)` internally triggers an SVD. If the parent function itself needs an SVD, calculating the tolerance via the standard helper computes SVD *twice* per operation.
**Action:** When a function computes `u, s, vh = np.linalg.svd(...)`, calculate the tolerance inline using the already-computed maximum singular value (`s[0]`) instead of deferring to a helper function that blindly calls `np.linalg.norm`.

## 2026-04-10 - Geometric Subspace Early Returns Bottleneck
**Learning:** During iterative algorithms like `compute_v_star`, intermediate subspaces can grow to span the full space ($\mathbb{R}^n$). When this happens, passing them to generalized geometric operators (like `intersection`, `inverse_image`, and `sum_spaces`) unnecessarily triggers expensive SVD calculations to find orthogonal projections and kernels, which can be trivially mathematically bypassed.
**Action:** Add early return checks in subspace utility functions: if a subspace matrix has the same number of columns as rows (`shape[1] == shape[0]`), immediately return the trivial result (e.g., `A
## 2024-04-11 - Frobenius Norm vs 2-Norm Bottleneck
**Learning:** Calling `np.linalg.norm(M, 2)` computes the largest singular value of `M`, which under the hood performs a full Singular Value Decomposition (SVD). When used to define dynamic tolerances or checks in iterative algorithms (e.g., `check_disturbance_decoupling`, `tolerance(M)`), this introduces a massive performance bottleneck.
**Action:** Replace `ord=2` with `ord='fro'` (Frobenius norm) for tolerance bounds and magnitude checks when a strict maximum singular value is not mathematically required. Since $||M||_2 \le ||M||_F \le \sqrt{r} ||M||_2$, the Frobenius norm serves as a safe, conservative upper bound that calculates instantly without requiring an SVD, yielding a ~400x speedup for the norm calculation itself.


## 2024-05-18 - Failed Optimization: Orthogonal Projection Requires Orthomormal Basis
**Learning:** When optimizing least squares problems like $[V^*, B] [X; Y]^T = A V^*$ in geometric control via orthogonal projection (e.g., using `(I - V_star V_star^T) B`), the mathematical assumption that $V^*$ is strictly orthonormal MUST hold. If the basis returned by the algorithm is mathematically valid but not strictly orthonormal (e.g. scaled lengths), the projection fails silently, returning mathematically incorrect feedback matrices.
**Action:** Never substitute augmented least-squares solves with orthogonal projections unless you either manually orthogonalize the basis first (via QR/SVD, which negates the performance gain) or are absolutely certain the upstream algorithm enforces strict orthonormality.

## 2024-05-18 - Safe Orthogonal Projection for Feedback Matrix
**Learning:** In geometric control, finding a feedback matrix $F$ often involves solving linear equations like $[V^*, B] [X; Y]^T = A V^*$. Appending bases to solve for coefficients that are later discarded (like $X$) wastes computation by making the least squares problem unnecessarily large.
**Action:** Project $B$ and $A V^*$ onto the orthogonal complement of $V^*$ (e.g., `B_proj = B - V_star @ (V_star.T @ B)`). This isolates the component that must be matched by $B$, reducing the linear system size from $n \times (k+m)$ to $n \times m$ and significantly speeding up the calculation. Crucially, strictly enforce that $V^*$ is orthonormal before projecting (`np.allclose(V.T @ V, np.eye)`), otherwise the math fails silently.
## 2024-05-18 - SymPy Parsing Bottleneck
**Learning:** Functions that repeatedly evaluate ASTs and strings using `sympy.sympify` or a custom secure parser are incredibly slow because parsing strings to SymPy nodes is computationally expensive and repetitive when computing iterative algorithms.
**Action:** When a function like `safe_sympify` repeatedly parses the same strings (e.g., control variables `x1, x2` or constant strings like `0`, `1` during derivative loops), use `@functools.lru_cache(maxsize=1024)` to memoize the parsing result. This avoids redundant parsing and yields massive (~50x+) speedups for functions utilizing SymPy.

## 2024-05-18 - RRQR Factorization vs SVD Bottleneck
**Learning:** In Python/NumPy geometric operations, using `np.linalg.svd` to compute subspace properties (rank, orthonormal basis, kernel) is computationally expensive ($O(m n^2)$), particularly for the tall or wide matrices frequently encountered during iterative geometric subspace algorithms.
**Action:** Replace `np.linalg.svd` with Rank-Revealing QR Factorization (`scipy.linalg.qr(..., pivoting=True)`), which is significantly faster (~3x) and mathematically robust. For `basis` and `rank`, use `mode='economic'`. For `kernel` ($M x = 0$), compute the RRQR of the transposed matrix $M^T$ using `mode='full'` to extract the null space basis directly from the resulting $Q$ matrix.
## 2024-05-19 - Subspace Containment Fast Path
**Learning:** In geometric control iterative algorithms, subspaces frequently align or contain one another. In the `inverse_image` computation ($A^{-1}(S)$), if the image of $A$ is fully contained within $S$, computing the orthogonal projection $A - S(S^TA)$ yields a near-zero matrix. Continuing to run a Rank-Revealing QR (RRQR) kernel factorization on this zero-matrix is wasted computation.
**Action:** When computing geometric inverses or intersections, check if the projection norm is effectively zero using the computationally cheap Frobenius norm. If so, return the trivial mathematical basis (e.g., `np.eye(A.shape[1])` for inverse image) to bypass $O(mn^2)$ factorization costs. This specific optimization yielded a ~3x speedup for the containment edge case.
## 2025-02-28 - Geometric Subspace Intersection Optimization
**Learning:** In geometric subspace intersection (`intersection` via null space of orthogonal projection), there is a computationally common edge case where subspace `A` is fully contained in subspace `B`. This frequently happens in iterative subspace algorithms (like `V*` computation) as spaces shrink or converge. When $A \subseteq B$, the orthogonal projection of `A` onto `B` ($A - B @ (B.T @ A)$) mathematically approaches the zero matrix. By detecting this via the Frobenius norm instead of computing the full Rank-Revealing QR (RRQR) kernel factorization on the projection, we can bypass the most expensive $O(N \times M^2)$ operation.
**Action:** When calculating subspace intersections using projections, always check if the Frobenius norm of the projection matrix is below tolerance (e.g., `< tol * max(A.shape) * max(1.0, np.linalg.norm(A, 'fro'))`). If so, immediately return the basis of `A` to safely bypass kernel computation and yield ~35% speedups for subset cases.
