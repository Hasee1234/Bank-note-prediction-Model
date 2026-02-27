// "use client";
// import { useState } from "react";

// export default function Home() {
//   const [form, setForm] = useState({
//     variance: "",
//     skewness: "",
//     curtosis: "",
//     entropy: ""
//   });

//   const [result, setResult] = useState(null);

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const response = await fetch("http://127.0.0.1:8000/predict", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         variance: parseFloat(form.variance),
//         skewness: parseFloat(form.skewness),
//         curtosis: parseFloat(form.curtosis),
//         entropy: parseFloat(form.entropy),
//       }),
//     });

//     const data = await response.json();
//     setResult(data);
//   };

//   return (
//     <div style={{ padding: "40px" }}>
//       <h1>Bank Note Prediction</h1>

//       <form onSubmit={handleSubmit}>
//         {Object.keys(form).map((field) => (
//           <div key={field}>
//             <input
//               type="number"
//               step="any"
//               name={field}
//               placeholder={field}
//               value={form[field]}
//               onChange={handleChange}
//             />
//           </div>
//         ))}

//         <button type="submit">Predict</button>
//       </form>

//       {result && (
//         <div>
//           <h2>Result: {result.prediction}</h2>
//           <p>Confidence: {result.confidence}</p>
//         </div>
//       )}
//     </div>
//   );
// }

"use client";
import { useState } from "react";

export default function Home() {
  const [form, setForm] = useState({
    variance: "",
    skewness: "",
    curtosis: "",
    entropy: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isReal = (prediction) => prediction === "Real Note";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/predict`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            variance: parseFloat(form.variance),
            skewness: parseFloat(form.skewness),
            curtosis: parseFloat(form.curtosis),
            entropy: parseFloat(form.entropy),
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch prediction");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError("Unable to connect to prediction server.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ variance: "", skewness: "", curtosis: "", entropy: "" });
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl p-10">

        <h1 className="text-4xl font-bold text-center mb-2">
          Bank Note Authenticity
        </h1>
        <p className="text-center text-gray-500 mb-8">
          AI-powered counterfeit detection
        </p>

        <form onSubmit={handleSubmit}>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {Object.keys(form).map((field) => (
              <div key={field}>
                <label className="block text-sm font-semibold mb-2 capitalize">
                  {field}
                </label>
                <input
                  type="number"
                  step="any"
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-400 outline-none"
                  placeholder={`Enter ${field}`}
                />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
            >
              {loading ? "Analyzing..." : "Verify Authenticity"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="px-6 border border-gray-300 rounded-xl hover:bg-gray-100 transition"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-6 text-center text-red-600 font-medium">
            {error}
          </div>
        )}

        {/* Result Section */}
        {result && (
          <div
            className={`mt-8 p-6 rounded-xl ${
              isReal(result.prediction)
                ? "bg-green-50 border-l-8 border-green-500"
                : "bg-red-50 border-l-8 border-red-500"
            }`}
          >
            <h2
              className={`text-2xl font-bold mb-3 ${
                isReal(result.prediction)
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {result.prediction}
            </h2>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Confidence</span>
                <span>
                  {(result.confidence * 100).toFixed(2)}%
                </span>
              </div>

              <div className="w-full bg-gray-200 h-3 rounded-full">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    isReal(result.prediction)
                      ? "bg-green-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width: `${result.confidence * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
