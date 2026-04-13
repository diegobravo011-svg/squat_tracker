"use client";

import { useState, useEffect } from "react";

// ============================================================
// SUPABASE CONFIG ✅
// ============================================================
const SUPABASE_URL = "https://ojuibtesufcpmgzrylbl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_yNR_bvFnmymtoyYskbQgLA_lSsvfcif";

const supabaseHeaders = {
  apikey: SUPABASE_ANON_KEY,
  Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

const db = {
  async get(table) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=*&order=id.desc`, { headers: supabaseHeaders });
    return res.json();
  },
  async insert(table, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST", headers: supabaseHeaders, body: JSON.stringify(data),
    });
    return res.json();
  },
  async update(table, id, data) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH", headers: supabaseHeaders, body: JSON.stringify(data),
    });
    return res.json();
  },
  async delete(table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE", headers: supabaseHeaders,
    });
  },
};

// ============================================================
// PALETA INTERIUS — MODO CLARO
// ============================================================
const C = {
  // Fondos
  bgPage:     "#ede5d8",   // parchment cálido
  bgCard:     "rgba(255,255,255,0.72)",
  bgCardHov:  "rgba(255,255,255,0.92)",
  bgPanel:    "rgba(255,255,255,0.55)",
  bgModal:    "#faf6f0",

  // Texto
  textPrimary:   "#1a130f",   // Café Militar (ahora texto)
  textSecondary: "#6b5545",
  textMuted:     "rgba(26,19,15,0.42)",
  textPlaceholder:"rgba(26,19,15,0.32)",

  // Bordes
  border:     "rgba(94,125,90,0.18)",
  borderCard: "rgba(188,162,127,0.35)",
  borderLight:"rgba(188,162,127,0.2)",

  // Acentos verdes
  greenLichen: "#5E7D5A",
  greenForest: "#2D5A27",
  emerald:     "#1BB39A",
  emeraldHov:  "#169a84",

  // Tierras
  sand:        "#d2c2b3",
  khaki:       "#BCA27F",
  khakiHov:    "#a88d6a",
  vintage:     "#d6c9a8",

  // Sombras
  shadow:      "rgba(45,26,15,0.10)",
  shadowMd:    "rgba(45,26,15,0.14)",
};

// ============================================================
// EQUIPO
// ============================================================
const TEAM = ["Diego", "Martin", "Rorro", "Zarko"];
const TEAM_COLORS = {
  Diego:  "#2D5A27",
  Martin: "#5E7D5A",
  Rorro:  "#1BB39A",
  Zarko:  "#a88d6a",
};

const CATEGORIES = ["App Nahueroute", "Frontend", "Backend", "Diseño", "General"];
const CAT_ICONS  = {
  "App Nahueroute": "🗺",
  Frontend:  "◈",
  Backend:   "⬡",
  Diseño:    "✦",
  General:   "◎",
};

// ============================================================
// UTILS
// ============================================================
function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso)) / 1000;
  if (diff < 60)    return "ahora mismo";
  if (diff < 3600)  return `hace ${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`;
  return `hace ${Math.floor(diff / 86400)}d`;
}

function calcProgress(tasks) {
  if (!tasks.length) return 0;
  return Math.round(tasks.reduce((s, t) => s + (t.progress || 0), 0) / tasks.length);
}

const glass = {
  background: C.bgCard,
  border: `1px solid ${C.borderCard}`,
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  boxShadow: `0 2px 16px ${C.shadow}`,
};

// ============================================================
// SVG RING
// ============================================================
function Ring({ progress, size = 120, stroke = 10, color }) {
  const col = color || C.emerald;
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`rgba(94,125,90,0.15)`} strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={col} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(.4,0,.2,1)" }}
      />
    </svg>
  );
}

function MiniRing({ progress, color }) {
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
      <Ring progress={progress} size={54} stroke={5} color={color} />
      <span style={{
        position: "absolute", fontSize: 10, fontWeight: 700, color,
        fontFamily: "var(--font-space-mono), monospace",
      }}>
        {progress}%
      </span>
    </div>
  );
}

// ============================================================
// TASK CARD
// ============================================================
function TaskCard({ task, currentUser, onUpdate, onDelete }) {
  const [localProgress, setLocalProgress] = useState(task.progress || 0);
  const color  = TEAM_COLORS[task.assignee] || C.greenLichen;
  const isOwn  = task.assignee === currentUser;

  useEffect(() => setLocalProgress(task.progress || 0), [task.progress]);

  function handleProgressChange(e) {
    const val = parseInt(e.target.value);
    setLocalProgress(val);
    onUpdate(task.id, {
      progress: val,
      assignee: currentUser,
      updated_at: new Date().toISOString(),
      status: val === 100 ? "done" : "active",
    });
  }

  return (
    <div
      style={{
        ...glass,
        borderLeft: `3px solid ${color}`,
        borderRadius: 11,
        padding: "13px 15px",
        marginBottom: 9,
        transition: "all 0.22s",
        opacity: task.status === "done" ? 0.65 : 1,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = C.bgCardHov;
        e.currentTarget.style.boxShadow = `0 4px 20px ${C.shadowMd}`;
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = C.bgCard;
        e.currentTarget.style.boxShadow = `0 2px 16px ${C.shadow}`;
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <p style={{
            margin: 0, fontSize: 13, fontWeight: 600, color: C.textPrimary,
            textDecoration: task.status === "done" ? "line-through" : "none",
            opacity: task.status === "done" ? 0.55 : 1,
          }}>{task.title}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 5, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "monospace" }}>
              {timeAgo(task.updated_at)}
            </span>
            <span style={{
              fontSize: 10, padding: "1px 8px", borderRadius: 20,
              background: `${color}18`, color, fontWeight: 700,
              border: `1px solid ${color}44`,
              fontFamily: "var(--font-space-mono), monospace",
            }}>{task.assignee}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <MiniRing progress={localProgress} color={localProgress === 100 ? C.greenForest : color} />
          {isOwn && (
            <button onClick={() => onDelete(task.id)} style={{
              background: "none", border: "none",
              color: "rgba(26,19,15,0.18)",
              cursor: "pointer", fontSize: 14, padding: 4, transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#c0392b"}
              onMouseLeave={e => e.target.style.color = "rgba(26,19,15,0.18)"}
            >✕</button>
          )}
        </div>
      </div>

      {isOwn ? (
        <div style={{ position: "relative" }}>
          <input type="range" min={0} max={100} value={localProgress}
            onChange={handleProgressChange}
            style={{ width: "100%", height: 6, cursor: "pointer", accentColor: color, borderRadius: 4 }}
          />
          <div style={{
            position: "absolute", top: -1, left: 0,
            width: `${localProgress}%`, height: 6,
            background: `linear-gradient(90deg, ${color}55, ${color})`,
            borderRadius: 4, pointerEvents: "none", transition: "width 0.3s",
          }} />
        </div>
      ) : (
        <div style={{ height: 4, borderRadius: 4, background: `rgba(94,125,90,0.12)`, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${localProgress}%`,
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            borderRadius: 4, transition: "width 0.8s",
          }} />
        </div>
      )}
    </div>
  );
}

// ============================================================
// ADD TASK MODAL
// ============================================================
function AddTaskModal({ currentUser, onAdd, onClose }) {
  const [title, setTitle]       = useState("");
  const [category, setCategory] = useState("App Nahueroute");
  const userColor = TEAM_COLORS[currentUser] || C.greenLichen;

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(237,229,216,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: C.bgModal,
        border: `1px solid ${C.borderCard}`,
        borderRadius: 20, padding: 30, width: 390,
        boxShadow: `0 20px 60px ${C.shadowMd}, 0 0 0 1px rgba(94,125,90,0.08)`,
      }}>
        <h3 style={{
          margin: "0 0 20px", color: C.textPrimary,
          fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 18,
        }}>+ Nueva Tarea</h3>

        <input
          autoFocus
          placeholder="Título de la tarea..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && title.trim() && onAdd({ title: title.trim(), category })}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 9,
            background: "rgba(255,255,255,0.8)",
            border: `1px solid ${C.borderCard}`,
            color: C.textPrimary, fontSize: 14, outline: "none",
            boxSizing: "border-box", marginBottom: 14,
            fontFamily: "inherit",
            boxShadow: `inset 0 1px 3px ${C.shadow}`,
          }}
        />

        <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 22 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer",
              fontFamily: "var(--font-space-mono), monospace", fontWeight: 700,
              background: category === c ? `${userColor}18` : "rgba(255,255,255,0.6)",
              color: category === c ? userColor : C.textSecondary,
              border: category === c ? `1px solid ${userColor}55` : `1px solid ${C.borderLight}`,
              transition: "all 0.18s",
            }}>{CAT_ICONS[c]} {c}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", borderRadius: 9,
            border: `1px solid ${C.borderCard}`,
            background: "rgba(255,255,255,0.6)", color: C.textSecondary,
            cursor: "pointer", fontSize: 14,
          }}>Cancelar</button>
          <button
            onClick={() => title.trim() && onAdd({ title: title.trim(), category })}
            style={{
              flex: 2, padding: "10px", borderRadius: 9, border: "none",
              background: `linear-gradient(135deg, ${userColor}, ${C.greenForest})`,
              color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
              fontFamily: "var(--font-space-mono), monospace",
              boxShadow: `0 4px 14px ${userColor}44`,
            }}>Agregar →</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// SUMMARY MODAL
// ============================================================
function SummaryModal({ tasks, onClose }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { generateSummary(); }, []);

  async function generateSummary() {
    setLoading(true);
    const done       = tasks.filter(t => t.status === "done");
    const inProgress = tasks.filter(t => t.status === "active" && t.progress > 0);
    const pending    = tasks.filter(t => t.progress === 0);
    const global     = calcProgress(tasks);

    const prompt = `Eres el asistente del equipo Interius (Diego, Martin, Rorro, Zarko). Genera un resumen semanal conciso y motivador.\n\nDatos del proyecto App Nahueroute:\n- Progreso global: ${global}%\n- Completadas (${done.length}): ${done.map(t => `"${t.title}" (${t.assignee})`).join(", ") || "ninguna"}\n- En progreso (${inProgress.length}): ${inProgress.map(t => `"${t.title}" al ${t.progress}% (${t.assignee})`).join(", ") || "ninguna"}\n- Sin iniciar (${pending.length}): ${pending.map(t => `"${t.title}"`).join(", ") || "ninguna"}\n\nEscribe en español con 3 secciones: ✅ Logros, 🔄 En curso, 📌 Próxima semana. Máximo 200 palabras. Tono: directo, motivador, profesional.`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await res.json();
      setSummary(data.content?.[0]?.text || "No se pudo generar el resumen.");
    } catch {
      setSummary("Error al conectar con la IA. Verifica tu conexión.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(237,229,216,0.65)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: C.bgModal,
        border: `1px solid ${C.borderCard}`,
        borderRadius: 20, padding: 32, width: 500, maxHeight: "80vh",
        overflow: "auto", boxShadow: `0 24px 70px ${C.shadowMd}`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{
              margin: "0 0 3px", color: C.textPrimary,
              fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 20,
            }}>📋 Resumen Semanal</h3>
            <p style={{ margin: 0, fontSize: 11, color: C.textMuted, fontFamily: "monospace" }}>
              App Nahueroute · Equipo Interius
            </p>
          </div>
          <button onClick={generateSummary} style={{
            background: "rgba(94,125,90,0.1)",
            border: `1px solid ${C.border}`,
            color: C.greenForest, padding: "6px 14px", borderRadius: 8,
            cursor: "pointer", fontSize: 12, fontFamily: "monospace", fontWeight: 700,
          }}>↻ Regenerar</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <div style={{
              width: 38, height: 38,
              border: `3px solid rgba(94,125,90,0.2)`,
              borderTop: `3px solid ${C.emerald}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 14px",
            }} />
            <p style={{ color: C.textMuted, fontFamily: "monospace", fontSize: 11 }}>
              Generando resumen con IA...
            </p>
          </div>
        ) : (
          <div style={{
            color: C.textSecondary, fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap",
          }}>{summary}</div>
        )}

        <button onClick={onClose} style={{
          marginTop: 24, width: "100%", padding: "11px", borderRadius: 10,
          background: "rgba(94,125,90,0.08)",
          border: `1px solid ${C.border}`,
          color: C.textSecondary, cursor: "pointer", fontSize: 14,
          fontFamily: "var(--font-space-mono), monospace",
        }}>Cerrar</button>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================
export default function SquadTracker() {
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummary, setShowSummary]   = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [tick, setTick]               = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    db.get("tasks").then(data => {
      if (Array.isArray(data)) setTasks(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [tick]);

  function handleUpdate(id, updates) {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
    db.update("tasks", id, updates);
  }
  function handleDelete(id) {
    setTasks(prev => prev.filter(t => t.id !== id));
    db.delete("tasks", id);
  }
  async function handleAdd({ title, category }) {
    const payload = {
      title, category, progress: 0,
      assignee: currentUser,
      updated_at: new Date().toISOString(),
      status: "active",
    };
    const [inserted] = await db.insert("tasks", payload);
    if (inserted) setTasks(prev => [inserted, ...prev]);
    setShowAddModal(false);
  }

  const nahueTasks = tasks.filter(t => t.category === "App Nahueroute");
  const globalPct  = calcProgress(nahueTasks.length ? nahueTasks : tasks);

  const allCategories = ["Todas", ...CATEGORIES.filter(c => tasks.some(t => t.category === c))];
  const filtered = activeCategory === "Todas" ? tasks : tasks.filter(t => t.category === activeCategory);
  const grouped  = CATEGORIES.reduce((acc, cat) => {
    const catTasks = filtered.filter(t => t.category === cat);
    if (catTasks.length) acc[cat] = catTasks;
    return acc;
  }, {});

  const done = tasks.filter(t => t.status === "done").length;

  // ── LOGIN ────────────────────────────────────────────────
  if (!currentUser) {
    return (
      <div style={{
        minHeight: "100vh",
        background: C.bgPage,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundImage: `
          radial-gradient(ellipse at 20% 20%, rgba(94,125,90,0.14) 0%, transparent 55%),
          radial-gradient(ellipse at 80% 80%, rgba(27,179,154,0.10) 0%, transparent 55%),
          radial-gradient(ellipse at 55% 50%, rgba(214,201,168,0.5) 0%, transparent 65%)
        `,
      }}>
        <div style={{ textAlign: "center", animation: "fadeUp 0.55s ease", position: "relative" }}>

          {/* Pill brand */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            marginBottom: 32,
            padding: "9px 20px 9px 12px",
            background: "rgba(255,255,255,0.75)",
            border: `1px solid ${C.border}`,
            borderRadius: 50,
            backdropFilter: "blur(10px)",
            boxShadow: `0 4px 20px ${C.shadow}`,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.greenLichen}, ${C.greenForest})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, boxShadow: `0 3px 10px rgba(45,90,39,0.35)`,
            }}>🗺</div>
            <div style={{ textAlign: "left" }}>
              <div style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 15, fontWeight: 700, color: C.textPrimary, lineHeight: 1.1,
              }}>Squad Tracker</div>
              <div style={{
                fontFamily: "var(--font-space-mono), monospace",
                fontSize: 9, color: C.greenLichen, letterSpacing: 2, textTransform: "uppercase",
              }}>by Interius</div>
            </div>
          </div>

          <p style={{
            color: C.textMuted, margin: "0 0 40px",
            fontSize: 13, fontFamily: "var(--font-space-mono), monospace", letterSpacing: 0.4,
          }}>
            ¿Quién eres hoy?
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
            {TEAM.map(name => {
              const col = TEAM_COLORS[name];
              return (
                <button key={name} onClick={() => setCurrentUser(name)} style={{
                  padding: "20px 26px", borderRadius: 16,
                  background: "rgba(255,255,255,0.7)",
                  border: `1px solid ${C.borderCard}`,
                  color: C.textPrimary, cursor: "pointer",
                  transition: "all 0.22s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  minWidth: 112, fontFamily: "inherit",
                  boxShadow: `0 2px 12px ${C.shadow}`,
                  backdropFilter: "blur(8px)",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.92)";
                    e.currentTarget.style.borderColor = col;
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 10px 28px ${col}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.7)";
                    e.currentTarget.style.borderColor = C.borderCard;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = `0 2px 12px ${C.shadow}`;
                  }}
                >
                  <span style={{
                    width: 46, height: 46, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${col}dd, ${col})`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 20, fontWeight: 800, color: "#fff",
                    boxShadow: `0 4px 16px ${col}55`,
                  }}>{name[0]}</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary }}>{name}</span>
                </button>
              );
            })}
          </div>

          <p style={{
            marginTop: 48, fontSize: 10, color: `rgba(26,19,15,0.2)`,
            fontFamily: "monospace", letterSpacing: 1.5, textTransform: "uppercase",
          }}>
            App Nahueroute · Equipo Interius · v1.0
          </p>
        </div>
      </div>
    );
  }

  const userColor = TEAM_COLORS[currentUser];

  // ── DASHBOARD ────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: C.bgPage,
      color: C.textPrimary,
      backgroundImage: `
        radial-gradient(ellipse at 0% 0%, ${userColor}12 0%, transparent 45%),
        radial-gradient(ellipse at 100% 100%, rgba(27,179,154,0.08) 0%, transparent 45%),
        radial-gradient(ellipse at 55% 50%, rgba(214,201,168,0.4) 0%, transparent 65%)
      `,
    }}>

      {/* ── HEADER ── */}
      <header style={{
        borderBottom: `1px solid ${C.borderLight}`,
        padding: "13px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(237,229,216,0.85)",
        boxShadow: `0 1px 12px ${C.shadow}`,
      }}>

        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 9,
            padding: "6px 14px 6px 9px",
            background: "rgba(255,255,255,0.8)",
            border: `1px solid ${C.border}`,
            borderRadius: 40,
            boxShadow: `0 1px 6px ${C.shadow}`,
          }}>
            <div style={{
              width: 28, height: 28, borderRadius: "50%",
              background: `linear-gradient(135deg, ${C.greenLichen}, ${C.greenForest})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, boxShadow: `0 2px 8px rgba(45,90,39,0.3)`,
            }}>🗺</div>
            <div>
              <div style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 13, fontWeight: 700, color: C.textPrimary, lineHeight: 1.1,
              }}>Squad Tracker</div>
              <div style={{
                fontFamily: "var(--font-space-mono), monospace",
                fontSize: 8, color: C.greenLichen, letterSpacing: 1.8, textTransform: "uppercase",
              }}>by Interius</div>
            </div>
          </div>
          <span style={{
            fontSize: 10, padding: "2px 9px", borderRadius: 20,
            background: `rgba(27,179,154,0.12)`,
            border: `1px solid rgba(27,179,154,0.3)`,
            color: C.emerald,
            fontFamily: "var(--font-space-mono), monospace",
          }}>● LIVE</span>
        </div>

        {/* Progreso Global */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{
              fontSize: 9, color: C.textMuted,
              fontFamily: "monospace", letterSpacing: 1.4, textTransform: "uppercase",
            }}>App Nahueroute</div>
            <div style={{
              fontSize: 22, fontWeight: 700,
              fontFamily: "var(--font-space-mono), monospace",
              color: userColor, lineHeight: 1.1,
            }}>{globalPct}%</div>
          </div>
          <Ring progress={globalPct} size={48} stroke={5} color={userColor} />
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* Avatares */}
          <div style={{ display: "flex", marginRight: 4 }}>
            {TEAM.map(name => (
              <div key={name} title={name} style={{
                width: 30, height: 30, borderRadius: "50%",
                background: `linear-gradient(135deg, ${TEAM_COLORS[name]}cc, ${TEAM_COLORS[name]})`,
                border: `2px solid ${C.bgPage}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#fff",
                marginLeft: -7,
                opacity: name === currentUser ? 1 : 0.4,
                transition: "opacity 0.2s",
                boxShadow: name === currentUser ? `0 0 0 2px ${TEAM_COLORS[name]}88` : "none",
              }}>{name[0]}</div>
            ))}
          </div>

          <button onClick={() => setShowSummary(true)} style={{
            padding: "7px 13px", borderRadius: 9,
            background: "rgba(255,255,255,0.7)",
            border: `1px solid ${C.borderCard}`,
            color: C.textSecondary, cursor: "pointer", fontSize: 12,
            fontFamily: "var(--font-space-mono), monospace",
            boxShadow: `0 1px 4px ${C.shadow}`,
            transition: "all 0.18s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.95)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.7)"}
          >📋 Resumen</button>

          <button onClick={() => setShowAddModal(true)} style={{
            padding: "7px 16px", borderRadius: 9,
            background: `linear-gradient(135deg, ${userColor}, ${C.greenForest})`,
            border: "none", color: "#fff", cursor: "pointer",
            fontSize: 13, fontWeight: 800,
            fontFamily: "var(--font-space-mono), monospace",
            boxShadow: `0 3px 12px ${userColor}44`,
            transition: "opacity 0.18s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.87"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >+ Tarea</button>

          <button onClick={() => setCurrentUser(null)} style={{
            background: "rgba(255,255,255,0.65)",
            border: `1px solid ${C.borderCard}`,
            color: C.textMuted, cursor: "pointer",
            fontSize: 15, padding: "7px 10px", borderRadius: 9,
            transition: "all 0.18s",
            boxShadow: `0 1px 4px ${C.shadow}`,
          }} title="Cambiar usuario"
            onMouseEnter={e => { e.currentTarget.style.color = C.textPrimary; e.currentTarget.style.background = "rgba(255,255,255,0.95)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.background = "rgba(255,255,255,0.65)"; }}
          >⇄</button>
        </div>
      </header>

      {/* ── STATS BAR ── */}
      <div style={{
        display: "flex", padding: "12px 24px", gap: 8,
        borderBottom: `1px solid ${C.borderLight}`,
      }}>
        {[
          { label: "Total",       value: tasks.length,                                                  icon: "◈", color: C.textPrimary },
          { label: "Completadas", value: done,                                                           icon: "✓", color: C.greenForest },
          { label: "En curso",    value: tasks.filter(t => t.progress > 0 && t.progress < 100).length, icon: "↻", color: userColor },
          { label: "Pendientes",  value: tasks.filter(t => t.progress === 0).length,                    icon: "○", color: C.khaki },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, padding: "10px 16px",
            background: "rgba(255,255,255,0.55)",
            border: `1px solid ${C.borderLight}`,
            borderRadius: 10,
            backdropFilter: "blur(8px)",
            boxShadow: `0 1px 6px ${C.shadow}`,
          }}>
            <div style={{
              fontSize: 22, fontWeight: 800,
              fontFamily: "var(--font-space-mono), monospace",
              color: s.color,
            }}>
              {loading ? "—" : s.value}
            </div>
            <div style={{ fontSize: 10, color: C.textMuted, fontFamily: "monospace", marginTop: 2 }}>
              {s.icon} {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div style={{ padding: "12px 24px", display: "flex", gap: 7, overflowX: "auto" }}>
        {allCategories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: "6px 16px", borderRadius: 20,
            background: activeCategory === cat ? `${userColor}18` : "rgba(255,255,255,0.6)",
            border: activeCategory === cat ? `1px solid ${userColor}66` : `1px solid ${C.borderLight}`,
            color: activeCategory === cat ? userColor : C.textSecondary,
            cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
            fontFamily: "var(--font-space-mono), monospace",
            transition: "all 0.18s",
            boxShadow: activeCategory === cat ? `0 2px 8px ${userColor}20` : "none",
          }}>
            {cat !== "Todas" && CAT_ICONS[cat] + " "}{cat}
          </button>
        ))}
      </div>

      {/* ── TASK COLUMNS ── */}
      <main style={{ padding: "4px 24px 48px" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: 38, height: 38,
              border: `3px solid rgba(94,125,90,0.2)`,
              borderTop: `3px solid ${userColor}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 14px",
            }} />
            <p style={{ color: C.textMuted, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>
              cargando tareas...
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
            animation: "fadeUp 0.4s ease",
          }}>
            {Object.keys(grouped).length === 0 && (
              <div style={{
                gridColumn: "1/-1", textAlign: "center", padding: "70px 0",
                color: C.textMuted, fontFamily: "monospace", fontSize: 12,
              }}>
                Sin tareas todavía — ¡presiona &quot;+ Tarea&quot;!
              </div>
            )}
            {Object.entries(grouped).map(([cat, catTasks]) => {
              const catPct = calcProgress(catTasks);
              const isNahue = cat === "App Nahueroute";
              return (
                <div key={cat} style={{
                  ...glass,
                  borderTop: isNahue ? `2px solid ${C.emerald}` : `1px solid ${C.borderCard}`,
                  border: `1px solid ${C.borderCard}`,
                  borderTop: isNahue ? `2px solid ${C.emerald}` : undefined,
                  borderRadius: 16, padding: 16,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 15 }}>{CAT_ICONS[cat]}</span>
                      <span style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontWeight: 700, fontSize: 13, color: C.textPrimary,
                      }}>{cat}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: C.textMuted, fontFamily: "monospace" }}>
                        {catTasks.filter(t => t.status === "done").length}/{catTasks.length}
                      </span>
                      <div style={{ width: 40, height: 4, borderRadius: 4, background: `rgba(94,125,90,0.12)`, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${catPct}%`,
                          background: isNahue
                            ? `linear-gradient(90deg, ${C.greenLichen}, ${C.emerald})`
                            : `linear-gradient(90deg, ${userColor}88, ${userColor})`,
                          borderRadius: 4, transition: "width 0.8s",
                        }} />
                      </div>
                    </div>
                  </div>
                  {catTasks.map(task => (
                    <TaskCard key={task.id} task={task} currentUser={currentUser}
                      onUpdate={handleUpdate} onDelete={handleDelete} />
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showAddModal && (
        <AddTaskModal currentUser={currentUser} onAdd={handleAdd} onClose={() => setShowAddModal(false)} />
      )}
      {showSummary && (
        <SummaryModal tasks={tasks} onClose={() => setShowSummary(false)} />
      )}
    </div>
  );
}
