from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
import pickle
from keras.models import load_model

# -------------------------------
# Initialize FastAPI App
# -------------------------------
app = FastAPI(title="Bank Note Prediction API")

# -------------------------------
# Enable CORS (for Next.js frontend)
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace "*" with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# Load Model & Scaler
# -------------------------------
model = load_model("models/Bank_Note_Prediction_Model.h5")

with open("models/scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

# -------------------------------
# Request Schema
# -------------------------------
class NoteData(BaseModel):
    variance: float
    skewness: float
    curtosis: float
    entropy: float

# -------------------------------
# Routes
# -------------------------------

@app.get("/")
def home():
    return {"message": "Bank Note Prediction API is running 🚀"}


@app.post("/predict")
def predict(data: NoteData):

    # Convert input into numpy array
    input_data = np.array([[
        data.variance,
        data.skewness,
        data.curtosis,
        data.entropy
    ]])

    # Scale input
    input_scaled = scaler.transform(input_data)

    # Predict
    prediction = model.predict(input_scaled)
    confidence = float(prediction[0][0])

    predicted_class = 1 if confidence > 0.5 else 0

    result = "Real Note" if predicted_class == 1 else "Fake Note"

    return {
        "prediction": result,
        "confidence": confidence
    }
