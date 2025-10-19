import React, { useEffect, useMemo, useRef, useState } from "react";

/**
 * ProductImportSettings
 * Local file picker version
 *
 * Changes:
 *  - Removed URL field entirely.
 *  - Added file picker (uses File System Access API when available; falls back to <input type="file">).
 *  - Reads/validates JSON directly from the chosen file.
 *  - Periodic import works only when we have a live file handle with permission (Chromium-based browsers).
 *
 * Persisted in localStorage:
 *  - import.periodic (boolean as string)
 *  - import.lastResult (JSON for last run)
 *  - import.lastFileName (for display only)
 */

const LS_KEYS = {
  periodic: "import.periodic",
  last: "import.lastResult",
  fileName: "import.lastFileName",
  interval: "import.intervalMinutes",
};

const DEFAULT_INTERVAL_MIN = 15; // minutes

const cardStyle = {
  maxWidth: 780,
  margin: "40px auto",
  padding: 24,
  borderRadius: 16,
  boxShadow: "0 2px 6px rgba(0,0,0,0.06), 0 12px 24px rgba(0,0,0,0.06)",
  background: "linear-gradient(180deg, #ffffff, #fafbff)",
  border: "1px solid #eef0f6",
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial",
};

const labelStyle = { fontSize: 13, fontWeight: 600, color: "#495170" };
const rowStyle = { display: "flex", alignItems: "center", gap: 12 };
const switchStyle = {
  appearance: "none",
  width: 44,
  height: 26,
  borderRadius: 26,
  position: "relative",
  background: "#d6dbe8",
  outline: "none",
  border: "none",
  cursor: "pointer",
};

const inputButtonStyle = {
  padding: "10px 14px",
  borderRadius: 10,
  border: "1px solid #d9deea",
  background: "#f8faff",
  cursor: "pointer",
  fontWeight: 600,
};

const secondaryButtonStyle = {
  padding: "8px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};

const sectionStyle = { marginTop: 16 };
const dividerStyle = {
  height: 1,
  background: "#eef0f6",
  margin: "16px 0",
};

const badge = (text, tone = "neutral") => {
  const map = {
    success: { bg: "#e9f9ee", fg: "#117a3d" },
    danger: { bg: "#fdecec", fg: "#b21d1d" },
    warn: { bg: "#fff6e6", fg: "#a76b00" },
    info: { bg: "#eef6ff", fg: "#1f5aa9" },
    neutral: { bg: "#f3f5fa", fg: "#495170" },
  }[tone];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 10px",
        borderRadius: 999,
        background: map.bg,
        color: map.fg,
        fontSize: 12,
        fontWeight: 600,
      }}
    >
      {text}
    </span>
  );
};

function formatTime(ts) {
  if (!ts) return "—";
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return String(ts);
  }
}

function validateProducts(json) {
  // Expected: an array of objects with stable field names
  if (!Array.isArray(json)) {
    return {
      ok: false,
      kind: "structure",
      message: "Unexpected structure: expected a JSON array of products.",
    };
  }

  // Stable schema — description is optional and can be null
  const required = ["ID", "productID", "name", "price", "currency", "stock"]; // description optional

  for (let i = 0; i < json.length; i++) {
    const item = json[i];
    if (typeof item !== "object" || item == null) {
      return {
        ok: false,
        kind: "structure",
        message: `Unexpected structure at index ${i}: expected an object for each product.`,
      };
    }

    // Presence checks for exact keys
    for (const key of required) {
      if (!(key in item)) {
        return {
          ok: false,
          kind: "missing",
          message: `Missing required field: ${key} at product index ${i}.`,
        };
      }
    }

    // Type sanity checks (lightweight)
    if (typeof item.ID !== "string" || !item.ID.trim()) {
      return {
        ok: false,
        kind: "structure",
        message: `Field \"ID\" must be a non-empty string at product index ${i}.`,
      };
    }
    if (typeof item.productID !== "string" || !item.productID.trim()) {
      return {
        ok: false,
        kind: "structure",
        message: `Field \"productID\" must be a non-empty string at product index ${i}.`,
      };
    }
    if (typeof item.name !== "string" || !item.name.trim()) {
      return {
        ok: false,
        kind: "structure",
        message: `Field \"name\" must be a non-empty string at product index ${i}.`,
      };
    }
    if (typeof item.price !== "number" || !Number.isFinite(item.price)) {
      return {
        ok: false,
        kind: "structure",
        message: `Field \"price\" must be a finite number at product index ${i}.`,
      };
    }
    if (typeof item.currency !== "string" || !item.currency.trim()) {
      return {
        ok: false,
        kind: "structure",
        message: `Field \"currency\" must be a non-empty string at product index ${i}.`,
      };
    }
    if (!Number.isInteger(item.stock)) {
      return {
        ok: false,
        kind: "structure",
        message: `Field \"stock\" must be an integer at product index ${i}.`,
      };
    }

    // description is optional: allow string or null when present
    if (
      "description" in item &&
      item.description !== null &&
      typeof item.description !== "string"
    ) {
      return {
        ok: false,
        kind: "structure",
        message: `Field \"description\" must be a string or null at product index ${i}.`,
      };
    }
  }

  return { ok: true };
}

async function readTextFromHandle(handle) {
  const file = await handle.getFile();
  return await file.text();
}

async function ensureReadPermission(handle) {
  if (!handle || !handle.queryPermission) return false;
  const q = await handle.queryPermission({ mode: "read" });
  if (q === "granted") return true;
  const r = await handle.requestPermission({ mode: "read" });
  return r === "granted";
}

export default function ProductImportSettings() {
  const isAdmin = localStorage.getItem("role") === "ADMIN";

  const [periodic, setPeriodic] = useState(
    () => localStorage.getItem(LS_KEYS.periodic) === "true"
  );
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(() => {
    const raw = localStorage.getItem(LS_KEYS.last);
    return raw ? JSON.parse(raw) : null;
  });

  // Periodic interval (minutes) — staged input vs. effective applied value
  const initialInterval = (() => {
    const raw = parseInt(localStorage.getItem(LS_KEYS.interval) || "", 10);
    return Number.isFinite(raw) && raw > 0 ? raw : DEFAULT_INTERVAL_MIN;
  })();

  const [intervalInput, setIntervalInput] = useState(initialInterval); // user edits here
  const [effectiveInterval, setEffectiveInterval] = useState(initialInterval); // timer uses this

  // Persist only the effective (applied) value
  useEffect(() => {
    const clamped = Math.max(
      1,
      Math.min(1440, Number(effectiveInterval) || DEFAULT_INTERVAL_MIN)
    );
    localStorage.setItem(LS_KEYS.interval, String(clamped));
  }, [effectiveInterval]);

  // File state
  const [fileName, setFileName] = useState(
    () => localStorage.getItem(LS_KEYS.fileName) || ""
  );
  const fileHandleRef = useRef(null);
  const inputRef = useRef(null); // fallback <input type="file">

  const controllerRef = useRef(null);

  const lastStatus = useMemo(() => {
    if (!result) return null;
    return {
      ok: result.ok,
      message: result.message,
      at: result.at,
      code: result.code,
      kind: result.kind, // 'notfound' | 'structure' | 'missing' | 'network' | 'ok'
    };
  }, [result]);

  useEffect(() => {
    localStorage.setItem(LS_KEYS.periodic, String(periodic));
  }, [periodic]);

  useEffect(() => {
    if (fileName) {
      localStorage.setItem(LS_KEYS.fileName, fileName);
    } else {
      localStorage.removeItem(LS_KEYS.fileName);
    }
  }, [fileName]);

  async function postToBackend(productsArray, signal) {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const resp = await fetch("/api/import/admin/products", {
      method: "POST",
      headers,
      body: JSON.stringify(productsArray),
      signal,
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "");
      throw new Error(
        `Backend import failed (${resp.status}): ${text || resp.statusText}`
      );
    }
  }

  function hasFSA() {
    return typeof window.showOpenFilePicker === "function";
  }

  async function pickFile() {
    try {
      if (hasFSA()) {
        const [handle] = await window.showOpenFilePicker({
          multiple: false,
          types: [
            {
              description: "JSON Files",
              accept: { "application/json": [".json"] },
            },
          ],
        });
        fileHandleRef.current = handle;
        const file = await handle.getFile();
        setFileName(file.name);
      } else if (inputRef.current) {
        // Trigger fallback file input
        inputRef.current.value = "";
        inputRef.current.click();
      }
    } catch (e) {
      // user cancelled – ignore
    }
  }

  async function onFallbackChosen(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // Wrap File into a simple pseudo-handle with getFile()
    fileHandleRef.current = { getFile: async () => file };
    setFileName(file.name);
  }

  async function runImportOnce(trigger = "manual") {
    // Need a chosen file
    if (!fileHandleRef.current) {
      const r = {
        ok: false,
        kind: "missing",
        message:
          "No file selected. Please choose a local products JSON file first.",
        at: Date.now(),
        code: "NO_FILE",
        trigger,
      };
      setResult(r);
      localStorage.setItem(LS_KEYS.last, JSON.stringify(r));
      return;
    }

    setLoading(true);

    // Abort previous in-flight op if any (not used for local read, but kept consistent)
    if (controllerRef.current) controllerRef.current.abort();
    controllerRef.current = new AbortController();

    try {
      // Ensure permission if using a real FileSystemFileHandle
      if ("queryPermission" in fileHandleRef.current) {
        const ok = await ensureReadPermission(fileHandleRef.current);
        if (!ok) {
          const r = {
            ok: false,
            kind: "network",
            message:
              "Permission to read the selected file was denied. Please pick the file again and grant access.",
            at: Date.now(),
            code: "NO_PERMISSION",
          };
          setResult(r);
          localStorage.setItem(LS_KEYS.last, JSON.stringify(r));
          setLoading(false);
          return;
        }
      }

      const text = await readTextFromHandle(fileHandleRef.current);
      let json;
      try {
        json = JSON.parse(text);
      } catch {
        const r = {
          ok: false,
          kind: "structure",
          message: "The file is not valid JSON.",
          at: Date.now(),
          code: "INVALID_JSON",
        };
        setResult(r);
        localStorage.setItem(LS_KEYS.last, JSON.stringify(r));
        return;
      }

      const v = validateProducts(json);
      if (!v.ok) {
        const r = {
          ok: false,
          kind: v.kind,
          message: v.message,
          at: Date.now(),
          code:
            v.kind === "missing"
              ? "MISSING_FIELD"
              : v.kind === "structure"
              ? "BAD_STRUCTURE"
              : "BAD_FILE",
        };
        setResult(r);
        localStorage.setItem(LS_KEYS.last, JSON.stringify(r));
        return;
      }
      // Success: file validated — now send to backend
      let message = "Import file is valid and ready.";
      try {
        await postToBackend(json, controllerRef.current?.signal);
        message = "Import file is valid — sent to backend successfully.";
      } catch (e) {
        console.error(e);
        message = "Import file is valid — but sending to backend failed.";
      }

      const r = {
        ok: true,
        kind: "ok",
        message,
        at: Date.now(),
        code: "OK",
      };
      setResult(r);
      localStorage.setItem(LS_KEYS.last, JSON.stringify(r));
    } catch (e) {
      const r = {
        ok: false,
        kind: "network",
        message:
          "Could not read the selected file. It might have moved or access was revoked.",
        at: Date.now(),
        code: "READ_ERROR",
      };
      setResult(r);
      localStorage.setItem(LS_KEYS.last, JSON.stringify(r));
    } finally {
      setLoading(false);
    }
  }

  // Periodic import loop: only useful if we still have a live handle (same session) and permission
  useEffect(() => {
    if (!periodic) return;
    const minutes = Math.max(
      1,
      Math.min(1440, Number(effectiveInterval) || DEFAULT_INTERVAL_MIN)
    );
    const intervalMs = minutes * 60 * 1000;

    // Run immediately when toggled on
    runImportOnce("auto");
    const id = setInterval(() => runImportOnce("auto"), intervalMs);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodic, fileName, effectiveInterval]);

  return !isAdmin ? (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        textAlign: "center",
        padding: 40,
      }}
    >
      <h2 style={{ color: "#b91c1c" }}>Access Denied</h2>
      <p style={{ color: "#4b5563" }}>
        Only administrators can access the Product Import Settings page.
      </p>
    </div>
  ) : (
    <div style={cardStyle}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, color: "#111827" }}>
          Product Import Settings
        </h2>
        {badge(
          periodic
            ? `Periodic: ON · every ${effectiveInterval}m`
            : "Periodic: OFF",
          periodic ? "success" : "neutral"
        )}
      </div>

      <div style={{ height: 16 }} />

      <div>
        <div style={labelStyle}>Products JSON file</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <button onClick={pickFile} style={inputButtonStyle}>
            Choose file…
          </button>
          {fileName ? (
            <span style={{ fontSize: 14, color: "#374151" }}>
              Selected: {fileName}
            </span>
          ) : (
            <span style={{ fontSize: 14, color: "#6b7280" }}>
              No file chosen
            </span>
          )}
          {fileName && (
            <button
              onClick={() => {
                fileHandleRef.current = null;
                setFileName("");
              }}
              style={secondaryButtonStyle}
            >
              Clear
            </button>
          )}
          {/* Fallback input (non-Chromium browsers) */}
          <input
            ref={inputRef}
            type="file"
            accept="application/json,.json"
            style={{ display: "none" }}
            onChange={onFallbackChosen}
          />
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
          Pick a local JSON file of products.
        </div>
      </div>

      <div style={{ height: 12 }} />

      {/* Scheduling */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input
            id="periodic-toggle"
            type="checkbox"
            checked={periodic}
            onChange={(e) => setPeriodic(e.target.checked)}
            style={{ position: "absolute", opacity: 0, width: 1, height: 1 }}
          />
          <label
            htmlFor="periodic-toggle"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              cursor: "pointer",
            }}
          >
            <span
              role="switch"
              aria-checked={periodic}
              style={{
                ...switchStyle,
                background: periodic ? "#3b82f6" : "#d6dbe8",
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: 3,
                  left: periodic ? 22 : 3,
                  width: 20,
                  height: 20,
                  borderRadius: 999,
                  background: "#fff",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.16)",
                  transition: "left 160ms ease",
                }}
              />
            </span>
            <span
              style={{ fontSize: 14, color: "#1f2937", userSelect: "none" }}
            >
              Enable periodic run
            </span>
          </label>
        </div>

        {/* Interval row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 12,
          }}
        >
          <label
            htmlFor="interval-mins"
            style={{ fontSize: 13, fontWeight: 600, color: "#495170" }}
          >
            Every (min)
          </label>
          <input
            id="interval-mins"
            type="number"
            min={1}
            max={1440}
            value={intervalInput}
            onChange={(e) => {
              const v = parseInt(e.target.value || "0", 10);
              setIntervalInput(Number.isFinite(v) ? v : DEFAULT_INTERVAL_MIN);
            }}
            style={{
              width: 90,
              padding: "8px 10px",
              borderRadius: 8,
              border: "1px solid #d9deea",
              background: "#fff",
              fontWeight: 600,
            }}
          />
          <button
            onClick={() => {
              const v = parseInt(String(intervalInput) || "0", 10);
              const clamped = Math.max(
                1,
                Math.min(1440, Number.isFinite(v) ? v : DEFAULT_INTERVAL_MIN)
              );
              setEffectiveInterval(clamped);
            }}
            disabled={
              !!loading ||
              Number(effectiveInterval) ===
                Math.max(
                  1,
                  Math.min(1440, Number(intervalInput) || DEFAULT_INTERVAL_MIN)
                )
            }
            style={{ ...secondaryButtonStyle }}
          >
            Apply
          </button>
          <div style={{ fontSize: 12, color: "#6b7280", marginLeft: 6 }}>
            Active: every {effectiveInterval} min
          </div>
        </div>
      </div>

      <div style={dividerStyle} />

      {/* Actions */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={() => runImportOnce("manual")}
          disabled={loading}
          style={inputButtonStyle}
        >
          {loading ? "Running…" : "Run Now"}
        </button>
      </div>

      <div style={{ height: 12 }} />

      <div
        style={{
          padding: 16,
          border: "1px solid #eef0f6",
          borderRadius: 12,
          background: "#fff",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 8,
          }}
        >
          {lastStatus
            ? lastStatus.ok
              ? badge("Last import: OK", "success")
              : lastStatus.kind === "notfound"
              ? badge("Last import: File not found", "danger")
              : lastStatus.kind === "missing"
              ? badge("Last import: Missing field(s)", "warn")
              : lastStatus.kind === "structure"
              ? badge("Last import: Bad structure", "warn")
              : badge("Last import: Error", "danger")
            : badge("No import yet", "info")}
          <div style={{ color: "#6b7280", fontSize: 13 }}>
            {lastStatus?.at ? `at ${formatTime(lastStatus.at)}` : ""}
          </div>
        </div>
        {lastStatus?.message && (
          <div style={{ color: "#111827", fontSize: 14 }}>
            {lastStatus.message}
          </div>
        )}
        {lastStatus?.at && (
          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 6 }}>
            Active interval: {effectiveInterval} min
          </div>
        )}
      </div>

      <div style={{ marginTop: 12, color: "#6b7280", fontSize: 12 }}>
        This page validates your file and triggers the backend import.
      </div>
    </div>
  );
}
