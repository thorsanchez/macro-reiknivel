import { useState } from "react";

function App() {
  const [text, setText] = useState("");
  const [macros, setMacros] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Macro Tracker</h1>
      <form
        onSubmit={async (e) =>
        {
          e.preventDefault();
          setLoading(true);
          try {
            const res = await fetch("http://localhost:4000/api/macros", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text }),
            });
            const data = await res.json();
            setMacros(data);
          } catch (err) {
            console.error(err);
            setMacros({ error: 'Failed to fetch macros' });
          }

          setLoading(false);
        }}
        className="flex flex-col gap-2 w-full max-w-md"
      >
        <input
          type="text"
          placeholder="I just ate..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          {loading ? "Calculating..." : "Sækja macros"}
        </button>
      </form>
      
      {/* Display macros results */}
      {macros && (
        <div className="mt-6 w-full max-w-md">
          {macros.error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              <strong>Error:</strong> {macros.error}
            </div>
          ) : (
            <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Macros</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-500">{macros.calories}</div>
                  <div className="text-sm text-gray-600">Kaloríur</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{macros.protein_g}g</div>
                  <div className="text-sm text-gray-600">Prótein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-500">{macros.carbs_g}g</div>
                  <div className="text-sm text-gray-600">Kolvetni</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">{macros.fat_g}g</div>
                  <div className="text-sm text-gray-600">Fita</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;