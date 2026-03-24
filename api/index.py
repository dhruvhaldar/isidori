from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Any
import os
import numpy as np
import sympy as sp
import logging
from .engine.linear import compute_v_star, check_disturbance_decoupling, compute_feedback_matrix

logger = logging.getLogger(__name__)
from .engine.nonlinear import compute_relative_degree

app = FastAPI(docs_url="/api/docs", openapi_url="/api/openapi.json")

# Secure CORS configuration
# Defaults to localhost for dev, can be configured via environment variable
origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class MatrixInput(BaseModel):
    matrix: List[List[float]]

class LinearSystemInput(BaseModel):
    A: List[List[float]]
    B: List[List[float]]
    C: List[List[float]]
    E: Optional[List[List[float]]] = None # Disturbance matrix

class NonlinearSystemInput(BaseModel):
    f: List[str]
    g: List[str]
    h: str
    vars: List[str]

@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Isidori Engine Running"}

@app.post("/api/vstar")
def calculate_v_star(data: LinearSystemInput):
    try:
        A = np.array(data.A)
        B = np.array(data.B)
        C = np.array(data.C)
        
        V_star = compute_v_star(A, B, C)
        
        return {"V_star": V_star.tolist()}
    except Exception as e:
        logger.error(f"Error in /api/vstar: {str(e)}")
        raise HTTPException(status_code=400, detail="An error occurred during V* computation.")

@app.post("/api/ddp")
def check_ddp(data: LinearSystemInput):
    try:
        A = np.array(data.A)
        B = np.array(data.B)
        C = np.array(data.C)
        if data.E is None:
             raise HTTPException(status_code=400, detail="Matrix E is required for DDP check.")
        E = np.array(data.E)
        
        is_solvable, V_star, F = check_disturbance_decoupling(A, B, E, C)
        
        result = {
            "is_solvable": bool(is_solvable),
            "V_star": V_star.tolist()
        }
        
        if is_solvable and F is not None:
            result["F"] = F.tolist()
            
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in /api/ddp: {str(e)}")
        raise HTTPException(status_code=400, detail="An error occurred during DDP check.")

@app.post("/api/nonlinear/reldeg")
def calculate_reldeg(data: NonlinearSystemInput):
    try:
        result = compute_relative_degree(data.f, data.g, data.h, data.vars)
        return result
    except Exception as e:
        logger.error(f"Error in /api/nonlinear/reldeg: {str(e)}")
        raise HTTPException(status_code=400, detail="An error occurred during relative degree computation.")

@app.post("/api/simulate")
def simulate_system(data: LinearSystemInput):
    """
    Simulates the linear system response to a disturbance.
    x_dot = (A + BF)x + Ed
    y = Cx
    
    If DDP is solvable, F is computed such that y remains zero (approximately).
    """
    try:
        A = np.array(data.A)
        B = np.array(data.B)
        C = np.array(data.C)
        E = np.array(data.E) if data.E else np.zeros((A.shape[0], 1))
        
        is_solvable, V_star, F = check_disturbance_decoupling(A, B, E, C)
        
        if not is_solvable:
            F = np.zeros((B.shape[1], A.shape[0])) # No feedback
            
        # Simulation parameters
        dt = 0.01
        T = 10.0
        steps = int(T / dt)
        time = np.linspace(0, T, steps)
        
        # Initial state (can be zero or small perturbation)
        x = np.zeros(A.shape[0])
        
        # Disturbance signal (e.g., sine wave)
        # d(t) = sin(t)
        def disturbance(t):
            return np.sin(t)
            
        # Store results
        y_out = []
        x_out = []
        d_out = []
        
        # System matrix with feedback
        A_cl = A + B @ F
        
        for t in time:
            d_val = disturbance(t)
            # Simple Euler integration
            # dx = (A_cl x + E d)
            dx = A_cl @ x + E.flatten() * d_val
            x = x + dx * dt
            
            y_val = C @ x
            
            x_out.append(x.tolist())
            y_out.append(y_val.tolist())
            d_out.append(d_val)
            
        return {
            "time": time.tolist(),
            "y": y_out,
            "d": d_out,
            "is_ddp_solved": bool(is_solvable)
        }

    except Exception as e:
        logger.error(f"Error in /api/simulate: {str(e)}")
        raise HTTPException(status_code=400, detail="An error occurred during simulation.")
