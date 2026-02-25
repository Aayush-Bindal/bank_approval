from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os
import numpy as np

app = FastAPI(title="HDFC AI Loan Decision API")

# Load the model on startup (Place your .pkl files in the same backend folder)
MODEL_PATH = os.path.join(os.path.dirname(__file__), "model.pkl")
SCALER_PATH = os.path.join(os.path.dirname(__file__), "scaler.pkl")

try:
    ml_model = joblib.load(MODEL_PATH)
    print(f"Model loaded successfully from {MODEL_PATH}")
except Exception as e:
    print(f"Warning: Could not load model. Ensure model.pkl is in the backend folder. Error: {e}")
    ml_model = None

try:
    scaler = joblib.load(SCALER_PATH)
    print(f"Scaler loaded successfully from {SCALER_PATH}")
except Exception as e:
    print(f"Warning: Could not load scaler. Ensure scaler.pkl is in the backend folder. Error: {e}")
    scaler = None

# Configure CORS (Cross-Origin Resource Sharing)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, change this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Define the exact data structure we expect from the React form
class LoanApplication(BaseModel):
    Applicant_ID: str = ""
    Gender: str = ""
    Age: int = 0
    Marital_Status: str = ""
    Dependents: int = 0
    Education: str = ""
    City_Town: str = ""
    Residential_Status: str = ""
    Employment_Status: str = ""
    Occupation_Type: str = ""
    Annual_Income: int = 0
    Monthly_Expenses: int = 0
    Credit_Score: int = 0
    Existing_Loans: int = 0
    Total_Existing_Loan_Amount: int = 0
    Outstanding_Debt: int = 0
    Loan_History: str = ""
    Loan_Amount_Requested: int = 0
    Loan_Term: int = 0
    Loan_Purpose: str = ""
    Interest_Rate: float = 0.0
    Loan_Type: str = ""
    Co_Applicant: str = ""
    Bank_Account_History: str = ""
    Transaction_Frequency: str = ""
    Default_Risk: str = ""

@app.post("/predict")
async def predict_loan(application: LoanApplication):
    """
    This endpoint receives the loan application data, runs the AI model,
    and returns an approval decision.
    """
    
    if ml_model is None or scaler is None:
        raise HTTPException(
            status_code=503, 
            detail="Machine Learning models are not loaded. Please ensure model.pkl and scaler.pkl exist."
        )

    try:
        # 1. Convert incoming React data to a Pandas DataFrame
        data_dict = application.dict()
        df = pd.DataFrame([data_dict])
        
        # 2. Rename UI keys to match the exact columns used in training
        df = df.rename(columns={
            "City_Town": "City/Town",
            "Co_Applicant": "Co-Applicant"
        })

        # 3. Drop unique identifier just like Step 1 in your training code
        if 'Applicant_ID' in df.columns:
            df = df.drop('Applicant_ID', axis=1)

        # 4. Feature Engineering (Step 2 in your code: DTI_Ratio)
        monthly_income = df['Annual_Income'] / 12
        monthly_income = monthly_income.replace(0, 1) # Prevent division by zero errors
        df['DTI_Ratio'] = df['Monthly_Expenses'] / monthly_income
        
        # 5. Encoding Categorical Variables (Step 3 in your code)
        # a. Binary Columns (Mimicking LabelEncoder's alphabetical ordering)
        binary_mappings = {
            'Gender': {'Female': 0, 'Male': 1, 'Other': 2},
            'Marital_Status': {'Married': 0, 'Single': 1},
            'Education': {'Graduate': 0, 'Not Graduate': 1},
            'Loan_Type': {'Secured': 0, 'Unsecured': 1},
            'Co-Applicant': {'No': 0, 'Yes': 1}
        }
        for col, mapping in binary_mappings.items():
            if col in df.columns:
                df[col] = df[col].map(mapping).fillna(0) # Default to 0 if unknown category

        # b. One-Hot Encoding for nominal categories
        nominal_cols = ['Employment_Status', 'Occupation_Type', 'Residential_Status', 'City/Town', 'Loan_Purpose']
        df = pd.get_dummies(df, columns=[c for c in nominal_cols if c in df.columns])

        # 6. Column Alignment: The model expects the exact dummy columns created during training.
        if hasattr(ml_model, 'feature_names_in_'):
            expected_cols = ml_model.feature_names_in_
            df = df.reindex(columns=expected_cols, fill_value=0)
        else:
            raise ValueError("Model missing 'feature_names_in_'. Ensure it was trained with Pandas DataFrames.")

        # 7. Feature Scaling (Step 4 in your code)
        X_scaled = scaler.transform(df)
        
        # 8. Predict using the loaded ML model
        prediction = ml_model.predict(X_scaled)[0]
        
        # 9. Extract confidence score (using predict_proba)
        try:
            probabilities = ml_model.predict_proba(X_scaled)[0]
            confidence = f"{round(max(probabilities) * 100, 1)}%"
        except AttributeError:
            confidence = "N/A (Model does not support probabilities)" 

        # Map the numerical prediction target back to a string response
        status = "Approved" if str(prediction) in ["1", "Y", "Yes", "Approved"] else "Rejected"
        
        return {
            "status": status,
            "confidence": confidence,
            "reasons": [
                "DTI Ratio accurately calculated.",
                "Applicant background passed through Random Forest Classifier.",
                "Status successfully determined based on training thresholds."
            ]
        }
        
    except Exception as e:
        print(f"Prediction Error: {e}")
        # Return a 500 Internal Server Error if something fails in the pipeline
        raise HTTPException(status_code=500, detail=f"Error processing prediction: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Loan Approval API is running! Send a POST request to /predict."}