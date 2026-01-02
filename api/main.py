from fastapi import FastAPI, File, UploadFile, Response
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
import numpy as np
from io import BytesIO
import tensorflow as tf
from PIL import Image

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.model = tf.keras.models.load_model("../models/v1.keras")
    print("✅ Model loaded successfully")
    yield

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://plant-disease-awb.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = None
print("Model loaded successfully")
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

@app.api_route("/ping", methods=["GET", "HEAD"])
def ping(response: Response):
    return {"status": "ok"}

def read_file_as_image(data) -> np.ndarray:
    image = np.array(Image.open(BytesIO(data)))
    return image

@app.post("/predict")
async def predict(
  file: UploadFile = File(...)
):
  print("Received file:", file.filename)
  image = read_file_as_image(await file.read())
  img_batch = np.expand_dims(image, 0)
  
  prediction = app.state.model.predict(img_batch)
  
  predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
  confidence = np.max(prediction[0])
  
  return {
    "class": predicted_class, 
    "confidence": float(confidence)
  }


if __name__ == "__main__":
    uvicorn.run(app, port=8000, host="localhost")