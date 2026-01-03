import React from "react";
import ReactDOM from "react-dom/client";

function EndgameTemp() {
  return (
    <div style={{ padding: 24, fontFamily: "sans-serif", color: "white" }}>
      <h1 style={{ margin: 0, fontSize: 36 }}>EndGame ✅</h1>
      <p style={{ opacity: 0.85 }}>If you can see this in OBS, we’re serving correctly.</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EndgameTemp />
  </React.StrictMode>
);
