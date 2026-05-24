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
## 2025-02-28 - Sum Spaces Intersection Containment Optimization
**Learning:** In the `sum_spaces` algorithm using geometric orthogonal projections, calculating `B_perp = B - A @ (A.T @ B)` frequently produces a near-zero matrix if subspace `B` is fully contained in subspace `A` (a common occurrence in subset operations). Passing this near-zero orthogonal projection to `basis(B_perp)` needlessly invokes computationally expensive Rank-Revealing QR factorizations.
**Action:** Before running the `basis` calculation on the orthogonal projection, check if the Frobenius norm of `B_perp` is effectively zero (e.g. `< tol * max(B.shape) * max(1.0, np.linalg.norm(B, ord='fro'))`). If it is, return the basis of `A` directly. This bypasses the $O(mn^2)$ RRQR operation for subset scenarios, yielding ~2.4x speedups.

## 2026-04-24 - Strict Orthonormality Check Bottleneck
**Learning:** Checking strict mathematical equivalency like orthonormality (`A.T @ A == I`) using `np.allclose(..., atol=1e-8)` inside hot loops in iterative algorithms is extremely slow because `np.allclose` handles complex types, NaN checks, and element-wise absolute comparisons.
**Action:** Replace `np.allclose(A.T @ A, np.eye(A.shape[1]), atol=1e-8)` with checking the Frobenius norm of the difference: `np.linalg.norm(A.T @ A - np.eye(A.shape[1]), ord='fro') < 1e-8`. This compiles down directly to highly optimized BLAS routines and bypasses `numpy`'s slow universal function overhead, yielding a ~4x speedup per check.

## 2026-05-15 - QR Factorization Avoid Q Matrix Computation
**Learning:** When using `scipy.linalg.qr` to compute properties like matrix rank that only depend on the upper triangular matrix `R` (and potentially the pivoting vector), using `mode='economic'` still computes an economy-sized `Q` matrix. Computing `Q` is an expensive operation that is entirely discarded.
**Action:** Always use `mode='r'` when `Q` is not needed (e.g., for `rank` computations). This instructs LAPACK to only return `R` (and the permutation array `P` if `pivoting=True`), yielding approximately a ~2x speedup over `mode='economic'`.
## 2026-05-18 - Preimage Intersection Mathematical Bottleneck
**Learning:** In geometric subspace operations, computing the intersection of a subspace `V` with the preimage of `S` under a linear map `A` ($V \cap A^{-1}(S)$) by first calculating the full preimage $A^{-1}(S)$ across the entire space $\mathbb{R}^n$ and then intersecting the two $n$-dimensional subspaces is extremely slow and requires multiple SVDs/RRQRs.
**Action:** Instead, mathematically restrict the domain of `A` to `V` by passing `A @ V` to the inverse image function to find the preimage in the local coordinates of `V` (`Y = inverse_image(A @ V, S, tol)`). Multiply `Y` back by `V` and compute its basis (`V_next = basis(V @ Y, tol)`) to find the intersection directly. This reduces the problem dimensions and bypasses the generic subspace intersection algorithm entirely, yielding a ~3x speedup.

## 2026-05-19 - Subspace Basis Orthonormality Redundancy
**Learning:** In geometric control iterative algorithms (e.g., $V^* \cap A^{-1}(\dots)$), multiplying orthogonal matrices together or projecting matrices frequently produces results that are mathematically guaranteed to already be orthonormal. Running LAPACK's QR factorization (`linalg.qr`) inside `basis()` unconditionally on matrices that are already orthonormal bases wastes significant computation ($O(n^3)$).
**Action:** In functions that return a `basis(M)`, add a fast $O(n^2)$ check using the Frobenius norm (`np.linalg.norm(M.T @ M - np.eye(M.shape[1]), ord='fro') < 1e-8`) to verify if the matrix is already strictly orthonormal. If it is, simply return `M` to completely bypass the Rank-Revealing QR factorization. This yields a massive (~8x) speedup for redundant calls and accelerates iterative convergence loops.

## 2026-05-19 - Unnecessary empty onChange closures in React Memoized Components
**Learning:** Passing `onChange={() => {}}` to memoized React components like `MatrixInput` creates a new unstable function reference on every single render. This forces the component and all its nested children to re-render constantly, defeating the purpose of `React.memo` and causing massive O(N*M) performance bottlenecks for read-only matrices.
**Action:** Make `onChange` optional (`onChange?: (value: number[][]) => void`) in the component props so that read-only instances can omit the prop entirely, preserving `React.memo` performance optimizations.

## 2026-05-19 - Unmemoized Chart Components in Forms
**Learning:** Unmemoized complex chart components (like Recharts `LineChart`) within form pages cause severe input lag. Typing in adjacent form fields triggers a parent component re-render, forcing the chart to needlessly reconcile and render thousands of data points on every single keystroke.
**Action:** Always wrap data-heavy visualization components with `React.memo()`. As long as the data prop reference is stable (e.g. only updated on form submission), this completely eliminates chart re-renders during form input, drastically improving UI responsiveness.

## 2026-05-19 - React Matrix Input Deep Cloning Bottleneck
**Learning:** In React components handling 2D matrix inputs, performing a deep clone (e.g., `value.map(row => [...row])`) inside the `onChange` handler for every single keystroke causes an $O(N \times M)$ performance bottleneck. This introduces significant input lag for moderately sized matrices because the entire matrix is needlessly duplicated when only one cell is changing.
**Action:** Replace deep cloning with shallow row cloning. Clone the outer array and only the specific row being modified (e.g., `const newValue = [...value]; newValue[r] = [...newValue[r]];`). This reduces the copy operation time complexity from $O(N \times M)$ to $O(N + M)$ yielding a ~100x speedup for typical operations without breaking immutability.

## 2026-05-07 - Early Returns for Subspaces in Iterative Geometric Algorithms
**Learning:** In geometric control iterative algorithms like V* computation, hitting edge cases like empty spaces or full spaces is common (e.g., if the system is fully observable/controllable). Continuing the iteration or running factorization algorithms (like RRQR via basis, sum_spaces, inverse_image) on these edge cases wastes significant O(n^3) computation without changing the subspace.
**Action:** Always include mathematical fast-paths at the start of loops. If a subspace like V becomes the empty space or full R^n, immediately return it. Similarly, if V_k + Im B reaches the full space, V_k+1 trivially equals V_k, so you can break the loop early and bypass expensive subspace intersections.
## 2026-05-20 - Subspace Properties Zero Matrix Fast Path
**Learning:** In `api/engine/utils.py`, the core subspace property functions (`rank`, `basis`, `kernel`) frequently evaluate near-zero matrices during iterative convergence (e.g., when a subspace becomes fully contained in another, yielding a zero orthogonal projection). Computing a full Rank-Revealing QR (RRQR) factorization ($O(n^3)$) on a matrix that is mathematically zero is extremely computationally wasteful.
**Action:** Always include a fast-path check using the computationally cheap Frobenius norm (`np.linalg.norm(M, ord='fro') < tol_val`) at the very beginning of geometric property functions. If the matrix is effectively zero, return the mathematically trivial result (`0` for rank, `np.zeros` for basis, `np.eye` for kernel) immediately. This bypasses the expensive `linalg.qr` LAPACK operation and yields ~20x-50x speedups for these common edge cases.

## 2026-05-21 - DDP Feedback Matrix A-Invariance Fast Path
**Learning:** In the Disturbance Decoupling Problem (DDP), computing the feedback matrix `F` such that `(A + BF)V* \subset V*` requires solving an augmented least squares problem `[B_proj] Y = A_proj`. During iterative convergence or stable system states, `V*` frequently becomes strictly `A`-invariant (`A V* \subset V*`), meaning the orthogonal projection `A_proj` is mathematically the zero matrix. Passing a zero right-hand side to `np.linalg.lstsq` needlessly invokes an expensive full factorization.
**Action:** When computing geometric feedback matrices via least squares, check if the projected target vector (e.g., `A_proj`) is effectively zero using the Frobenius norm (`np.linalg.norm(A_proj, ord='fro') < tol`). If so, immediately return the trivial zero matrix `np.zeros(...)` to bypass the $O(mn^2)$ `lstsq` factorization. This yields ~4x speedups for invariant sub-cases during DDP synthesis loops.

## 2026-05-22 - Subspace Properties Zero Matrix Fast Path
**Learning:** In `api/engine/utils.py`, the core subspace property functions (`rank`, `basis`, `kernel`) frequently evaluate near-zero matrices during iterative convergence (e.g., when a subspace becomes fully contained in another, yielding a zero orthogonal projection). Computing a full Rank-Revealing QR (RRQR) factorization ($O(n^3)$) on a matrix that is mathematically zero is extremely computationally wasteful.
**Action:** Always include a fast-path check using the computationally cheap Frobenius norm (`np.linalg.norm(M, ord='fro') <= tol_val`) at the very beginning of geometric property functions. If the matrix is effectively zero, return the mathematically trivial result (`0` for rank, `np.zeros` for basis, `np.eye` for kernel) immediately. This bypasses the expensive `linalg.qr` LAPACK operation and yields ~20x-50x speedups for these common edge cases.

## 2026-05-23 - Sum Spaces Orthonormal Substitution Fast Path
**Learning:** In geometric subspace addition (`sum_spaces`), if matrix `A` is not strictly orthonormal but `B` is, the algorithm used to fall back to the computationally expensive `basis(np.hstack([A, B]))` operation which involves an RRQR factorization of the concatenated matrix.
**Action:** When computing subspace additions, check if `B` is orthonormal. If it is, swap their roles and project `A` onto the orthogonal complement of `B` (`A_perp = A - B @ B.T @ A`), calculate its basis, and concatenate. This bypasses the $O(mn^2)$ factorization of the augmented matrix, yielding a ~1.3x speedup when `A` is not orthonormal but `B` is.

## 2026-05-18 - V* Computation Convergence Fast Path
**Learning:** In the geometric algorithm for computing the maximal controlled invariant subspace $V^*$ ($V_{next} = V \cap A^{-1}(V + Im(B))$), if the local preimage `Y = inverse_image(A @ V, S)` has the same dimension (number of columns) as the current basis `V`, it mathematically guarantees that $\dim(V_{next}) = \dim(V)$. Since $V_{next} \subseteq V$, they must be the same space, meaning the sequence has converged.
**Action:** Before performing the O(n k^2) matrix multiplication `V @ Y` and the subsequent O(n k^2) Rank-Revealing QR factorization in `basis(V @ Y)`, simply check `if Y.shape[1] == V.shape[1]`. If true, return `V` immediately. This completely bypasses redundant computations during the final convergence iteration of every execution, yielding ~1.5x speedups.

## 2026-05-23 - Nonlinear Relative Degree Computation Optimizations
**Learning:** In relative degree computation, iterating through all vector field components (including zeros) inside hot loops and repeatedly executing `sympy` checks is extremely expensive, especially for sparse multi-dimensional systems. Furthermore, using `sympy.expand()` on expressions that are mathematically already `0` (which is common before expansion) adds severe overhead.
**Action:** Pre-filter vector fields into lists of non-zero `(variable, value)` tuples outside the iteration loop to completely bypass zero elements during Lie derivative calculations. Also, inline the Lie derivative computation to avoid overhead, and add an early `if expr == 0:` check to immediately short-circuit operations before invoking the computationally expensive `sympy.expand()`. This yields a ~30-50% speedup for relative degree computations of typical sparse systems.

## 2026-05-23 - Subspace Orthonormality Dimension Check Optimization
**Learning:** In geometric operations like `sum_spaces`, `intersection`, and `inverse_image`, we verify matrix orthonormality using the Frobenius norm (`np.linalg.norm(M.T @ M - np.eye(M.shape[1]), ord='fro') < 1e-8`). For "fat" matrices (where columns > rows), it is mathematically impossible for the columns to be orthonormal. Executing the $O(M \times N^2)$ matrix multiplication `M.T @ M` on such matrices is entirely wasteful.
**Action:** Always wrap orthonormality Frobenius norm checks inside a dimension check (`if M.shape[0] >= M.shape[1]:`). This completely bypasses the matrix multiplication for non-basis intermediate matrices, yielding significant speedups.

## 2026-05-23 - Lazy Orthonormality Check in Commutative Subspace Operations
**Learning:** In commutative operations like `intersection(A, B)`, we can swap roles if $A$ is orthonormal but $B$ is not, completely bypassing the expensive `basis(B)` RRQR factorization. However, eagerly checking if *both* $A$ and $B$ are orthonormal at the top of the function introduces a performance regression by forcing an unnecessary matrix multiplication (`A.T @ A` or `B.T @ B`) when the operation might have otherwise hit an early return or fast-path.
**Action:** When evaluating multiple mathematical properties for commutative algorithm fast-paths, evaluate them lazily. Only check if $A$ is orthonormal if $B$ fails its orthonormality check, preserving the performance of edge cases while enabling the swap optimization.

## 2026-05-24 - Pure Function Caching for Core Geometrical Engine Algorithms
**Learning:** In the geometric algorithm engine (`api/engine`), identical inputs to pure functional endpoints (like `compute_v_star`, `check_disturbance_decoupling`, and `compute_relative_degree`) always yield the same outputs. Re-computing these results for duplicate API calls from the React frontend wastes significant CPU resources due to O(n³) factorizations and SymPy computations. Standard `lru_cache` fails because numpy arrays and lists are unhashable.
**Action:** Implemented a `hashable_cache` wrapper in `api/engine/utils.py` that recursively converts numpy arrays to tuple-based formats (storing shape, flattened data tuple, and dtype) and lists to tuples before executing `functools.lru_cache`. Applied this decorator to pure functions in `linear.py` and `nonlinear.py` to memoize the results of repetitive computations, resulting in near-instantaneous responses for cached inputs while preserving robust type handling.
