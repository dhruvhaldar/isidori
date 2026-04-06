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
