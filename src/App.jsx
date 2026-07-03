
import { useState } from "react";
import { BottomNav } from "./components/BottomNav";
export default function App() {
  // useState = App's memory. activeTab starts on "mine".
  const [activeTab, setActiveTab] = useState("mine");
  return (
    <div style={{ textAlign: "center", padding: 40 }}>
      <h1>⛏️ LitMiner</h1>
      <p>Active tab is: <b>{activeTab}</b></p>
      {/* We give the child a way to change OUR state (setActiveTab). */}
      <BottomNav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}