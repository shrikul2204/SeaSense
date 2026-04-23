import os
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

from flask import Flask, request, jsonify
from flask_cors import CORS
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import json
from pollution.pollution_level import get_pollution_data
from pollution.freshwater import get_freshwater_data

app = Flask(__name__)
CORS(app)

# Load models
freshwater_model = load_model("fish_model_5class.keras")
seawater_model = load_model("marine_fish_model.keras")

# Freshwater classes
freshwater_classes = ['Catfish', 'Gold Fish', 'Indian Carp', 'Knifefish', 'Silver Carp']

# Load seawater classes from JSON (BEST)
with open("class_names.json", "r") as f:
    seawater_classes = json.load(f)

# ----------------------------
# Preprocessing functions
# ----------------------------

# Freshwater model preprocessing (if old model was trained with /255.0)
def preprocess_freshwater(img):
    img = img.resize((224, 224))
    img_array = np.array(img).astype("float32") / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

# Seawater model preprocessing (IMPORTANT: NO /255.0)
def preprocess_seawater(img):
    img = img.resize((224, 224))
    img_array = np.array(img).astype("float32")
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route('/pollution', methods=['POST'])
def pollution_route():
    data = request.json

    # Get selected region (ocean OR state)
    region = data.get("region")

    # Ocean mapping
    ocean_map = {
        "Pacific": "Pacific Ocean",
        "Atlantic": "Atlantic Ocean",
        "Indian": "Indian Ocean",
        "Southern": "Southern Ocean",
        "Arctic": "Arctic Ocean"
    }

    # 🌊 If selected region is an ocean
    if region in ocean_map:
        ocean = ocean_map[region]
        result = get_pollution_data(ocean)

    # 💧 Otherwise treat it as freshwater (state)
    else:
        result = get_freshwater_data(region)

    return jsonify(result)

@app.route('/')
def home():
    return "Fish Classifier API Running 🚀"

@app.route('/predict', methods=['POST'])
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image received"}), 400

    category = request.form.get("category")  # freshwater / seawater
    file = request.files['image']

    img = Image.open(file).convert('RGB')

    # Select model + preprocessing + class labels
    if category == "freshwater":
        model = freshwater_model
        class_names = freshwater_classes
        processed_img = preprocess_freshwater(img)

    elif category == "seawater":
        model = seawater_model
        class_names = seawater_classes
        processed_img = preprocess_seawater(img)

    else:
        return jsonify({"error": "Invalid category"}), 400

    # Predict
    prediction = model.predict(processed_img)[0]
    class_index = int(np.argmax(prediction))
    confidence = float(np.max(prediction))

    # Top 3 predictions
    top_indices = prediction.argsort()[-3:][::-1]
    top_3 = [
        {
            "class": class_names[i],
            "confidence": round(float(prediction[i]))
        }
        for i in top_indices
    ]

    # Debug prints (VERY useful)
    print("Prediction array:", prediction)
    print("Predicted index:", class_index)
    print("Predicted class:", class_names[class_index])

    return jsonify({
        "category": category,
        "species": class_names[class_index],
        "confidence": round(confidence, 2),
        "top_3_predictions": top_3
    })

if __name__ == "__main__":
    app.run(debug=True)