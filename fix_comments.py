import re

with open("api/engine/linear.py", "r") as f:
    content = f.read()

# Add comment for A.dot(V)
content = content.replace("        Y = inverse_image(A.dot(V), S, tol)", "        # ⚡ Bolt: Use .dot() instead of @ to reduce python dispatcher overhead\n        Y = inverse_image(A.dot(V), S, tol)")

with open("api/engine/linear.py", "w") as f:
    f.write(content)

with open("api/engine/utils.py", "r") as f:
    content = f.read()

content = content.replace("    return fast_fro_norm(M.T.dot(M) - np.eye(M.shape[1])) < tol", "    # ⚡ Bolt: Use .dot() instead of @ to reduce python dispatcher overhead\n    return fast_fro_norm(M.T.dot(M) - np.eye(M.shape[1])) < tol")

with open("api/engine/utils.py", "w") as f:
    f.write(content)
