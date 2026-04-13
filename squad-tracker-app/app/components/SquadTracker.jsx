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
// PALETA INTERIUS
// ============================================================
const COLORS = {
  bgMaster:   "#1a130f",   // Café Militar
  bgDepth:    "#2a1e16",   // Café Tierra
  greenLichen:"#5E7D5A",   // Verde Liquen
  greenForest:"#2D5A27",   // Verde Bosque
  emerald:    "#1BB39A",   // Esmeralda Camping
  emeraldHov: "#169a84",   // Esmeralda Profundo
  sand:       "#d2c2b3",   // Arena Orgánica
  khaki:      "#BCA27F",   // Caqui Sendero
  khakiHov:   "#a88d6a",   // Brillo de Ruta
  vintage:    "#d6c9a8",   // Tinte Vintage
};

// ============================================================
// EQUIPO
// ============================================================
const TEAM = ["Diego", "Martin", "Rorro", "Zarko"];
const TEAM_COLORS = {
  Diego:  "#2D5A27",   // Verde Bosque
  Martin: "#5E7D5A",   // Verde Liquen
  Rorro:  "#1BB39A",   // Esmeralda Camping
  Zarko:  "#BCA27F",   // Caqui Sendero
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

// Borde de card sutil con tinte vintage
const cardBase = {
  background: `rgba(210,194,179,0.04)`,
  border: `1px solid rgba(210,194,179,0.09)`,
  backdropFilter: "blur(6px)",
};

// ============================================================
// SVG RING
// ============================================================
function Ring({ progress, size = 120, stroke = 10, color }) {
  const col = color || COLORS.emerald;
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={`rgba(210,194,179,0.08)`} strokeWidth={stroke} />
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
      <Ring progress={progress} size={56} stroke={5} color={color} />
      <span style={{ position: "absolute", fontSize: 11, fontWeight: 700, color, fontFamily: "var(--font-space-mono), monospace" }}>
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
  const color = TEAM_COLORS[task.assignee] || COLORS.sand;
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
        ...cardBase,
        borderLeft: `3px solid ${color}`,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 10,
        transition: "all 0.25s",
        opacity: task.status === "done" ? 0.6 : 1,
        cursor: "default",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(210,194,179,0.08)"}
      onMouseLeave={e => e.currentTarget.style.background = "rgba(210,194,179,0.04)"}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div style={{ flex: 1 }}>
          <p style={{
            margin: 0, fontSize: 13, fontWeight: 600, color: COLORS.sand,
            textDecoration: task.status === "done" ? "line-through" : "none",
            opacity: task.status === "done" ? 0.6 : 1,
          }}>{task.title}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 5, alignItems: "center" }}>
            <span style={{ fontSize: 10, color: `rgba(210,194,179,0.4)`, fontFamily: "monospace" }}>
              {timeAgo(task.updated_at)}
            </span>
            <span style={{
              fontSize: 10, padding: "1px 7px", borderRadius: 20,
              background: `${color}22`, color, fontWeight: 700,
              fontFamily: "var(--font-space-mono), monospace",
            }}>{task.assignee}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <MiniRing progress={localProgress} color={localProgress === 100 ? COLORS.greenForest : color} />
          {isOwn && (
            <button onClick={() => onDelete(task.id)} style={{
              background: "none", border: "none", color: `rgba(210,194,179,0.2)`,
              cursor: "pointer", fontSize: 14, padding: 4, transition: "color 0.2s",
            }}
              onMouseEnter={e => e.target.style.color = "#c0392b"}
              onMouseLeave={e => e.target.style.color = "rgba(210,194,179,0.2)"}
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
        <div style={{ height: 4, borderRadius: 4, background: "rgba(210,194,179,0.07)", overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${localProgress}%`,
            background: `linear-gradient(90deg, ${color}55, ${color})`,
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
  const userColor = TEAM_COLORS[currentUser] || COLORS.emerald;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(10,7,5,0.80)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(10px)",
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: COLORS.bgDepth,
        border: `1px solid rgba(210,194,179,0.12)`,
        borderRadius: 18, padding: 28, width: 380,
        boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(210,194,179,0.05)`,
      }}>
        <h3 style={{
          margin: "0 0 20px", color: COLORS.sand,
          fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 18,
        }}>+ Nueva Tarea</h3>

        <input
          autoFocus
          placeholder="Título de la tarea..."
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === "Enter" && title.trim() && onAdd({ title: title.trim(), category })}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 8,
            background: "rgba(210,194,179,0.06)", border: `1px solid rgba(210,194,179,0.12)`,
            color: COLORS.sand, fontSize: 14, outline: "none",
            boxSizing: "border-box", marginBottom: 14,
            fontFamily: "inherit",
          }}
        />

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 22 }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              padding: "5px 12px", borderRadius: 20, fontSize: 12, cursor: "pointer",
              fontFamily: "var(--font-space-mono), monospace", fontWeight: 700,
              background: category === c ? userColor : "rgba(210,194,179,0.07)",
              color: category === c ? "#fff" : `rgba(210,194,179,0.55)`,
              border: category === c ? `1px solid ${userColor}` : "1px solid rgba(210,194,179,0.1)",
              transition: "all 0.2s",
            }}>{CAT_ICONS[c]} {c}</button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "10px", borderRadius: 8,
            border: "1px solid rgba(210,194,179,0.12)",
            background: "none", color: `rgba(210,194,179,0.45)`, cursor: "pointer", fontSize: 14,
          }}>Cancelar</button>
          <button
            onClick={() => title.trim() && onAdd({ title: title.trim(), category })}
            style={{
              flex: 2, padding: "10px", borderRadius: 8, border: "none",
              background: `linear-gradient(135deg, ${userColor}, ${COLORS.greenForest})`,
              color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700,
              fontFamily: "var(--font-space-mono), monospace",
              boxShadow: `0 4px 16px ${userColor}44`,
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

    const prompt = `Eres el asistente del equipo Interius, un equipo de 4 desarrolladores: Diego, Martin, Rorro y Zarko. Genera un resumen semanal conciso y motivador del progreso del equipo en su proyecto App Nahueroute.\n\nDatos:\n- Progreso global: ${global}%\n- Completadas (${done.length}): ${done.map(t => `"${t.title}" (${t.assignee})`).join(", ") || "ninguna"}\n- En progreso (${inProgress.length}): ${inProgress.map(t => `"${t.title}" al ${t.progress}% (${t.assignee})`).join(", ") || "ninguna"}\n- Sin iniciar (${pending.length}): ${pending.map(t => `"${t.title}"`).join(", ") || "ninguna"}\n\nEscribe en español con 3 secciones: ✅ Logros, 🔄 En curso, 📌 Próxima semana. Máximo 200 palabras. Tono: directo, motivador, profesional.`;

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
      position: "fixed", inset: 0, background: "rgba(10,7,5,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000, backdropFilter: "blur(10px)",
    }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: COLORS.bgDepth, border: `1px solid rgba(210,194,179,0.12)`,
        borderRadius: 20, padding: 32, width: 500, maxHeight: "80vh",
        overflow: "auto", boxShadow: "0 60px 100px rgba(0,0,0,0.7)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <div>
            <h3 style={{ margin: "0 0 2px", color: COLORS.sand, fontFamily: "var(--font-space-grotesk), sans-serif", fontSize: 20 }}>
              📋 Resumen Semanal
            </h3>
            <p style={{ margin: 0, fontSize: 11, color: `rgba(210,194,179,0.4)`, fontFamily: "monospace" }}>
              App Nahueroute · Equipo Interius
            </p>
          </div>
          <button onClick={generateSummary} style={{
            background: "rgba(210,194,179,0.07)", border: `1px solid rgba(210,194,179,0.12)`,
            color: COLORS.sand, padding: "6px 14px", borderRadius: 8,
            cursor: "pointer", fontSize: 12, fontFamily: "monospace",
          }}>↻ Regenerar</button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "50px 0" }}>
            <div style={{
              width: 40, height: 40, border: `3px solid rgba(210,194,179,0.12)`,
              borderTop: `3px solid ${COLORS.emerald}`, borderRadius: "50%",
              animation: "spin 1s linear infinite", margin: "0 auto 16px",
            }} />
            <p style={{ color: `rgba(210,194,179,0.4)`, fontFamily: "monospace", fontSize: 12 }}>
              Generando resumen con IA...
            </p>
          </div>
        ) : (
          <div style={{
            color: COLORS.sand, fontSize: 14, lineHeight: 1.85, whiteSpace: "pre-wrap",
          }}>{summary}</div>
        )}

        <button onClick={onClose} style={{
          marginTop: 24, width: "100%", padding: "12px", borderRadius: 10,
          background: "rgba(210,194,179,0.06)", border: `1px solid rgba(210,194,179,0.12)`,
          color: `rgba(210,194,179,0.6)`, cursor: "pointer", fontSize: 14,
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
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Todas");
  const [tick, setTick] = useState(0);

  // Polling cada 5s — sincronización tiempo real
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

  // Progreso global = solo tareas de "App Nahueroute"
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
        background: COLORS.bgMaster,
        display: "flex", alignItems: "center", justifyContent: "center",
        backgroundImage: `
          radial-gradient(ellipse at 25% 25%, rgba(94,125,90,0.12) 0%, transparent 55%),
          radial-gradient(ellipse at 75% 75%, rgba(27,179,154,0.08) 0%, transparent 55%)
        `,
      }}>
        {/* Capa vintage sutil */}
        <div style={{
          position: "fixed", inset: 0, pointerEvents: "none",
          background: `rgba(214,201,168,0.03)`,
        }} />

        <div style={{ textAlign: "center", animation: "fadeUp 0.6s ease", position: "relative" }}>
          {/* Logo / Brand */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            marginBottom: 28,
            padding: "8px 20px",
            background: "rgba(210,194,179,0.05)",
            border: "1px solid rgba(210,194,179,0.1)",
            borderRadius: 40,
          }}>
            <span style={{ fontSize: 18, lineHeight: 1 }}>🗺</span>
            <div style={{ textAlign: "left" }}>
              <div style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 13, fontWeight: 700, color: COLORS.sand, letterSpacing: 0.3,
              }}>Squad Tracker</div>
              <div style={{
                fontFamily: "var(--font-space-mono), monospace",
                fontSize: 9, color: COLORS.greenLichen, letterSpacing: 1.5, textTransform: "uppercase",
              }}>by Interius</div>
            </div>
          </div>

          <p style={{
            color: `rgba(210,194,179,0.4)`, margin: "0 0 44px",
            fontSize: 13, fontFamily: "var(--font-space-mono), monospace",
            letterSpacing: 0.5,
          }}>
            ¿Quién eres hoy?
          </p>

          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {TEAM.map(name => {
              const col = TEAM_COLORS[name];
              return (
                <button key={name} onClick={() => setCurrentUser(name)} style={{
                  padding: "20px 28px", borderRadius: 16,
                  background: "rgba(210,194,179,0.04)",
                  border: `1px solid ${col}44`,
                  color: COLORS.sand, cursor: "pointer",
                  transition: "all 0.25s",
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                  minWidth: 110, fontFamily: "inherit",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = `${col}18`;
                    e.currentTarget.style.borderColor = col;
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = `0 12px 30px ${col}30`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = "rgba(210,194,179,0.04)";
                    e.currentTarget.style.borderColor = `${col}44`;
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span style={{
                    width: 44, height: 44, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${col}cc, ${col})`,
                    border: `2px solid ${col}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, fontWeight: 800, color: "#fff",
                    boxShadow: `0 4px 14px ${col}55`,
                  }}>{name[0]}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: COLORS.sand }}>{name}</span>
                </button>
              );
            })}
          </div>

          {/* Versión */}
          <p style={{
            marginTop: 48, fontSize: 10, color: `rgba(210,194,179,0.2)`,
            fontFamily: "monospace", letterSpacing: 1,
          }}>
            APP NAHUEROUTE · EQUIPO INTERIUS · v1.0
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
      background: COLORS.bgMaster,
      color: COLORS.sand,
      backgroundImage: `
        radial-gradient(ellipse at 5% 5%, ${userColor}0e 0%, transparent 45%),
        radial-gradient(ellipse at 95% 95%, rgba(27,179,154,0.06) 0%, transparent 45%)
      `,
    }}>
      {/* Capa vintage */}
      <div style={{
        position: "fixed", inset: 0, pointerEvents: "none",
        background: `rgba(214,201,168,0.025)`, zIndex: 0,
      }} />

      {/* ── HEADER ── */}
      <header style={{
        borderBottom: `1px solid rgba(210,194,179,0.08)`,
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        backdropFilter: "blur(12px)",
        position: "sticky", top: 0, zIndex: 100,
        background: `rgba(26,19,15,0.88)`,
        boxShadow: "0 1px 0 rgba(210,194,179,0.04)",
      }}>
        {/* Branding */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 12px 5px 8px",
            background: "rgba(210,194,179,0.05)",
            border: "1px solid rgba(210,194,179,0.1)",
            borderRadius: 30,
          }}>
            <span style={{ fontSize: 16 }}>🗺</span>
            <div>
              <div style={{
                fontFamily: "var(--font-space-grotesk), sans-serif",
                fontSize: 14, fontWeight: 700, color: COLORS.sand, letterSpacing: 0.2, lineHeight: 1.1,
              }}>Squad Tracker</div>
              <div style={{
                fontFamily: "var(--font-space-mono), monospace",
                fontSize: 8, color: COLORS.greenLichen, letterSpacing: 1.8, textTransform: "uppercase",
              }}>by Interius</div>
            </div>
          </div>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 20,
            background: `rgba(27,179,154,0.15)`, color: COLORS.emerald,
            fontFamily: "var(--font-space-mono), monospace", letterSpacing: 0.5,
          }}>● LIVE</span>
        </div>

        {/* Progreso Global — App Nahueroute */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 9, color: `rgba(210,194,179,0.4)`, fontFamily: "monospace", letterSpacing: 1.2, textTransform: "uppercase" }}>
              App Nahueroute
            </div>
            <div style={{
              fontSize: 22, fontWeight: 700,
              fontFamily: "var(--font-space-mono), monospace",
              color: userColor,
              lineHeight: 1.1,
            }}>{globalPct}%</div>
          </div>
          <Ring progress={globalPct} size={48} stroke={5} color={userColor} />
        </div>

        {/* Acciones */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Avatares */}
          <div style={{ display: "flex", marginRight: 4 }}>
            {TEAM.map(name => (
              <div key={name} title={name} style={{
                width: 30, height: 30, borderRadius: "50%",
                background: `linear-gradient(135deg, ${TEAM_COLORS[name]}cc, ${TEAM_COLORS[name]})`,
                border: `2px solid ${COLORS.bgMaster}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11, fontWeight: 800, color: "#fff",
                marginLeft: -7, opacity: name === currentUser ? 1 : 0.45,
                transition: "opacity 0.2s",
                boxShadow: name === currentUser ? `0 0 0 2px ${TEAM_COLORS[name]}` : "none",
              }}>{name[0]}</div>
            ))}
          </div>

          <button onClick={() => setShowSummary(true)} style={{
            padding: "7px 13px", borderRadius: 9,
            background: "rgba(210,194,179,0.06)",
            border: "1px solid rgba(210,194,179,0.12)",
            color: COLORS.sand, cursor: "pointer", fontSize: 12,
            fontFamily: "var(--font-space-mono), monospace",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(210,194,179,0.11)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(210,194,179,0.06)"}
          >📋 Resumen</button>

          <button onClick={() => setShowAddModal(true)} style={{
            padding: "7px 16px", borderRadius: 9,
            background: `linear-gradient(135deg, ${userColor}, ${COLORS.greenForest})`,
            border: "none", color: "#fff", cursor: "pointer",
            fontSize: 13, fontWeight: 800,
            fontFamily: "var(--font-space-mono), monospace",
            boxShadow: `0 4px 14px ${userColor}44`,
            transition: "all 0.2s",
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.88"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >+ Tarea</button>

          <button onClick={() => setCurrentUser(null)} style={{
            background: "rgba(210,194,179,0.06)",
            border: "1px solid rgba(210,194,179,0.1)",
            color: `rgba(210,194,179,0.5)`,
            cursor: "pointer", fontSize: 15, padding: "7px 10px", borderRadius: 9,
            transition: "all 0.2s",
          }} title="Cambiar usuario"
            onMouseEnter={e => e.currentTarget.style.color = COLORS.sand}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(210,194,179,0.5)"}
          >⇄</button>
        </div>
      </header>

      {/* ── STATS BAR ── */}
      <div style={{
        display: "flex", padding: "14px 24px 10px", gap: 8,
        borderBottom: `1px solid rgba(210,194,179,0.05)`,
        position: "relative", zIndex: 1,
      }}>
        {[
          { label: "Total",       value: tasks.length,                                                    icon: "◈" },
          { label: "Completadas", value: done,                                                             icon: "✓", color: COLORS.greenForest },
          { label: "En curso",    value: tasks.filter(t => t.progress > 0 && t.progress < 100).length,   icon: "↻", color: userColor },
          { label: "Pendientes",  value: tasks.filter(t => t.progress === 0).length,                      icon: "○", color: COLORS.khaki },
        ].map(s => (
          <div key={s.label} style={{
            flex: 1, padding: "10px 16px",
            background: "rgba(210,194,179,0.03)",
            border: "1px solid rgba(210,194,179,0.06)",
            borderRadius: 10,
          }}>
            <div style={{
              fontSize: 22, fontWeight: 800,
              fontFamily: "var(--font-space-mono), monospace",
              color: s.color || `rgba(210,194,179,0.65)`,
            }}>
              {loading ? "—" : s.value}
            </div>
            <div style={{ fontSize: 10, color: `rgba(210,194,179,0.3)`, fontFamily: "monospace", marginTop: 2 }}>
              {s.icon} {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── CATEGORY FILTER ── */}
      <div style={{ padding: "12px 24px", display: "flex", gap: 8, overflowX: "auto", position: "relative", zIndex: 1 }}>
        {allCategories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} style={{
            padding: "6px 16px", borderRadius: 20,
            border: activeCategory === cat
              ? `1px solid ${userColor}`
              : "1px solid rgba(210,194,179,0.1)",
            background: activeCategory === cat
              ? `${userColor}22`
              : "rgba(210,194,179,0.04)",
            color: activeCategory === cat ? userColor : `rgba(210,194,179,0.45)`,
            cursor: "pointer", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap",
            fontFamily: "var(--font-space-mono), monospace",
            transition: "all 0.2s",
          }}>
            {cat !== "Todas" && CAT_ICONS[cat] + " "}{cat}
          </button>
        ))}
      </div>

      {/* ── TASK COLUMNS ── */}
      <main style={{ padding: "4px 24px 48px", position: "relative", zIndex: 1 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{
              width: 40, height: 40,
              border: `3px solid rgba(210,194,179,0.1)`,
              borderTop: `3px solid ${userColor}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 16px",
            }} />
            <p style={{ color: `rgba(210,194,179,0.3)`, fontFamily: "monospace", fontSize: 11, letterSpacing: 1 }}>
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
                color: `rgba(210,194,179,0.2)`, fontFamily: "monospace", fontSize: 12,
              }}>
                Sin tareas todavía — ¡presiona "+ Tarea"!
              </div>
            )}
            {Object.entries(grouped).map(([cat, catTasks]) => {
              const catPct = calcProgress(catTasks);
              return (
                <div key={cat} style={{
                  ...cardBase,
                  borderRadius: 16, padding: 16,
                  borderTop: cat === "App Nahueroute"
                    ? `2px solid ${COLORS.emerald}`
                    : undefined,
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{CAT_ICONS[cat]}</span>
                      <span style={{
                        fontFamily: "var(--font-space-grotesk), sans-serif",
                        fontWeight: 700, fontSize: 13, color: COLORS.sand,
                      }}>{cat}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 10, color: `rgba(210,194,179,0.3)`, fontFamily: "monospace" }}>
                        {catTasks.filter(t => t.status === "done").length}/{catTasks.length}
                      </span>
                      <div style={{ width: 40, height: 4, borderRadius: 4, background: "rgba(210,194,179,0.08)", overflow: "hidden" }}>
                        <div style={{
                          height: "100%", width: `${catPct}%`,
                          background: cat === "App Nahueroute"
                            ? `linear-gradient(90deg, ${COLORS.greenLichen}, ${COLORS.emerald})`
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
