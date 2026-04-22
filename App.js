import { useState, useRef, useEffect } from "react";

const SMILEY_SYSTEM = `You are Smiley, a warm, friendly, and delightfully witty AI assistant living inside a desktop app. You're upbeat but not annoying, smart but never condescending, and you always bring a little warmth to the conversation. Use occasional light emoji but don't overdo it. Keep responses conversational and helpful. You're the user's personal AI companion — knowledgeable, caring, and always happy to chat about anything.`;

const SmileyFace = ({ size = 48, isThinking = false }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="22" fill="#FFD93D" stroke="#F4A500" strokeWidth="2"/>
    <circle cx="17" cy="20" r="3" fill="#3D2B00"/>
    <circle cx="31" cy="20" r="3" fill="#3D2B00"/>
    <circle cx="18" cy="19" r="1" fill="white"/>
    <circle cx="32" cy="19" r="1" fill="white"/>
    {isThinking
      ? <path d="M16 30 Q24 27 32 30" stroke="#3D2B00" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      : <path d="M16 28 Q24 36 32 28" stroke="#3D2B00" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    }
    {isThinking && <>
      <circle cx="36" cy="10" r="2"   fill="#F4A500" opacity="0.6"/>
      <circle cx="40" cy="14" r="1.5" fill="#F4A500" opacity="0.4"/>
      <circle cx="42" cy="9"  r="1"   fill="#F4A500" opacity="0.3"/>
    </>}
  </svg>
);

const TypingDots = () => (
  <div style={{ display:"flex", gap:5, alignItems:"center", padding:"4px 0" }}>
    {[0,1,2].map(i => (
      <div key={i} style={{
        width:8, height:8, borderRadius:"50%", background:"#F4A500",
        animation:"bounce 1.2s ease-in-out infinite",
        animationDelay:`${i*0.2}s`
      }}/>
    ))}
  </div>
);

// Custom title-bar window controls
const TitleBar = () => {
  const isElectron = !!window.electronAPI;
  if (!isElectron) return null;
  const btn = (color, hov, action, symbol) => {
    const [over, setOver] = useState(false);
    return (
      <div
        onClick={action}
        onMouseEnter={() => setOver(true)}
        onMouseLeave={() => setOver(false)}
        style={{
          width:13, height:13, borderRadius:"50%",
          background: over ? hov : color,
          cursor:"pointer", display:"flex", alignItems:"center",
          justifyContent:"center", transition:"background 0.15s",
          fontSize:9, color:"rgba(0,0,0,0.6)", fontWeight:"bold"
        }}
      >{over ? symbol : ""}</div>
    );
  };
  return (
    <div style={{
      WebkitAppRegion:"drag", height:40,
      display:"flex", alignItems:"center", paddingLeft:14, gap:8,
      position:"absolute", top:0, left:0, right:0, zIndex:100
    }}>
      {btn("#FF5F57","#FF5F57",() => window.electronAPI.close(),    "✕")}
      {btn("#FEBC2E","#FEBC2E",() => window.electronAPI.minimize(), "–")}
      {btn("#28C840","#28C840",() => window.electronAPI.maximize(), "+")}
    </div>
  );
};

export default function App() {
  const [messages,  setMessages]  = useState([
    { role:"assistant", content:"Hey there! 😊 I'm Smiley, your personal AI companion. What's on your mind today?" }
  ]);
  const [input,     setInput]     = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey,    setApiKey]    = useState(localStorage.getItem("smiley_api_key") || "");
  const [showSetup, setShowSetup] = useState(!localStorage.getItem("smiley_api_key"));
  const [keyInput,  setKeyInput]  = useState("");
  const [error,     setError]     = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);
  const isElectron = !!window.electronAPI;

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, isLoading]);

  const saveKey = () => {
    const k = keyInput.trim();
    if (!k.startsWith("sk-ant-")) { setError("Key should start with sk-ant-"); return; }
    localStorage.setItem("smiley_api_key", k);
    setApiKey(k);
    setShowSetup(false);
    setError(null);
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    setError(null);
    const newMessages = [...messages, { role:"user", content:text }];
    setMessages(newMessages);
    setIsLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": apiKey,
          "anthropic-version":"2023-06-01",
          "anthropic-dangerous-direct-browser-ipc":"true"
        },
        body: JSON.stringify({
          model:"claude-sonnet-4-20250514",
          max_tokens:1000,
          system: SMILEY_SYSTEM,
          messages: newMessages.map(m => ({ role:m.role, content:m.content }))
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      const reply = data.content?.map(b => b.text||"").join("") || "Hmm, I didn't get that!";
      setMessages(prev => [...prev, { role:"assistant", content:reply }]);
    } catch(e) {
      setError("Error: " + (e.message || "Something went wrong. Check your API key."));
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKey = e => {
    if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const clearChat = () => {
    setMessages([{ role:"assistant", content:"Fresh start! 😄 What would you like to talk about?" }]);
    setError(null);
  };

  // ── Setup screen ────────────────────────────────────────────
  if (showSetup) return (
    <div style={{
      minHeight:"100vh", background:"#1A1210",
      display:"flex", alignItems:"center", justifyContent:"center",
      backgroundImage:"radial-gradient(ellipse at 30% 30%, #2D1F0A, #1A1210 70%)"
    }}>
      {isElectron && <TitleBar/>}
      <div style={{
        width:420, background:"#221810", border:"1px solid #3D2B00",
        borderRadius:24, padding:"40px 36px",
        boxShadow:"0 32px 80px rgba(0,0,0,0.6)"
      }}>
        <div style={{ textAlign:"center", marginBottom:28 }}>
          <SmileyFace size={72}/>
          <div style={{ fontSize:32, fontWeight:"bold", color:"#FFD93D", marginTop:12, fontFamily:"Georgia,serif" }}>Smiley</div>
          <div style={{ color:"#8B6914", fontSize:14, marginTop:6, fontFamily:"Georgia,serif" }}>Your personal AI companion</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <label style={{ color:"#C8A24A", fontSize:13, display:"block", marginBottom:8, fontFamily:"Georgia,serif" }}>
            Anthropic API Key
          </label>
          <input
            type="password"
            value={keyInput}
            onChange={e => setKeyInput(e.target.value)}
            onKeyDown={e => e.key==="Enter" && saveKey()}
            placeholder="sk-ant-api03-..."
            style={{
              width:"100%", background:"#2A1C0C", border:"1.5px solid #3D2B00",
              borderRadius:10, padding:"11px 14px", color:"#E8D5A3",
              fontSize:14, fontFamily:"monospace", outline:"none"
            }}
          />
        </div>
        {error && <div style={{ color:"#E74C3C", fontSize:13, marginBottom:12 }}>{error}</div>}
        <button
          onClick={saveKey}
          style={{
            width:"100%", padding:"13px", background:"linear-gradient(135deg,#C98A00,#FFD93D)",
            border:"none", borderRadius:12, color:"#1A0F00", fontWeight:"bold",
            fontSize:15, cursor:"pointer", fontFamily:"Georgia,serif"
          }}
        >
          Start Chatting →
        </button>
        <p style={{ color:"#4A3210", fontSize:12, textAlign:"center", marginTop:16, fontFamily:"Georgia,serif", lineHeight:1.6 }}>
          Get a free API key at{" "}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer"
             style={{ color:"#8B6914" }}>console.anthropic.com</a>
        </p>
      </div>
    </div>
  );

  // ── Main chat UI ─────────────────────────────────────────────
  return (
    <div style={{
      height:"100vh", background:"#1A1210", display:"flex", flexDirection:"column",
      backgroundImage:"radial-gradient(ellipse at 20% 20%, #2D1F0A, #1A1210 60%)",
      fontFamily:"Georgia,serif", overflow:"hidden", position:"relative"
    }}>
      {isElectron && <TitleBar/>}

      {/* Header */}
      <div style={{
        padding: isElectron ? "50px 24px 14px" : "18px 24px 14px",
        display:"flex", alignItems:"center", gap:14,
        background:"linear-gradient(180deg,#2A1E10,#221810)",
        borderBottom:"1px solid #3D2B00", flexShrink:0
      }}>
        <div style={{ animation: isLoading ? "pulse 1.5s ease infinite" : "none", borderRadius:"50%" }}>
          <SmileyFace size={44} isThinking={isLoading}/>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:20, fontWeight:"bold", color:"#FFD93D" }}>Smiley</div>
          <div style={{ fontSize:12, color: isLoading ? "#C98A00" : "#5A7A3A", marginTop:1 }}>
            {isLoading ? "● thinking…" : "● online"}
          </div>
        </div>
        <button onClick={clearChat} style={{
          background:"none", border:"1px solid #3D2B00", borderRadius:8,
          color:"#6B5010", padding:"6px 14px", cursor:"pointer",
          fontSize:12, fontFamily:"inherit", transition:"color 0.2s"
        }}
          onMouseEnter={e => e.target.style.color="#FFD93D"}
          onMouseLeave={e => e.target.style.color="#6B5010"}
        >New Chat</button>
        <button onClick={() => { setShowSetup(true); setKeyInput(""); }} style={{
          background:"none", border:"1px solid #3D2B00", borderRadius:8,
          color:"#6B5010", padding:"6px 14px", cursor:"pointer",
          fontSize:12, fontFamily:"inherit", transition:"color 0.2s"
        }}
          onMouseEnter={e => e.target.style.color="#FFD93D"}
          onMouseLeave={e => e.target.style.color="#6B5010"}
        >⚙ Key</button>
      </div>

      {/* Messages */}
      <div style={{ flex:1, overflowY:"auto", padding:"20px 18px 8px", display:"flex", flexDirection:"column", gap:14 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display:"flex", animation:"fadeUp 0.3s ease forwards",
            justifyContent: msg.role==="user" ? "flex-end" : "flex-start",
            alignItems:"flex-end", gap:8
          }}>
            {msg.role==="assistant" && <SmileyFace size={28}/>}
            <div style={{
              maxWidth:"75%",
              background: msg.role==="user"
                ? "linear-gradient(135deg,#F4A500,#FFD93D)"
                : "#2E1F0E",
              color: msg.role==="user" ? "#1A0F00" : "#E8D5A3",
              borderRadius: msg.role==="user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              padding:"12px 16px", fontSize:14.5, lineHeight:1.65,
              border: msg.role==="assistant" ? "1px solid #3D2B00" : "none",
              whiteSpace:"pre-wrap", wordBreak:"break-word"
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display:"flex", alignItems:"flex-end", gap:8, animation:"fadeUp 0.3s ease forwards" }}>
            <SmileyFace size={28} isThinking/>
            <div style={{
              background:"#2E1F0E", border:"1px solid #3D2B00",
              borderRadius:"18px 18px 18px 4px", padding:"12px 18px"
            }}>
              <TypingDots/>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            textAlign:"center", color:"#C0392B", fontSize:13,
            background:"#2A0D0D", border:"1px solid #5C1A1A",
            borderRadius:10, padding:"8px 16px"
          }}>{error}</div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div style={{
        padding:"12px 14px 18px", borderTop:"1px solid #3D2B00",
        background:"#1E1308", flexShrink:0
      }}>
        <div style={{
          display:"flex", gap:10, alignItems:"flex-end",
          background:"#2A1C0C", border:"1.5px solid #3D2B00",
          borderRadius:16, padding:"8px 8px 8px 16px"
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Say something to Smiley…"
            rows={1}
            style={{
              flex:1, background:"none", border:"none", color:"#E8D5A3",
              fontSize:14.5, fontFamily:"inherit", resize:"none",
              lineHeight:1.6, padding:"4px 0", caretColor:"#FFD93D",
              maxHeight:120, overflowY:"auto", outline:"none"
            }}
            onInput={e => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            style={{
              width:40, height:40, borderRadius:11, border:"none",
              background: input.trim() && !isLoading ? "#C98A00" : "#3D2B00",
              cursor: input.trim() && !isLoading ? "pointer" : "default",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.2s", flexShrink:0
            }}
            onMouseEnter={e => { if(input.trim() && !isLoading) e.currentTarget.style.background="#F4A500"; }}
            onMouseLeave={e => { e.currentTarget.style.background = input.trim() && !isLoading ? "#C98A00" : "#3D2B00"; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div style={{ textAlign:"center", fontSize:11, color:"#4A3210", marginTop:7 }}>
          Enter to send · Shift+Enter for new line
        </div>
      </div>
    </div>
  );
}
