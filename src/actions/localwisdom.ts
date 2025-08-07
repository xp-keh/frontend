"use server";

export async function analyzeLocalWisdom(query: string) {
  if (!query.trim()) return { error: "Query is empty" };

  try {
    const res = await fetch("http://85.209.163.202:5050/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Server error");
    }

    return data;
  } catch (err: any) {
    return { error: err.message || "Unexpected error" };
  }
}
