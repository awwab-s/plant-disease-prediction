import { useState } from "react";
import axios from "axios";
import { Leaf, Upload, Loader2 } from "lucide-react";
import bg from "./assets/bg5.jpg";

const API_ENDPOINT = import.meta.env.VITE_API_PROD_ENDPOINT;
// const API_ENDPOINT = import.meta.env.VITE_API_DEV_ENDPOINT;

export default function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const diseaseStyles = {
    "Healthy": "text-green-800",
    "Early Blight": "text-yellow-800",
    "Late Blight": "text-red-800",
  }

  const confidenceStyles = {
    high: "text-green-800",
    medium: "text-yellow-800",
    low: "text-red-800",
  }

  const setConfidenceStyle = (confidence) => {
    if (confidence >= 0.90) return confidenceStyles.high;
    if (confidence >= 0.75) return confidenceStyles.medium;
    return confidenceStyles.low;
  };

  const handleFile = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const predictDisease = async () => {
    if (!image || loading) return;

    const formData = new FormData();
    formData.append("file", image);

    try {
      setLoading(true);
      const response = await axios.post(API_ENDPOINT, formData);
      setResult(response.data);
    } catch (err) {
      alert("Prediction failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen bg-cover bg-center flex items-center justify-center px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>

      {/* Card */}
      <div className="relative bg-white/30 backdrop-blur-xl rounded-2xl shadow-xl max-w-md w-full p-6 text-white">

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Leaf className="text-green-400 " />
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
            Potato Plant Disease Predictor
          </h1>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-green-500/60 transition duration-200
            ${dragActive ? "border-white/40 bg-white/20" : "border-white/40"}`}
        >
          <label className="cursor-pointer flex flex-col items-center gap-2">
            <Upload />
            <span className="text-sm">
              Drag & drop leaf image or click to upload
            </span>
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </label>
        </div>

        {/* Preview */}
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-4 rounded-xl w-full max-h-54 object-cover"
          />
        )}

        {/* Button */}
        <button
          onClick={predictDisease}
          disabled={loading || !image}
          className="mt-4 w-full bg-green-600 text-white py-2 rounded-xl font-semibold
            flex items-center justify-center gap-2
            transition duration-200
            enabled:hover:bg-green-700
            enabled:hover:cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" />
              Predicting...
            </>
          ) : (
            "Predict Disease"
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="mt-4 p-4 rounded-xl bg-white/30">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="text-sm text-left font-semibold text-white/70 pb-1">Prediction</td>
                  <td className="text-sm text-right font-semibold text-white/70 pb-1">Confidence</td>
                </tr>
                <tr>
                  <td className="text-lg text-left font-bold text-white">
                    <span
                      className={`${
                        diseaseStyles[result.class]
                      }`}
                    >
                      {result.class}
                    </span>
                  </td>
                  <td className="text-lg text-right font-bold text-white">
                    <span
                      className={`${
                        setConfidenceStyle(result.confidence)
                      }`}
                    >
                      {(result.confidence * 100).toFixed(2)}%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
