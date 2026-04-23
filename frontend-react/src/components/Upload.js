import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const handleChange = (e) => {
    const f = e.target.files[0];
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first");
      return;
    }

    const formData = new FormData();
    formData.append("image", file); // MUST MATCH BACKEND

    setLoading(true);

    try {
      console.log(file);
      const res = await fetch("http://127.0.0.1:5000/predict", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("Response:", data);

      setResult(data);
    } catch (err) {
      console.error(err);
      setResult({ error: "Failed to connect to backend" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Fish Species Classifier</h2>

      <input type="file" onChange={handleChange} />

      {preview && (
        <div>
          <img src={preview} alt="preview" width="250" />
        </div>
      )}

      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Processing..." : "Predict"}
      </button>

      {result && !result.error && (
        <div>
          <h3>{result.prediction}</h3>
          <p>Confidence: {result.confidence}%</p>
        </div>
      )}

      {result?.error && <p>{result.error}</p>}
    </div>
  );
}
