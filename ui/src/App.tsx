import { useState, useEffect, useCallback } from "react";
import HyperwareClientApi from "@hyperware-ai/client-api";
import "./App.css";
import useHyperprocessStore from "./store/hyperprocess";
import { SubmitEntry, ViewState } from "./types/Hyperprocess";

const BASE_URL = import.meta.env.BASE_URL;
if (window.our) window.our.process = BASE_URL?.replace("/", "");

const PROXY_TARGET = `${(import.meta.env.VITE_NODE_URL || "http://localhost:8080")}${BASE_URL}`;

// This env also has BASE_URL which should match the process + package name
const WEBSOCKET_URL = import.meta.env.DEV
  ? `${PROXY_TARGET.replace('http', 'ws')}/ws`
  : undefined;

function App() {
  const { items, setStateItems } = useHyperprocessStore();
  const [nodeConnected, setNodeConnected] = useState(true);
  const [_api, setApi] = useState<HyperwareClientApi | undefined>();
  const [newEntry, setNewEntry] = useState("");

  const fetchState = useCallback(async () => {
    const requestData: ViewState = { ViewState: "" };
    let responseText = ""; // Variable to hold raw text

    try {
      const result = await fetch(`${BASE_URL}/api`, {
        method: "POST",
        body: JSON.stringify(requestData), 
      });

      responseText = await result.text(); // Get raw response text first

      if (!result.ok) {
        console.error(`HTTP request failed: ${result.status} ${result.statusText}. Response:`, responseText);
        throw new Error(`HTTP request failed: ${result.statusText}`);
      }
      
      // Attempt to parse the raw text as JSON
      const responseData = JSON.parse(responseText); 
      
      // Check if the parsed response is an array
      if (Array.isArray(responseData)) {
        console.log("Fetched state (as direct array):", responseData); 
        // Assuming the array contains strings based on previous context
        setStateItems(responseData as string[]); 
      } else {
        // Handle cases where the response is not an array (e.g., error object, unexpected format)
        console.error("Error fetching state: Response was not the expected array.", "Raw Response:", responseText, "Parsed:", responseData); 
        setStateItems([]);
      }
    } catch (error) {
       // Catch fetch errors or JSON parsing errors
      console.error("Failed to fetch state:", error, "Raw Response:", responseText);
      setStateItems([]);
    }
  }, [setStateItems]);

  const handleSubmitEntry = useCallback(async () => {
    if (!newEntry.trim()) return;
    const requestData: SubmitEntry = { SubmitEntry: newEntry };
    let responseText = ""; // Variable to hold raw text

    try {
      const result = await fetch(`${BASE_URL}/api`, {
        method: "POST",
        body: JSON.stringify(requestData),
      });

      responseText = await result.text(); // Get raw response text

      if (!result.ok) {
        console.error(`HTTP request failed: ${result.status} ${result.statusText}. Response:`, responseText);
        throw new Error(`HTTP request failed: ${result.statusText}`);
      }

      // Check if the raw response text is "true" for success
      if (responseText === "true") { 
        console.log("Entry submitted successfully");
        setNewEntry("");
        fetchState(); // Refresh state list
      } else {
        // Handle cases where the response is not "true" (might be an error string or unexpected value)
        console.error("Error submitting entry: Unexpected response.", "Raw Response:", responseText);
      }
    } catch (error) {
      // Catch fetch errors or errors from result.text()
      console.error("Failed to submit entry:", error, "Raw Response:", responseText);
    }
  }, [newEntry, fetchState]);

  useEffect(() => {
    // Fetch initial state when the component mounts
    fetchState(); 

    // Set up WebSocket connection
    if (window.our?.node && window.our?.process) {
      const api = new HyperwareClientApi({
        uri: WEBSOCKET_URL,
        nodeId: window.our.node,
        processId: window.our.process,
        onOpen: (_event, _api) => {
          console.log("Connected to Hyperware");
        },
        onMessage: (json, _api) => {
          console.log('WEBSOCKET MESSAGE', json)
          try {
            const data = JSON.parse(json);
            console.log("WebSocket received message", data);
            // TODO: Handle potential state updates pushed via WebSocket?
            // For example, if a message indicates new state, call fetchState()
          } catch (error) {
            console.error("Error parsing WebSocket message", error);
          }
        },
      });

      setApi(api);
    } else {
      setNodeConnected(false);
    }
  }, []); 

  return (
    <div style={{ width: "100%" }}>
      <div style={{ position: "absolute", top: 4, left: 8 }}>
        ID: <strong>{window.our?.node}</strong>
      </div>
      {!nodeConnected && (
        <div className="node-not-connected">
          <h2 style={{ color: "red" }}>Node not connected</h2>
          <h4>
            You need to start a node at {PROXY_TARGET} before you can use this UI
            in development.
          </h4>
        </div>
      )}
      <h2>Hyperprocess State Viewer</h2>
      <div className="card">
        <div style={{ border: "1px solid gray", padding: "1em", marginBottom: '1em' }}>
          <h3 style={{ marginTop: 0, textAlign: 'left' }}>Submit New Entry</h3>
          <input 
            type="text" 
            value={newEntry} 
            onChange={(e) => setNewEntry(e.target.value)} 
            placeholder="Enter new state item"
            style={{ marginRight: '0.5em', padding: '0.5em' }}
          />
          <button onClick={handleSubmitEntry}>Submit Entry</button>
        </div>
        <div style={{ border: "1px solid gray", padding: "1em" }}>
          <h3 style={{ marginTop: 0, textAlign: 'left' }}>Current State</h3>
          <div>
            {items.length > 0 ? (
              <ul className="message-list">
                {items.map((item, index) => (
                  <li key={index} className="signed-message">
                    <div className="message-content">
                      <span className="message-text">{item}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No state items found or failed to load.</p>
            )}
          </div>
          <button onClick={fetchState} style={{ marginTop: '1em' }}>Refresh State</button>
        </div>
      </div>
    </div>
  );
}

export default App;
