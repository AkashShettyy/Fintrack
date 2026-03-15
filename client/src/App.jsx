import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route
          path="/"
          element={
            <div className="flex items-center justify-center h-screen bg-gray-900">
              <h1 className="text-4xl font-bold text-white">FinTrack 💸</h1>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
