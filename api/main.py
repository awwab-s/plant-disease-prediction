from fastapi import FastAPI, File, UploadFile
import uvicorn
import numpy as np
from io import BytesIO
import tensorflow as tf
from PIL import Image

app = FastAPI()

MODEL = tf.keras.models.load_model("../models/v1.keras")
CLASS_NAMES = ["Early Blight", "Late Blight", "Healthy"]

@app.get("/ping")
async def ping():
    return {"message": "hello!"}

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
  
  prediction = MODEL.predict(img_batch)
  
  predicted_class = CLASS_NAMES[np.argmax(prediction[0])]
  confidence = np.max(prediction[0])
  
  return {
    "class": predicted_class, 
    "confidence": float(confidence)
  }


if __name__ == "__main__":
    uvicorn.run(app, port=8000, host="localhost")