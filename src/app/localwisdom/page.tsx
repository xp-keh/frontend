"use client";
import { useState } from "react";
import Navbar from "../../components/Navbar";
import { analyzeLocalWisdom } from "@/actions/localwisdom";

export default function LocalWisdomAnalyzer() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const response = await analyzeLocalWisdom(query);

    if (response.error) {
      setError(response.error);
    } else {
      setResult(response);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4">Local Wisdom Analyzer</h1>

      <input
        type="text"
        placeholder="Enter your query..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded mb-4"
      />

      <button
        onClick={handleAnalyze}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        {loading ? "Analyzing..." : "Analyze"}
      </button>

      {error && <p className="mt-4 text-red-600">Error: {error}</p>}

      {result && (
        <div className="mt-6 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Decomposition</h2>
            <p>
              <strong>Bencana:</strong> {result.decomposition?.bencana}
            </p>
            <p>
              <strong>Objek:</strong> {result.decomposition?.objek}
            </p>
            <p>
              <strong>Peristiwa:</strong> {result.decomposition?.peristiwa}
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Similarity</h2>
            <p>{result.similarity}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">Notes</h2>
            <p>{result.notes}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold">References</h2>
            {result.ref?.map((ref: any, index: number) => (
              <details key={index} className="border p-2 rounded mb-2">
                <summary className="cursor-pointer font-medium">
                  {ref.title}
                </summary>
                <p>
                  <strong>Halaman:</strong> {ref.page}
                </p>
                <p>
                  <strong>Referensi:</strong> {ref.reference}
                </p>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
