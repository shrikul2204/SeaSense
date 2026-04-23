# 🌊 SeaSense

**AI-Powered Marine Pollution Monitoring & Risk Analysis System**

---

## 📌 Overview

SeaSense is an intelligent environmental monitoring system designed to analyze marine pollution levels and assess associated risks. It integrates data processing, predictive analysis, and visualization to provide meaningful insights for decision-making.

The system evaluates pollution indices, confidence levels, and risk categories, helping users understand environmental conditions effectively.

---

## 🚀 Features

* 📊 Pollution Index Analysis
* ⚠️ Risk Level Classification (Low / Moderate / High)
* 📈 Confidence Score Evaluation
* 🧠 Data-driven Predictions using Machine Learning
* 🌐 Interactive Frontend Dashboard
* 🔗 REST API-based Backend Communication
* 🐳 Docker Support for Easy Deployment

---

## 🏗️ Project Structure

```
SeaSense/
│
├── backend/              # Backend (API, ML models, processing)
├── frontend-react/       # Frontend (React UI)
├── data/                 # Dataset / Input files
├── Dockerfile            # Container setup
├── docker-compose.yml    # Multi-container setup
├── requirements.txt      # Python dependencies
├── package-lock.json     # Node dependencies
└── README.md
```

---

## ⚙️ Tech Stack

### Backend

* Python
* Flask / FastAPI
* Machine Learning Libraries (NumPy, Pandas, TensorFlow)

### Frontend

* React.js
* JavaScript
* HTML/CSS

### DevOps

* Docker
* Git & GitHub

---

## 🛠️ Installation & Setup

### 1️⃣ Clone the Repository

```
git clone https://github.com/your-username/seasense.git
cd seasense
```

---

### 2️⃣ Backend Setup

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

### 3️⃣ Frontend Setup

```
cd frontend-react
npm install
npm start
```

---

### 4️⃣ Run Backend Server

```
cd backend
python app.py
```

---

### 🐳 Docker Setup (Optional)

```
docker-compose up --build
```

---

## 📊 How It Works

1. User inputs environmental data
2. Backend processes data using ML models
3. System calculates:

   * Pollution Index
   * Confidence Score
   * Risk Level
4. Results are displayed on the frontend dashboard

---

## 🎯 Use Cases

* Environmental Monitoring Agencies
* Smart City Systems
* Research & Analysis Projects
* Academic Demonstrations

---

## ⚠️ Important Notes

* Virtual environments (`venv/`, `.venv/`) are excluded from the repository
* Large model files should not be pushed to GitHub
* Use `requirements.txt` to install dependencies

---

## 🤝 Contributing

Contributions are welcome. Feel free to fork the repository and submit a pull request.

---

## 📜 License

This project is for academic and educational purposes.

---

## 👨‍💻 Authors

**Alisha Kirtikar**
**Shriram Kulkarni**
**Mrunmayee Patil**
**Sharvari Patil**
Third Year Computer Engineering Student

---

## 🌟 Future Enhancements

* Real-time IoT sensor integration
* Advanced predictive analytics
* Cloud deployment (AWS/GCP)
* Mobile application support

---
