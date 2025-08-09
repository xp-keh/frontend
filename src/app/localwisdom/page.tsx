'use client';
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
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="p-12 max-w-screen mx-auto bg-black text-white min-h-screen">
        <div className="bg-[#14151d] p-6 rounded-xl shadow-md space-y-4 mb-6">
          <h1 className="text-xl font-bold mb-4">Local Wisdom Analyzer</h1>

          <div>
            <label className="block mb-1 font-medium">Enter Query</label>
            <input
              type="text"
              placeholder="e.g., Perubahan warna air di sungai berarti tanda akan banjir"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border bg-[#1d1f2b] border-[#444654] p-2 rounded text-white"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-[#1d1f2b] hover:bg-[#2a2d3e] border border-[#444654] text-white font-semibold px-4 py-2 rounded"
          >
            {loading ? "Analyzing..." : "Analyze"}
          </button>

          {error && (
            <p className="text-red-500 text-sm mt-4">⚠️ {error}</p>
          )}
        </div>

        {result && (
          <div className="space-y-6">
            {/* Decomposition */}
            <div className="bg-[#14151d] p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold mb-2">Decomposition</h2>
              <p><strong>Bencana:</strong> {result.decomposition?.bencana}</p>
              <p><strong>Objek:</strong> {result.decomposition?.objek}</p>
              <p><strong>Peristiwa:</strong> {result.decomposition?.peristiwa}</p>
            </div>

            {/* Similarity */}
            <div className="bg-[#14151d] p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold mb-2">Similarity</h2>
              <p>{result.similarity}</p>
            </div>

            {/* Notes */}
            <div className="bg-[#14151d] p-6 rounded-xl shadow-md">
              <h2 className="text-lg font-semibold mb-2">Notes</h2>
              <p>{result.notes}</p>
            </div>

            {/* References */}
            {result.ref?.length > 0 && (
              <div className="bg-[#14151d] p-6 rounded-xl shadow-md">
                <h2 className="text-lg font-semibold mb-4">References</h2>
                {result.ref.map((ref: any, index: number) => (
                  <details
                    key={index}
                    className="bg-[#1d1f2b] border border-[#444654] p-4 rounded-md mb-3"
                  >
                    <summary className="cursor-pointer font-medium">
                      {ref.title}
                    </summary>
                    <div className="mt-2 text-sm space-y-1">
                      <p><strong>Halaman:</strong> {ref.page}</p>
                      <p><strong>Referensi:</strong> {ref.reference}</p>
                    </div>
                  </details>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}