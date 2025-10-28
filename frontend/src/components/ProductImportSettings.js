import React, { useState, useRef, useEffect } from "react";

const BASE_URL = "http://localhost:8080";

// Helper to get CSRF token from cookies
function getCsrfToken() {
  const match = document.cookie
    .split("; ")
    .find((r) => r.startsWith("XSRF-TOKEN="));
  return match ? decodeURIComponent(match.split("=")[1]) : "";
}

function authHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${localStorage.getItem("authToken") || ""}`,
    "X-XSRF-TOKEN": getCsrfToken(),
  };
}

async function getJsonOrText(res) {
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return await res.json();
  return await res.text();
}

// Helper to format timestamps as readable string
function formatDate(val) {
  if (!val) return "";
  try {
    const d =
      typeof val === "string" || typeof val === "number" ? new Date(val) : val;
    if (isNaN(d?.getTime?.())) return String(val);
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  } catch {
    return String(val);
  }
}

/* Minimal SVG icon set (premium, neutral) */
const Icon = {
  Pencil: (p) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  Save: (p) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M17 21V13H7v8" />
      <path d="M7 3v5h8" />
    </svg>
  ),
  Refresh: (p) => (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...p}
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.13-3.36L23 10" />
      <path d="M20.49 15a9 9 0 0 1-14.13 3.36L1 14" />
    </svg>
  ),
  Play: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  Stop: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  ),
  Bolt: (p) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" {...p}>
      <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </svg>
  ),
  Dot: ({ color = "#22c55e" }) => (
    <span
      style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        background: color,
        display: "inline-block",
      }}
    />
  ),
};

/* Neutral premium palette */
const tone = {
  pageBg: "#0b0d12",
  cardBg: "#0f131a",
  border: "#1f2430",
  text: "#e5e7eb",
  subtext: "#a3aab8",
  primary: "#375dfb",
  primaryHover: "#2b4ae3",
  success: "#22c55e",
  danger: "#ef4444",
  muted: "#8b93a7",
  inputBg: "#0b0f16",
  inputBorder: "#2a3140",
};

const fieldLabel = {
  fontSize: 12,
  letterSpacing: 0.4,
  textTransform: "uppercase",
  color: tone.subtext,
  fontWeight: 700,
  marginBottom: 8,
};

const inputBase = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 10,
  border: `1px solid ${tone.inputBorder}`,
  background: tone.inputBg,
  color: tone.text,
  fontSize: 14,
  outline: "none",
  transition: "border-color .2s, box-shadow .2s",
};

const iconBtn = {
  width: 34,
  height: 34,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 10,
  border: `1px solid ${tone.border}`,
  background: tone.cardBg,
  color: tone.text,
  cursor: "pointer",
};

const ActionBtn = ({ variant = "primary", disabled, onClick, children }) => {
  const base = {
    flex: "1 1 auto",
    minWidth: 140,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    padding: "12px 16px",
    borderRadius: 12,
    border: "1px solid transparent",
    fontWeight: 700,
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    userSelect: "none",
    transition: "background .2s, border-color .2s, color .2s",
  };
  const variants = {
    primary: { background: disabled ? "#2d3850" : tone.primary, color: "#fff" },
    outline: {
      background: "transparent",
      color: disabled ? tone.muted : tone.text,
      border: `1px solid ${tone.border}`,
    },
    success: { background: tone.success, color: "#0b140d" },
  };
  return (
    <button
      type="button"
      style={{ ...base, ...variants[variant] }}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

const ProductSyncSettings = () => {
  const [endpointEdit, setEndpointEdit] = useState(false);
  const [endpoint, setEndpoint] = useState(
    "https://api.example.com/productsync"
  );
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [serverStatus, setServerStatus] = useState("unknown");
  const [period, setPeriod] = useState(60);
  const [filePath, setFilePath] = useState("/path/to/sync/file");
  const [isRunning, setIsRunning] = useState(false);
  const [lastImport, setLastImport] = useState(null);
  const [statusLabel, setStatusLabel] = useState("Idle");
  const fileInputRef = useRef(null);

  useEffect(() => {
    const saved = JSON.parse(
      localStorage.getItem("productSyncSettings") || "{}"
    );
    if (saved.endpoint) setEndpoint(saved.endpoint);
    if (saved.username) setUsername(saved.username);
    if (saved.password) setPassword(saved.password);
    if (saved.period) setPeriod(saved.period);
    if (saved.lastImport) setLastImport(formatDate(saved.lastImport));
    fetchStatus();
    const t = setInterval(fetchStatus, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const data = { endpoint, username, password, period, lastImport };
    localStorage.setItem("productSyncSettings", JSON.stringify(data));
  }, [endpoint, username, password, period, lastImport]);
  const [notice, setNotice] = useState({ type: null, text: "" }); // type: 'success' | 'error'

  // Fetch status from backend and update running state and visual state.
  const fetchStatus = async () => {
    try {
      const res = await fetch(`${BASE_URL}/import/admin/status`, {
        method: "GET",
        credentials: "include",
        headers: authHeaders(),
      });
      const payload = await getJsonOrText(res);
      if (!res.ok) return; // keep UI as-is on error

      // Backward compatibility: old endpoint returned plain text
      if (typeof payload === "string") {
        const t = payload.trim().toLowerCase();
        const running = t === "running";
        setIsRunning(running);
        setStatusLabel(running ? "Running" : "Idle");
        return;
      }

      // New JSON: { running: boolean, lastImport: string|null, period: string|number }
      if (payload && typeof payload === "object") {
        if (typeof payload.running === "boolean") {
          setIsRunning(payload.running);
          setStatusLabel(payload.running ? "Running" : "Idle");
        }
        if ("lastImport" in payload)
          setLastImport(formatDate(payload.lastImport));
        if (payload.period) {
          if (typeof payload.period === "number") {
            setPeriod(payload.period);
          } else if (typeof payload.period === "string") {
            const m = payload.period.match(/^\*\/(\d+)\s/);
            if (m) {
              const n = Number(m[1]);
              if (!isNaN(n)) setPeriod(n);
            }
          }
        }
      }
    } catch (_) {
      // ignore network errors here
    }
  };

  const extractOrigin = (urlStr) => {
    if (!urlStr) return null;
    try {
      const u = new URL(urlStr);
      return u.origin; // protocol + host + optional port
    } catch {
      try {
        // try assuming http if scheme omitted
        const u2 = new URL(`http://${urlStr}`);
        return u2.origin;
      } catch {
        return null;
      }
    }
  };

  const refreshServerStatus = async () => {
    let origin = extractOrigin(endpoint);
    if (!origin) {
      setServerStatus("unknown");
      return;
    }
    origin = origin.replace("host.docker.internal", "localhost");
    try {
      await fetch(origin, { method: "GET", mode: "no-cors" });
      setServerStatus("online");
    } catch {
      setServerStatus("offline");
    }
  };

  // toCron returns the cron string for backend, or just the number for display
  const toCron = (secs) => {
    const n = Number(secs) || 0;
    if (n <= 0) return "*/30 * * * * *"; // default 30s
    return `*/${n} * * * * *`;
  };

  // Helper to convert cron string to human-readable period
  function cronToReadable(cron) {
    // expects format "*/N * * * * *"
    if (typeof cron !== "string") return "";
    const m = cron.match(/^\*\/(\d+)\s/);
    if (m) {
      const n = Number(m[1]);
      if (!isNaN(n)) {
        if (n === 1) return "1 second";
        return `${n} seconds`;
      }
    }
    // fallback
    return cron;
  }

  // Convert backend cron mention (e.g., "*/60 * * * * *") inside messages to human-readable text
  function normalizeBackendMessage(msg) {
    if (!msg || typeof msg !== "string") return msg;
    // Match patterns like '*/N * * * * *'
    const m = msg.match(/\*\/(\d+)\s+\*\s+\*\s+\*\s+\*\s+\*/);
    if (m) {
      const n = Number(m[1]);
      const human = n === 1 ? "every 1 second" : `every ${n} seconds`;
      return msg.replace(/\*\/\d+\s+\*\s+\*\s+\*\s+\*\s+\*/, human);
    }
    return msg;
  }
  const toggleEndpointEdit = async () => {
    if (endpointEdit) {
      // We are saving now; normalize host and refresh status
      const normalized = endpoint.includes("host.docker.internal")
        ? endpoint.replace("host.docker.internal", "localhost")
        : endpoint;
      if (normalized !== endpoint) setEndpoint(normalized);
      await refreshServerStatus();
    }
    setEndpointEdit(!endpointEdit);
  };
  const handleStart = async () => {
    try {
      const cron = toCron(period);
      const res = await fetch(`${BASE_URL}/import/admin/start`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify({ endpoint, username, password, period: cron }),
      });
      const msg = await res.text();
      if (!res.ok) {
        setNotice({
          type: "error",
          text: `Start failed: HTTP ${res.status} ${res.statusText} — ${
            msg || "no details"
          } (endpoint=${endpoint}, user=${username})`,
        });
        return;
      }
      await fetchStatus();
      setIsRunning(true);
      setNotice({
        type: "success",
        text: normalizeBackendMessage(msg || "Scheduled"),
      });
    } catch (e) {
      setNotice({ type: "error", text: e?.message || "Start failed" });
    }
  };
  const handleStop = async () => {
    try {
      const res = await fetch(`${BASE_URL}/import/admin/stop`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify({}),
      });
      const msg = await res.text();
      if (!res.ok) {
        setNotice({
          type: "error",
          text: `Stop failed: HTTP ${res.status} ${res.statusText} — ${
            msg || "no details"
          }`,
        });
        return;
      }
      await fetchStatus();
      setIsRunning(false);
      setNotice({ type: "success", text: msg || "Stopped" });
    } catch (e) {
      setNotice({ type: "error", text: e?.message || "Stop failed" });
    }
  };
  const handleRun = async () => {
    try {
      const res = await fetch(`${BASE_URL}/import/admin/run-now`, {
        method: "POST",
        credentials: "include",
        headers: authHeaders(),
        body: JSON.stringify({ endpoint, username, password }),
      });
      const msg = await res.text();
      if (!res.ok) {
        setNotice({
          type: "error",
          text: `Run failed: HTTP ${res.status} ${res.statusText} — ${
            msg || "no details"
          } (endpoint=${endpoint}, user=${username})`,
        });
        return;
      }
      await fetchStatus();
      setLastImport(formatDate(new Date()));
      setNotice({
        type: "success",
        text: normalizeBackendMessage(msg || "Executed"),
      });
    } catch (e) {
      setNotice({ type: "error", text: e?.message || "Run failed" });
    }
  };

  const handleBrowseClick = () =>
    fileInputRef.current && fileInputRef.current.click();
  const handleFileChange = (e) => {
    if (e.target.files?.length) setFilePath(e.target.files[0].name);
  };

  const statusBg =
    serverStatus === "online"
      ? "rgba(34,197,94,.12)"
      : serverStatus === "offline"
      ? "rgba(239,68,68,.12)"
      : "rgba(148,163,184,.12)";
  const statusDot =
    serverStatus === "online"
      ? tone.success
      : serverStatus === "offline"
      ? tone.danger
      : tone.muted;
  const statusText =
    serverStatus === "online"
      ? tone.text
      : serverStatus === "offline"
      ? "#fca5a5"
      : tone.subtext;

  // Visual indicator bar styles
  const runningBarStyle = {
    width: "100%",
    padding: "10px 0",
    marginBottom: 18,
    borderRadius: 10,
    background: isRunning ? "rgba(34,197,94,0.22)" : tone.border,
    color: isRunning ? "#caffd7" : tone.subtext,
    fontWeight: 700,
    fontSize: 15,
    textAlign: "center",
    boxShadow: isRunning
      ? "0 0 16px 2px rgba(34,197,94,0.18), 0 1px 0 0 #193d24"
      : "none",
    border: isRunning
      ? `1.5px solid ${tone.success}`
      : `1px solid ${tone.border}`,
    letterSpacing: 0.2,
    transition: "background .25s, color .18s, box-shadow .18s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  };

  return (
    <div style={{ minHeight: "100vh", background: tone.pageBg }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "56px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 26 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 800,
              color: tone.text,
            }}
          >
            Import Settings
          </h1>
          <p style={{ marginTop: 8, fontSize: 14, color: tone.subtext }}>
            Configure your ERP sync endpoints and schedules.
          </p>
        </div>

        <div
          style={{
            background: tone.cardBg,
            border: `1px solid ${tone.border}`,
            boxShadow: "0 12px 40px rgba(0,0,0,.35)",
            borderRadius: 16,
            padding: 28,
          }}
        >
          {/* Running/Idle visual indicator bar */}
          <div style={runningBarStyle}>
            {isRunning ? (
              <>
                <Icon.Dot color={tone.success} />
                <span>Running</span>
              </>
            ) : (
              <>
                <Icon.Dot color={tone.muted} />
                <span>Idle</span>
              </>
            )}
          </div>
          {notice.type && (
            <div
              style={{
                marginBottom: 16,
                padding: "10px 12px",
                borderRadius: 10,
                border: `1px solid ${
                  notice.type === "success" ? "#244f2a" : "#4d1f1f"
                }`,
                background: notice.type === "success" ? "#102016" : "#1f1414",
                color: notice.type === "success" ? "#b7f7c7" : "#f7b7b7",
                fontSize: 13,
              }}
            >
              {notice.text}
            </div>
          )}
          <form
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22 }}
          >
            {/* Endpoint (left) */}
            <div>
              <div style={fieldLabel}>Endpoint</div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                {endpointEdit ? (
                  <input
                    id="endpoint"
                    type="text"
                    value={endpoint}
                    onChange={(e) => setEndpoint(e.target.value)}
                    style={{
                      ...inputBase,
                      borderColor: tone.inputBorder,
                      flex: 1,
                    }}
                    onFocus={(e) =>
                      (e.currentTarget.style.boxShadow = `0 0 0 3px rgba(55,93,251,.25)`)
                    }
                    onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
                  />
                ) : (
                  <div
                    style={{
                      ...inputBase,
                      display: "flex",
                      alignItems: "center",
                      borderStyle: "dashed",
                      color: tone.subtext,
                      flex: 1,
                    }}
                  >
                    {endpoint}
                  </div>
                )}
                <button
                  type="button"
                  onClick={toggleEndpointEdit}
                  style={iconBtn}
                  title={endpointEdit ? "Save" : "Edit"}
                >
                  {endpointEdit ? <Icon.Save /> : <Icon.Pencil />}
                </button>
              </div>
            </div>

            {/* Server Status */}
            <div>
              <div style={fieldLabel}>Server Status</div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "flex-start",
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    borderRadius: 999,
                    background: statusBg,
                    color: statusText,
                  }}
                >
                  <Icon.Dot color={statusDot} />
                  <span style={{ fontWeight: 700, letterSpacing: 0.2 }}>
                    {serverStatus}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={refreshServerStatus}
                  style={iconBtn}
                  title="Refresh"
                >
                  <Icon.Refresh />
                </button>
              </div>
            </div>

            {/* Username (left) */}
            <div>
              <div style={fieldLabel}>Username</div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputBase}
              />
            </div>

            {/* Password (right) */}
            <div>
              <div style={fieldLabel}>Password</div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputBase}
              />
            </div>

            {/* Period */}
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={fieldLabel}>Download Period (seconds)</div>
              <input
                id="period"
                type="number"
                min={1}
                value={period}
                onChange={(e) => setPeriod(Number(e.target.value))}
                style={inputBase}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow = `0 0 0 3px rgba(55,93,251,.25)`)
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
              />
              <div style={{ marginTop: 6, color: tone.subtext, fontSize: 13 }}>
                Period:{" "}
                <span style={{ color: tone.text }}>
                  {cronToReadable(toCron(period))}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div
              style={{
                gridColumn: "1 / -1",
                display: "flex",
                gap: 12,
                justifyContent: "flex-end",
                flexWrap: "wrap",
                marginTop: 6,
              }}
            >
              <ActionBtn
                variant="primary"
                disabled={isRunning}
                onClick={handleStart}
              >
                <Icon.Play /> Start
              </ActionBtn>
              <ActionBtn
                variant="outline"
                disabled={!isRunning}
                onClick={handleStop}
              >
                <Icon.Stop /> Stop
              </ActionBtn>
              <ActionBtn variant="success" onClick={handleRun}>
                <Icon.Bolt /> Run Now
              </ActionBtn>
            </div>

            {/* Meta */}
            <div
              style={{
                gridColumn: "1 / -1",
                marginTop: 6,
                paddingTop: 16,
                borderTop: `1px solid ${tone.border}`,
                color: tone.subtext,
                fontSize: 13,
                display: "flex",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div>
                <span style={{ color: tone.text }}>Last Import:</span>{" "}
                {lastImport || "Never"}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductSyncSettings;
