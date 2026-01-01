import React, { useState, useEffect, useRef } from "react";
import { Amplify } from "aws-amplify";
import { fetchAuthSession } from "aws-amplify/auth";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import awsExports from "./aws-exports";

Amplify.configure(awsExports);

// our API Gateway endpoint
const API_ENDPOINT =
  "https://eumo877d2e.execute-api.eu-north-1.amazonaws.com/v1";

const targetLanguages = [
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian" },
  { code: "am", name: "Amharic" },
  { code: "ar", name: "Arabic" },
  { code: "hy", name: "Armenian" },
  { code: "az", name: "Azerbaijani" },
  { code: "bn", name: "Bengali" },
  { code: "bs", name: "Bosnian" },
  { code: "bg", name: "Bulgarian" },
  { code: "ca", name: "Catalan" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "zh-TW", name: "Chinese (Traditional)" },
  { code: "hr", name: "Croatian" },
  { code: "cs", name: "Czech" },
  { code: "da", name: "Danish" },
  { code: "fa-AF", name: "Dari" },
  { code: "nl", name: "Dutch" },
  { code: "en", name: "English" }, // English is included here but is the fixed source
  { code: "et", name: "Estonian" },
  { code: "fa", name: "Farsi (Persian)" },
  { code: "tl", name: "Filipino, Tagalog" },
  { code: "fi", name: "Finnish" },
  { code: "fr", name: "French" },
  { code: "fr-CA", name: "French (Canada)" },
  { code: "ka", name: "Georgian" },
  { code: "de", name: "German" },
  { code: "el", name: "Greek" },
  { code: "gu", name: "Gujarati" },
  { code: "ht", name: "Haitian Creole" },
  { code: "ha", name: "Hausa" },
  { code: "he", name: "Hebrew" },
  { code: "hi", name: "Hindi" },
  { code: "hu", name: "Hungarian" },
  { code: "is", name: "Icelandic" },
  { code: "id", name: "Indonesian" },
  { code: "ga", name: "Irish" },
  { code: "it", name: "Italian" },
  { code: "ja", name: "Japanese" },
  { code: "kn", name: "Kannada" },
  { code: "kk", name: "Kazakh" },
  { code: "ko", name: "Korean" },
  { code: "lv", name: "Latvian" },
  { code: "lt", name: "Lithuanian" },
  { code: "mk", name: "Macedonian" },
  { code: "ms", name: "Malay" },
  { code: "ml", name: "Malayalam" },
  { code: "mt", name: "Maltese" },
  { code: "mr", name: "Marathi" },
  { code: "mn", name: "Mongolian" },
  { code: "no", name: "Norwegian (Bokmål)" },
  { code: "ps", name: "Pashto" },
  { code: "pl", name: "Polish" },
  { code: "pt", name: "Portuguese (Brazil)" },
  { code: "pt-PT", name: "Portuguese (Portugal)" },
  { code: "pa", name: "Punjabi" },
  { code: "ro", name: "Romanian" },
  { code: "ru", name: "Russian" },
  { code: "sr", name: "Serbian" },
  { code: "si", name: "Sinhala" },
  { code: "sk", name: "Slovak" },
  { code: "sl", name: "Slovenian" },
  { code: "so", name: "Somali" },
  { code: "es", name: "Spanish" },
  { code: "es-MX", name: "Spanish (Mexico)" },
  { code: "sw", name: "Swahili" },
  { code: "sv", name: "Swedish" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "th", name: "Thai" },
  { code: "tr", name: "Turkish" },
  { code: "uk", name: "Ukrainian" },
  { code: "ur", name: "Urdu" },
  { code: "uz", name: "Uzbek" },
  { code: "vi", name: "Vietnamese" },
  { code: "cy", name: "Welsh" },
];

const styles = {
  appContainer: {
    padding: "20px",
    maxWidth: "1000px",
    margin: "40px auto",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    boxShadow: "0 8px 30px rgba(0,0,0,0.1)",
    borderRadius: "12px",
    background: "#ffffff",
    border: "1px solid #e0e0e0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
  },
  title: {
    color: "#333",
    fontSize: "24px",
    margin: 0,
  },
  signOutButton: {
    padding: "8px 14px",
    background: "#f0f0f0",
    border: "1px solid #ccc",
    borderRadius: "6px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background 0.2s",
  },
  userInfo: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#555",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px",
  },
  languageBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
    padding: "0 10px",
  },
  fixedLanguage: {
    fontSize: "16px",
    fontWeight: "bold",
    padding: "8px",
    color: "#555",
    width: "300px",
    textAlign: "left",
  },
  swapButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "24px",
    color: "#007bff",
    padding: "0 10px",
    transition: "transform 0.2s",
  },
  panelsContainer: {
    display: "flex",
    flexDirection: "row",
    gap: "20px",
  },
  panel: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: "250px",
    background: "#f9f9f9",
    border: "1px solid #e0e0e0",
    borderRadius: "8px",
  },
  textarea: {
    flexGrow: 1,
    width: "100%",
    minHeight: "200px",
    fontSize: "18px",
    boxSizing: "border-box",
    padding: "15px",
    border: "none",
    borderRadius: "8px 8px 0 0",
    resize: "none",
    fontFamily: "inherit",
    background: "transparent",
  },
  resultBox: {
    flexGrow: 1,
    fontSize: "18px",
    padding: "15px",
    whiteSpace: "pre-wrap",
    color: "#333",
    background: "#f9f9f9",
    borderRadius: "8px 8px 0 0",
  },
  panelFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    borderTop: "1px solid #e0e0e0",
    background: "#fff",
    borderRadius: "0 0 8px 8px",
    minHeight: "24px",
  },
  charCount: {
    fontSize: "12px",
    color: "#888",
  },
  panelButton: {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    color: "#555",
  },
  submitButton: {
    fontSize: 16,
    padding: "12px 20px",
    cursor: "pointer",
    background: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "6px",
    display: "block",
    marginTop: "20px",
    width: "100%",
    fontWeight: "600",
  },
  submitButtonDisabled: {
    background: "#ccc",
    cursor: "not-allowed",
  },
  statusMessage: {
    textAlign: "center",
    fontSize: "18px",
    fontWeight: "500",
    marginTop: "20px",
  },
  statusFailed: {
    color: "#a94442",
    background: "#f2dede",
    padding: "10px",
    borderRadius: "6px",
  },
};

const LanguageSelector = ({ languages, value, onChange, id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const ref = useRef(null);

  const selectedLanguage =
    languages.find((lang) => lang.code === value) || languages[0];

  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(filter.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setIsOpen(false);
        setFilter("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref]);

  const handleSelect = (langCode) => {
    onChange(langCode);
    setIsOpen(false);
    setFilter("");
  };

  const toggleOpen = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setFilter("");
    }
  };

  const selectorStyle = {
    position: "relative",
    zIndex: 10,
  };

  const buttonStyle = {
    background: "transparent",
    border: "none",
    color: "#007bff",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "4px",
    transition: "background 0.2s",
  };

  const dropdownStyle = {
    position: "absolute",
    top: "110%",
    left: "0",
    width: "300px",
    background: "#fff",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    maxHeight: "300px",
    overflowY: "auto",
  };

  const searchInputStyle = {
    width: "100%",
    padding: "10px",
    fontSize: "14px",
    border: "none",
    borderBottom: "1px solid #eee",
    boxSizing: "border-box",
  };

  const listItemStyle = {
    padding: "10px 15px",
    cursor: "pointer",
    fontSize: "14px",
  };

  return (
    <div ref={ref} style={selectorStyle}>
      <button
        type="button"
        style={buttonStyle}
        onClick={toggleOpen}
        onMouseOver={(e) => (e.currentTarget.style.background = "#f0f0f0")}
        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
      >
        {selectedLanguage.name} {isOpen ? "▲" : "▼"}
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          <input
            id={id}
            type="text"
            style={searchInputStyle}
            placeholder="Search language..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            autoFocus
          />
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <li
                  key={lang.code}
                  style={listItemStyle}
                  onClick={() => handleSelect(lang.code)}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "#f9f9f9")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {lang.name}
                </li>
              ))
            ) : (
              <li style={{ ...listItemStyle, color: "#888" }}>No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---
function App({ signOut, user }) {
  // Hardcode the source language, since it's fixed (e.g., English)
  const sourceLanguage = "en";

  const [text, setText] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("es");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle"); // idle, pending, completed, failed
  const [translationId, setTranslationId] = useState(null);
  const pollInterval = useRef(null);

  // --- API LOGIC (Unchanged) ---
  const getIdToken = async () => {
    try {
      const session = await fetchAuthSession();
      return session?.tokens?.idToken?.toString() || null;
    } catch (err) {
      console.error("Failed to fetch auth session:", err);
      return null;
    }
  };

  useEffect(() => {
    const stopPolling = () => {
      if (pollInterval.current) {
        clearInterval(pollInterval.current);
        pollInterval.current = null;
      }
    };

    if (status === "pending" && translationId) {
      pollInterval.current = setInterval(async () => {
        try {
          const token = await getIdToken();
          if (!token) {
            throw new Error("Not authenticated");
          }
          const res = await fetch(`${API_ENDPOINT}/status/${translationId}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!res.ok) {
            const textErr = await res.text();
            throw new Error(`Status fetch failed: ${res.status} ${textErr}`);
          }
          const data = await res.json();
          if (data.status === "completed") {
            setResult(data.translatedText ?? "No translated text returned.");
            setStatus("completed");
            stopPolling();
          } else if (data.status === "failed") {
            setResult(`Error: ${data.error ?? "Translation failed"}`);
            setStatus("failed");
            stopPolling();
          }
        } catch (err) {
          console.error("Polling error:", err);
          setStatus("failed");
          setResult(`Error checking status: ${err.message}`);
          stopPolling();
        }
      }, 2000);
    }
    return stopPolling;
  }, [status, translationId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("pending");
    setResult("Translating..."); // Set result to a pending message
    setTranslationId(null);

    try {
      const token = await getIdToken();
      if (!token) {
        throw new Error("Not authenticated. Please sign in again.");
      }

      const res = await fetch(`${API_ENDPOINT}/translate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          text,
          sourceLanguage: sourceLanguage, // Use the hardcoded constant
          targetLanguage,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Translate request failed: ${res.status} ${errText}`);
      }
      const data = await res.json();
      if (data.translationId) {
        setTranslationId(data.translationId);
      } else {
        throw new Error(
          "Invalid response from server (missing translationId)."
        );
      }
    } catch (err) {
      console.error("Submit error:", err);
      setStatus("failed");
      setResult(`Submission failed: ${err.message}`);
    }
  };

  // --- NEW UI Handlers (Simplified) ---
  const handleTextChange = (e) => {
    setText(e.target.value);
    // Clear old results when user types
    if (status === "completed" || status === "failed") {
      setResult(null);
      setStatus("idle");
    }
  };

  const handleClearText = () => {
    setText("");
    setResult(null);
    setStatus("idle");
  };

  const handleCopy = () => {
    if (result && status === "completed") {
      navigator.clipboard.writeText(result);
    }
  };

  // The handleSwap function is now unnecessary, but for safety, it's removed
  // const handleSwap = () => { ... }

  // --- RENDER ---
  const isLoading = status === "pending";
  const hasResult = result !== null;

  return (
    <div style={styles.appContainer}>
      <div style={styles.header}>
        <h1 style={styles.title}>AWS Serverless Translator (English Source)</h1>
        <button
          onClick={signOut}
          style={styles.signOutButton}
          onMouseOver={(e) => (e.currentTarget.style.background = "#e0e0e0")}
          onMouseOut={(e) => (e.currentTarget.style.background = "#f0f0f0")}
        >
          Sign Out
        </button>
      </div>
      <p style={styles.userInfo}>
        Signed in as:{" "}
        <strong>
          {user?.username ?? user?.signInDetails?.loginId ?? "User"}
        </strong>
      </p>

      {/* Language Selection Bar (Source side is now fixed text) */}
      <div style={styles.languageBar}>
        {/* FIXED SOURCE LANGUAGE */}
        <div style={styles.fixedLanguage}>English (Source)</div>

        {/* Empty space for alignment where the swap button used to be */}
        <div style={{ width: "44px" }}></div>

        {/* TARGET LANGUAGE SELECTOR (Unchanged) */}
        <LanguageSelector
          id="target-lang-search"
          languages={targetLanguages}
          value={targetLanguage}
          onChange={setTargetLanguage}
        />
      </div>

      <form onSubmit={handleSubmit}>
        {/* Side-by-Side Panels */}
        <div style={styles.panelsContainer}>
          {/* Source Panel */}
          <div style={styles.panel}>
            <textarea
              style={styles.textarea}
              value={text}
              onChange={handleTextChange}
              placeholder="Enter text to translate from English"
              required
              maxLength={5000} // Added a max length
            />
            <div style={styles.panelFooter}>
              <span style={styles.charCount}>{text.length} / 5000</span>
              {text.length > 0 && (
                <button
                  type="button"
                  title="Clear text"
                  style={styles.panelButton}
                  onClick={handleClearText}
                >
                  ×
                </button>
              )}
            </div>
          </div>

          {/* Target Panel */}
          <div style={styles.panel}>
            <div
              style={{
                ...styles.resultBox,
                color: isLoading || status === "idle" ? "#888" : "#333",
              }}
            >
              {isLoading && "Translating..."}
              {status === "completed" && result}
              {status === "failed" && ""}
              {status === "idle" && !result && "Translation will appear here"}
            </div>
            <div style={styles.panelFooter}>
              {status === "completed" && result && (
                <button
                  type="button"
                  title="Copy to clipboard"
                  style={styles.panelButton}
                  onClick={handleCopy}
                >
                  📋
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || text.trim() === ""}
          style={{
            ...styles.submitButton,
            ...(isLoading || text.trim() === ""
              ? styles.submitButtonDisabled
              : {}),
          }}
        >
          {isLoading ? "Translating..." : "Translate"}
        </button>
      </form>

      {/* Status/Error Message Area */}
      {hasResult && status === "failed" && (
        <div style={{ ...styles.statusMessage, ...styles.statusFailed }}>
          {result}
        </div>
      )}
    </div>
  );
}

export default withAuthenticator(App);
