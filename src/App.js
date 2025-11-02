import React, { useState, useEffect, useRef } from "react";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";

Amplify.configure(awsExports);

const API_ENDPOINT =
  "https://eumo877d2e.execute-api.eu-north-1.amazonaws.com/v1";
function App({ signOut, user }) {
  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");
  const [translationId, setTranslationId] = useState(null);
  const pollInterval = useRef(null);

  const getIdToken = async () => {
    try {
      const session = await fetchAuthSession();

      const token = session?.tokens?.idToken?.toString();
      return token || null;
    } catch (err) {
      console.error("Failed to fetch auth session:", err);
      return null;
    }
  };

  // Polling effect: checks /status/{id} every 2s while pending
  useEffect(() => {
    if (status === "pending" && translationId) {
      pollInterval.current = setInterval(async () => {
        try {
          const token = await getIdToken();
          const res = await fetch(`${API_ENDPOINT}/status/${translationId}`, {
            method: "GET",
            headers: token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : undefined,
          });

          if (!res.ok) {
            // If 4xx/5xx, throw to be caught below
            const textErr = await res.text();
            throw new Error(`Status fetch failed: ${res.status} ${textErr}`);
          }

          const data = await res.json();
          if (data.status === "completed") {
            setResult(data.translatedText ?? "No translated text returned");
            setStatus("completed");
            clearInterval(pollInterval.current);
          } else if (data.status === "failed") {
            setResult(`Error: ${data.error ?? "unknown"}`);
            setStatus("failed");
            clearInterval(pollInterval.current);
          } // else still in progress - keep polling
        } catch (err) {
          console.error("Polling error:", err);
          setStatus("failed");
          setResult("Error checking status.");
          if (pollInterval.current) clearInterval(pollInterval.current);
        }
      }, 2000);
    }

    return () => {
      if (pollInterval.current) clearInterval(pollInterval.current);
    };
  }, [status, translationId]);

  // Submit - POST /translate
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("pending");
    setResult("Translating...");

    try {
      const token = await getIdToken();
      const res = await fetch(`${API_ENDPOINT}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text,
          sourceLanguage: "auto",
          targetLanguage,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Translate request failed: ${res.status} ${errText}`);
      }

      const data = await res.json();

      // Expect backend to return { translationId: "..." } to poll
      if (data.translationId) {
        setTranslationId(data.translationId);
        // keep status as pending so polling starts
      } else if (data.translatedText) {
        // immediate result returned
        setResult(data.translatedText);
        setStatus("completed");
      } else {
        setResult("Unexpected response from server.");
        setStatus("failed");
      }
    } catch (err) {
      console.error("Submit error:", err);
      setStatus("failed");
      setResult("Submission failed. Please try again.");
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "700px",
        margin: "40px auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>AWS Serverless Translator</h1>
      <p style={{ marginBottom: 8 }}>
        Signed in as:{" "}
        <strong>
          {user?.username ?? user?.signInDetails?.loginId ?? "User"}
        </strong>
      </p>

      <form onSubmit={handleSubmit}>
        <textarea
          style={{
            width: "100%",
            minHeight: "120px",
            fontSize: "16px",
            boxSizing: "border-box",
            padding: 8,
          }}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text to translate"
          required
        />

        <div
          style={{ margin: "12px 0", display: "flex", alignItems: "center" }}
        >
          <label style={{ marginRight: 8 }}>Translate to:</label>
          <select
            value={targetLanguage}
            onChange={(e) => setTargetLanguage(e.target.value)}
            style={{ fontSize: 16, padding: 6 }}
          >
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="ja">Japanese</option>
            <option value="ar">Arabic</option>
            <option value="hi">Hindi</option>
            <option value="te">Telugu</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={status === "pending"}
          style={{ fontSize: 16, padding: "10px 18px", cursor: "pointer" }}
        >
          {status === "pending" ? "Translating..." : "Translate"}
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: 20,
            padding: 16,
            border: "1px solid #ccc",
            background: "#f9f9f9",
          }}
        >
          <h2>Result</h2>
          <p style={{ fontSize: 18, whiteSpace: "pre-wrap" }}>{result}</p>
        </div>
      )}

      <div style={{ marginTop: 26 }}>
        <button onClick={signOut} style={{ padding: "8px 12px" }}>
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default withAuthenticator(App);
