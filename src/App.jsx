import { useState, useEffect, useReducer, createContext, useContext, useRef, useMemo } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from "recharts";

const uuid = () => crypto.randomUUID?.() || Math.random().toString(36).substr(2, 9) + Date.now().toString(36);

const THEMES = {
  emerald: { accent: "#00ff88", accent2: "#6c63ff", bg: "#0d0f12", bg2: "#151820", card: "#1a1d26", border: "#252836", text: "#f0f2f8", muted: "#6b7080", warn: "#ffb830", danger: "#ff4560", name: "Emerald" },
  violet: { accent: "#a78bfa", accent2: "#f472b6", bg: "#0f0b1e", bg2: "#1a1333", card: "#211b3a", border: "#2e2650", text: "#f0ecff", muted: "#7c72a0", warn: "#fbbf24", danger: "#ef4444", name: "Violet" },
  cyan: { accent: "#22d3ee", accent2: "#818cf8", bg: "#0a1218", bg2: "#101d28", card: "#162534", border: "#1e3448", text: "#e8f4f8", muted: "#5f8ea0", warn: "#f59e0b", danger: "#f43f5e", name: "Cyan" },
  amber: { accent: "#f59e0b", accent2: "#ef4444", bg: "#12100a", bg2: "#1c1810", card: "#26211a", border: "#382f22", text: "#faf3e0", muted: "#8c7a5e", warn: "#fb923c", danger: "#dc2626", name: "Amber" },
  rose: { accent: "#fb7185", accent2: "#c084fc", bg: "#120d10", bg2: "#1c1519", card: "#261d22", border: "#382a30", text: "#fce8ef", muted: "#907078", warn: "#fbbf24", danger: "#ef4444", name: "Rose" },
  mint: { accent: "#34d399", accent2: "#60a5fa", bg: "#0b100e", bg2: "#121c18", card: "#1a2822", border: "#243830", text: "#e4f5ee", muted: "#5e8a78", warn: "#fbbf24", danger: "#f87171", name: "Mint" },
  ice: { accent: "#7dd3fc", accent2: "#c4b5fd", bg: "#090e14", bg2: "#0f1a28", card: "#162030", border: "#1e3045", text: "#e8f0fa", muted: "#5a7a98", warn: "#fbbf24", danger: "#fb7185", name: "Ice" },
  sunset: { accent: "#fb923c", accent2: "#a78bfa", bg: "#14100c", bg2: "#1e1812", card: "#28201a", border: "#3a2e22", text: "#faf0e6", muted: "#8a7560", warn: "#fde047", danger: "#ef4444", name: "Sunset" },
};
let T = { ...THEMES.emerald };
const getTheme = (n) => THEMES[n] || THEMES.emerald;

const UNCAT_ID = "__uncategorized__";
const UNCAT = { id: UNCAT_ID, name: "Uncategorized", icon: "❓", color: "#6b7080", budgetAllocation: null };
const makeCats = () => [
  { id: uuid(), name: "Housing", icon: "🏠", color: "#6c63ff", budgetAllocation: null },
  { id: uuid(), name: "Food & Dining", icon: "🍔", color: "#ff6b6b", budgetAllocation: null },
  { id: uuid(), name: "Transport", icon: "🚗", color: "#ffd93d", budgetAllocation: null },
  { id: uuid(), name: "Shopping", icon: "🛍️", color: "#ff9ff3", budgetAllocation: null },
  { id: uuid(), name: "Health", icon: "💊", color: "#48dbfb", budgetAllocation: null },
  { id: uuid(), name: "Entertainment", icon: "🎮", color: "#ff6348", budgetAllocation: null },
  { id: uuid(), name: "Utilities", icon: "💡", color: "#feca57", budgetAllocation: null },
  { id: uuid(), name: "Subscriptions", icon: "📱", color: "#a29bfe", budgetAllocation: null },
  { id: uuid(), name: "Work", icon: "💼", color: "#55a8fd", budgetAllocation: null },
  { id: uuid(), name: "Education", icon: "🎓", color: "#5f27cd", budgetAllocation: null },
  { id: uuid(), name: "Travel", icon: "✈️", color: "#01a3a4", budgetAllocation: null },
  { id: uuid(), name: "Miscellaneous", icon: "💸", color: "#576574", budgetAllocation: null },
];
const CURRENCIES = ["USD","EUR","GBP","JPY","CAD","AUD","CHF","CNY","INR","BRL"];
const ICONS = ["🏠","🍔","🚗","🛍️","💊","🎮","💡","📱","💼","🎓","✈️","💸","💰","🎵","📚","🐾","🏋️","☕","🎁","🔧","💻","📺","🍕","⚡","🌐","🏦","💎","🚀","🎨","🏖️","❓"];
const CCOLORS = ["#6c63ff","#ff6b6b","#ffd93d","#ff9ff3","#48dbfb","#ff6348","#feca57","#a29bfe","#55a8fd","#5f27cd","#01a3a4","#576574","#00ff88","#f472b6","#34d399","#fb923c"];

const SKEY = "finflow_v2";
const load = () => { try { return JSON.parse(localStorage.getItem(SKEY)) || null; } catch { return null; } };
const save = (d) => { try { localStorage.setItem(SKEY, JSON.stringify(d)); } catch {} };

const AppCtx = createContext();

const init = { onboarded: false, page: "dashboard", showModal: false, showCmd: false, modalType: "expense",
  budgets: [], transactions: [], subscriptions: [], goals: [], activeBudgetId: null, displayName: "", currency: "USD", theme: "emerald" };

function reducer(s, a) {
  switch (a.type) {
    case "LOAD": return { ...s, ...a.payload };
    case "SET": return { ...s, [a.key]: a.value };
    case "ADD_BUDGET": return { ...s, budgets: [...s.budgets, a.p], activeBudgetId: a.p.id, onboarded: true, page: "dashboard" };
    case "UPD_BUDGET": return { ...s, budgets: s.budgets.map(b => b.id === a.p.id ? a.p : b) };
    case "ADD_TRANS": return { ...s, transactions: [...s.transactions, a.p], showModal: false };
    case "DEL_TRANS": return { ...s, transactions: s.transactions.filter(e => e.id !== a.id) };
    case "ADD_SUB": return { ...s, subscriptions: [...s.subscriptions, a.p] };
    case "UPD_SUB": return { ...s, subscriptions: s.subscriptions.map(x => x.id === a.p.id ? a.p : x) };
    case "DEL_SUB": return { ...s, subscriptions: s.subscriptions.filter(x => x.id !== a.id) };
    case "ADD_GOAL": return { ...s, goals: [...s.goals, a.p] };
    case "UPD_GOAL": return { ...s, goals: s.goals.map(g => g.id === a.p.id ? a.p : g) };
    case "DEL_GOAL": return { ...s, goals: s.goals.filter(g => g.id !== a.id) };
    case "DEL_CAT": return { ...s,
      budgets: s.budgets.map(b => b.id === a.bid ? { ...b, categories: b.categories.filter(c => c.id !== a.cid) } : b),
      transactions: s.transactions.map(t => t.categoryId === a.cid ? { ...t, categoryId: UNCAT_ID } : t),
      subscriptions: s.subscriptions.map(x => x.categoryId === a.cid ? { ...x, categoryId: UNCAT_ID } : x) };
    case "ADD_CAT": return { ...s, budgets: s.budgets.map(b => b.id === a.bid ? { ...b, categories: [...b.categories, a.p] } : b) };
    case "IMPORT": return { ...s, ...a.payload };
    default: return s;
  }
}

const fmt = (n, c) => { try { return new Intl.NumberFormat("en-US", { style:"currency", currency: c||"USD", minimumFractionDigits:0, maximumFractionDigits:2 }).format(n); } catch { return "$"+n.toFixed(2); } };
const fmtD = d => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric"});
const fmtDF = d => new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const dBetween = (a,b) => Math.max(1, Math.ceil((new Date(b)-new Date(a))/864e5));
const tdy = () => new Date().toISOString().split("T")[0];
const clamp = (v,mn,mx) => Math.min(mx,Math.max(mn,v));
const eom = () => { const d=new Date(); d.setMonth(d.getMonth()+1,0); return d.toISOString().split("T")[0]; };
const getCat = (b,id) => { if(!b)return UNCAT; if(id===UNCAT_ID)return UNCAT; return b.categories.find(c=>c.id===id)||UNCAT; };
const allCats = b => b ? [...b.categories, UNCAT] : [UNCAT];

function AnimNum({ value, prefix="", dur=700 }) {
  const [d, setD] = useState(0); const r = useRef();
  useEffect(() => { const t0=performance.now(); const tick=now=>{ const p=Math.min(1,(now-t0)/dur); setD(value*(1-Math.pow(1-p,3))); if(p<1)r.current=requestAnimationFrame(tick); }; r.current=requestAnimationFrame(tick); return ()=>cancelAnimationFrame(r.current); }, [value,dur]);
  return <span>{prefix}{Math.abs(value)>=100?Math.round(d).toLocaleString():d.toFixed(2)}</span>;
}

function Card({ children, hover=true, glow=false, style={} }) {
  return <div style={{ background:`linear-gradient(135deg,${T.card}f2,${T.bg2}e6)`, border:`1px solid ${glow?T.accent+"28":T.border}`, borderRadius:"12px", padding:"20px", backdropFilter:"blur(20px)", transition:"all 0.3s cubic-bezier(0.4,0,0.2,1)", ...style }}
    onMouseEnter={e=>{if(hover){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=glow?`0 8px 32px ${T.accent}14`:"0 8px 32px rgba(0,0,0,0.3)";}}}
    onMouseLeave={e=>{if(hover){e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}}>{children}</div>;
}

function ArcGauge({ value, size=120, label }) {
  const r=(size-12)/2, c=Math.PI*r, pct=clamp(value,0,100)/100, color=value>70?T.accent:value>40?T.warn:T.danger;
  return <div style={{textAlign:"center"}}>
    <svg width={size} height={size/2+16} viewBox={`0 0 ${size} ${size/2+16}`}>
      <path d={`M 6 ${size/2+6} A ${r} ${r} 0 0 1 ${size-6} ${size/2+6}`} fill="none" stroke={T.border} strokeWidth="8" strokeLinecap="round"/>
      <path d={`M 6 ${size/2+6} A ${r} ${r} 0 0 1 ${size-6} ${size/2+6}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${c/2}`} strokeDashoffset={`${(c/2)*(1-pct)}`} style={{transition:"stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1),stroke 0.5s"}}/>
      <text x={size/2} y={size/2} textAnchor="middle" fill={T.text} fontSize="22" fontFamily="'Courier New',monospace" fontWeight="700">{Math.round(value)}</text>
    </svg>
    {label&&<div style={{fontSize:"11px",color:T.muted,marginTop:"-4px",letterSpacing:"0.05em",textTransform:"uppercase"}}>{label}</div>}
  </div>;
}

function Modal({ open, onClose, title, children, width=520 }) {
  if(!open) return null;
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"20px",animation:"fadeIn 0.2s"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.bg2,border:`1px solid ${T.border}`,borderRadius:"16px",width:"100%",maxWidth:width,maxHeight:"85vh",overflow:"auto",padding:"28px",animation:"slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"20px"}}>
        <h2 style={{margin:0,fontSize:"20px",color:T.text,fontWeight:700}}>{title}</h2>
        <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,fontSize:"20px",cursor:"pointer"}}>✕</button>
      </div>{children}</div></div>;
}

function Inp({ label, ...p }) {
  return <div style={{marginBottom:"14px"}}>
    {label&&<label style={{display:"block",fontSize:"12px",color:T.muted,marginBottom:"6px",letterSpacing:"0.04em",textTransform:"uppercase"}}>{label}</label>}
    <input {...p} style={{width:"100%",padding:"10px 14px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:"8px",color:T.text,fontSize:"14px",outline:"none",boxSizing:"border-box",transition:"border-color 0.2s",fontFamily:p.type==="number"?"'Courier New',monospace":"inherit",...p.style}}
      onFocus={e=>e.target.style.borderColor=T.accent} onBlur={e=>e.target.style.borderColor=T.border}/></div>;
}

function Sel({ label, options, ...p }) {
  return <div style={{marginBottom:"14px"}}>
    {label&&<label style={{display:"block",fontSize:"12px",color:T.muted,marginBottom:"6px",letterSpacing:"0.04em",textTransform:"uppercase"}}>{label}</label>}
    <select {...p} style={{width:"100%",padding:"10px 14px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:"8px",color:T.text,fontSize:"14px",outline:"none",boxSizing:"border-box",...p.style}}>
      {options.map(o=><option key={typeof o==="string"?o:o.value} value={typeof o==="string"?o:o.value}>{typeof o==="string"?o:o.label}</option>)}</select></div>;
}

function Btn({ children, variant="primary", onClick, style={}, disabled }) {
  const b={padding:"10px 20px",borderRadius:"8px",fontSize:"14px",fontWeight:600,cursor:disabled?"not-allowed":"pointer",border:"none",transition:"all 0.2s",opacity:disabled?0.5:1,flexShrink:0};
  const v={primary:{...b,background:T.accent,color:T.bg,...style},secondary:{...b,background:T.accent+"18",color:T.accent,...style},ghost:{...b,background:"transparent",color:T.muted,border:`1px solid ${T.border}`,...style},danger:{...b,background:T.danger+"18",color:T.danger,...style}};
  return <button onClick={onClick} disabled={disabled} style={v[variant]}>{children}</button>;
}

function IconBtn({ children, onClick, active, style={} }) {
  return <button onClick={onClick} style={{background:active?T.accent+"15":"transparent",border:"none",color:active?T.accent:T.muted,padding:"10px",borderRadius:"10px",cursor:"pointer",fontSize:"18px",transition:"all 0.2s",display:"flex",alignItems:"center",gap:"10px",width:"100%",...style}}>{children}</button>;
}

// ── Onboarding ──
function Onboarding() {
  const {dispatch}=useContext(AppCtx); const [step,setStep]=useState(0);
  const [nm,setNm]=useState("Monthly Budget"); const [st,setSt]=useState(tdy());
  const [en,setEn]=useState(()=>{const d=new Date();d.setMonth(d.getMonth()+1);return d.toISOString().split("T")[0];});
  const [amt,setAmt]=useState(3000); const [cur,setCur]=useState("USD");
  const [cats]=useState(makeCats); const [dn,setDn]=useState(""); const [pre,setPre]=useState("monthly"); const [th,setTh]=useState("emerald");
  const apply=p=>{setPre(p);const n=new Date();if(p==="weekly"){setSt(tdy());n.setDate(n.getDate()+7);setEn(n.toISOString().split("T")[0]);}else if(p==="monthly"){setSt(tdy());n.setMonth(n.getMonth()+1);setEn(n.toISOString().split("T")[0]);}else{setSt(tdy());n.setMonth(n.getMonth()+3);setEn(n.toISOString().split("T")[0]);}};
  const finish=()=>{dispatch({type:"SET",key:"displayName",value:dn});dispatch({type:"SET",key:"currency",value:cur});dispatch({type:"SET",key:"theme",value:th});dispatch({type:"ADD_BUDGET",p:{id:uuid(),name:nm,startDate:st,endDate:en,totalAmount:Number(amt),currency:cur,categories:cats,createdAt:new Date().toISOString()}});};
  const cT=getTheme(th);
  return <div style={{minHeight:"100vh",background:cT.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"}}>
    <div style={{width:"100%",maxWidth:540}}>
      <div style={{textAlign:"center",marginBottom:"40px"}}><div style={{fontSize:"36px",fontWeight:800,color:cT.text,letterSpacing:"-0.02em"}}><span style={{color:cT.accent}}>Fin</span>Flow</div><p style={{color:cT.muted,marginTop:"8px",fontSize:"15px"}}>Your finances, beautifully organized.</p></div>
      <div style={{display:"flex",gap:"8px",marginBottom:"32px"}}>{[0,1,2].map(i=><div key={i} style={{flex:1,height:3,borderRadius:2,background:i<=step?cT.accent:cT.border,transition:"background 0.3s"}}/>)}</div>
      <div style={{background:`linear-gradient(135deg,${cT.card}f2,${cT.bg2}e6)`,border:`1px solid ${cT.border}`,borderRadius:"12px",padding:"24px"}}>
        {step===0&&<><h3 style={{color:cT.text,margin:"0 0 20px",fontSize:"18px"}}>Set up your budget period</h3>
          <Inp label="Budget Name" value={nm} onChange={e=>setNm(e.target.value)}/>
          <div style={{display:"flex",gap:"8px",marginBottom:"14px"}}>{["weekly","monthly","quarterly"].map(p=><button key={p} onClick={()=>apply(p)} style={{flex:1,padding:"8px",borderRadius:"8px",fontSize:"12px",fontWeight:600,textTransform:"uppercase",background:pre===p?cT.accent+"18":"transparent",color:pre===p?cT.accent:cT.muted,border:`1px solid ${pre===p?cT.accent+"40":cT.border}`,cursor:"pointer",transition:"all 0.2s"}}>{p}</button>)}</div>
          <div style={{display:"flex",gap:"12px"}}><Inp label="Start" type="date" value={st} onChange={e=>setSt(e.target.value)}/><Inp label="End" type="date" value={en} onChange={e=>setEn(e.target.value)}/></div>
          <div style={{display:"flex",gap:"12px"}}><div style={{flex:2}}><Inp label="Total Budget" type="number" value={amt} onChange={e=>setAmt(e.target.value)}/></div><div style={{flex:1}}><Sel label="Currency" options={CURRENCIES} value={cur} onChange={e=>setCur(e.target.value)}/></div></div></>}
        {step===1&&<><h3 style={{color:cT.text,margin:"0 0 20px",fontSize:"18px"}}>Choose your theme</h3>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"10px",marginBottom:"16px"}}>{Object.entries(THEMES).map(([k,t])=><button key={k} onClick={()=>setTh(k)} style={{padding:"12px 8px",borderRadius:"10px",border:`2px solid ${th===k?t.accent:t.border}`,background:t.bg2,cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}><div style={{width:24,height:24,borderRadius:"50%",background:t.accent,margin:"0 auto 6px"}}/><div style={{fontSize:"11px",color:t.text,fontWeight:500}}>{t.name}</div></button>)}</div>
          <p style={{color:cT.muted,fontSize:"12px"}}>Categories & themes can be customized anytime in Settings.</p></>}
        {step===2&&<><h3 style={{color:cT.text,margin:"0 0 20px",fontSize:"18px"}}>Almost there!</h3><Inp label="Your Name (optional)" value={dn} onChange={e=>setDn(e.target.value)} placeholder="How should we greet you?"/><p style={{color:cT.muted,fontSize:"13px",lineHeight:1.6}}>Everything stored locally. No accounts, no cloud, no tracking.</p></>}
        <div style={{display:"flex",justifyContent:"space-between",marginTop:"24px"}}>{step>0?<Btn variant="ghost" onClick={()=>setStep(s=>s-1)}>Back</Btn>:<div/>}{step<2?<Btn onClick={()=>setStep(s=>s+1)}>Continue</Btn>:<Btn onClick={finish}>Launch FinFlow ✨</Btn>}</div>
      </div></div></div>;
}

// ── Transaction Modal ──
function TransModal() {
  const {state:s,dispatch:d}=useContext(AppCtx); const b=s.budgets.find(x=>x.id===s.activeBudgetId); const cats=b?allCats(b):[];
  const isInc=s.modalType==="income";
  const [amt,setAmt]=useState(""); const [title,setTitle]=useState(""); const [catId,setCat]=useState(cats[0]?.id||""); const [date,setDate]=useState(tdy()); const [note,setNote]=useState(""); const [rec,setRec]=useState(false);
  useEffect(()=>{if(s.showModal){setAmt("");setTitle("");setDate(tdy());setNote("");setCat(cats[0]?.id||"");setRec(false);}},[s.showModal,s.modalType]);
  const submit=()=>{if(!amt||!title)return;d({type:"ADD_TRANS",p:{id:uuid(),budgetId:s.activeBudgetId,amount:Number(amt),title,categoryId:catId,date,note,type:isInc?"income":"expense",isRecurring:rec,createdAt:new Date().toISOString()}});};
  return <Modal open={s.showModal} onClose={()=>d({type:"SET",key:"showModal",value:false})} title={isInc?"Add Income":"Add Expense"}>
    <div style={{display:"flex",gap:"4px",marginBottom:"20px",background:T.bg,borderRadius:"8px",padding:"4px"}}>
      {["expense","income"].map(t=><button key={t} onClick={()=>d({type:"SET",key:"modalType",value:t})} style={{flex:1,padding:"8px",borderRadius:"6px",border:"none",fontSize:"13px",fontWeight:600,cursor:"pointer",transition:"all 0.2s",background:s.modalType===t?(t==="income"?T.accent+"20":T.danger+"20"):"transparent",color:s.modalType===t?(t==="income"?T.accent:T.danger):T.muted,textTransform:"capitalize"}}>{t}</button>)}</div>
    <div style={{textAlign:"center",marginBottom:"16px"}}>
      <input value={amt} onChange={e=>setAmt(e.target.value)} type="number" placeholder="0.00" autoFocus style={{fontSize:"42px",fontFamily:"'Courier New',monospace",fontWeight:700,color:isInc?T.accent:T.danger,background:"none",border:"none",outline:"none",textAlign:"center",width:"100%"}}/>
      <div style={{fontSize:"12px",color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>{isInc?"+":"-"} {s.currency}</div></div>
    <Inp label="Title" value={title} onChange={e=>setTitle(e.target.value)} placeholder={isInc?"e.g. Salary, Freelance":"e.g. Groceries, Netflix"}/>
    <Sel label="Category" value={catId} onChange={e=>setCat(e.target.value)} options={cats.map(c=>({value:c.id,label:`${c.icon} ${c.name}`}))}/>
    <Inp label="Date" type="date" value={date} onChange={e=>setDate(e.target.value)}/>
    <Inp label="Note (optional)" value={note} onChange={e=>setNote(e.target.value)} placeholder="Add a memo..."/>
    <label style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"14px",cursor:"pointer",fontSize:"13px",color:T.muted}}><input type="checkbox" checked={rec} onChange={e=>setRec(e.target.checked)} style={{accentColor:T.accent}}/> Recurring</label>
    <div style={{display:"flex",justifyContent:"flex-end",gap:"8px"}}><Btn variant="ghost" onClick={()=>d({type:"SET",key:"showModal",value:false})}>Cancel</Btn><Btn onClick={submit} disabled={!amt||!title}>{isInc?"Add Income":"Add Expense"}</Btn></div>
  </Modal>;
}

// ── Edit Budget Modal ──
function EditBudgetModal({open,onClose}){
  const {state:s,dispatch:d}=useContext(AppCtx); const b=s.budgets.find(x=>x.id===s.activeBudgetId);
  const [nm,setNm]=useState(""); const [amt,setAmt]=useState(0); const [st,setSt]=useState(""); const [en,setEn]=useState("");
  useEffect(()=>{if(open&&b){setNm(b.name);setAmt(b.totalAmount);setSt(b.startDate);setEn(b.endDate);}},[open,b]);
  return <Modal open={open} onClose={onClose} title="Edit Budget">
    <Inp label="Budget Name" value={nm} onChange={e=>setNm(e.target.value)}/>
    <Inp label="Total Budget" type="number" value={amt} onChange={e=>setAmt(e.target.value)}/>
    <div style={{display:"flex",gap:"12px"}}><Inp label="Start" type="date" value={st} onChange={e=>setSt(e.target.value)}/><Inp label="End" type="date" value={en} onChange={e=>setEn(e.target.value)}/></div>
    <div style={{display:"flex",justifyContent:"flex-end",gap:"8px"}}><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={()=>{d({type:"UPD_BUDGET",p:{...b,name:nm,totalAmount:Number(amt),startDate:st,endDate:en}});onClose();}}>Save</Btn></div>
  </Modal>;
}

// ── Category Manager ──
function CatManager({open,onClose}){
  const {state:s,dispatch:d}=useContext(AppCtx); const b=s.budgets.find(x=>x.id===s.activeBudgetId);
  const [nn,setNn]=useState(""); const [ni,setNi]=useState("💰"); const [nc,setNc]=useState("#00ff88"); const [sp,setSp]=useState(false);
  if(!b) return null;
  const add=()=>{if(!nn.trim())return;d({type:"ADD_CAT",bid:b.id,p:{id:uuid(),name:nn.trim(),icon:ni,color:nc,budgetAllocation:null}});setNn("");setNi("💰");};
  const del=cid=>{const c=b.categories.find(x=>x.id===cid);const n=s.transactions.filter(t=>t.categoryId===cid).length;if(confirm(`Delete "${c.name}"?${n>0?` ${n} transaction(s) will become Uncategorized.`:""}`))d({type:"DEL_CAT",cid,bid:b.id});};
  return <Modal open={open} onClose={onClose} title="Manage Categories" width={560}>
    <div style={{maxHeight:300,overflow:"auto",marginBottom:"20px"}}>{b.categories.map(c=>{
      const n=s.transactions.filter(t=>t.categoryId===c.id).length;
      return <div key={c.id} style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}>
        <span style={{fontSize:"20px"}}>{c.icon}</span><div style={{width:14,height:14,borderRadius:"50%",background:c.color,flexShrink:0}}/><span style={{color:T.text,fontSize:"14px",flex:1}}>{c.name}</span><span style={{color:T.muted,fontSize:"11px"}}>{n}</span>
        <button onClick={()=>del(c.id)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:"14px",opacity:0.5}} onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=0.5}>✕</button></div>;})}
      {s.transactions.some(t=>t.categoryId===UNCAT_ID)&&<div style={{display:"flex",alignItems:"center",gap:"10px",padding:"10px 0",opacity:0.6}}><span style={{fontSize:"20px"}}>❓</span><span style={{color:T.muted,fontSize:"14px",flex:1}}>Uncategorized</span><span style={{color:T.muted,fontSize:"11px"}}>{s.transactions.filter(t=>t.categoryId===UNCAT_ID).length}</span></div>}
    </div>
    <div style={{background:T.bg,borderRadius:"10px",padding:"16px"}}><div style={{fontSize:"12px",color:T.muted,textTransform:"uppercase",marginBottom:"12px"}}>Add New Category</div>
      <div style={{display:"flex",gap:"8px",alignItems:"flex-end"}}>
        <div style={{position:"relative"}}><label style={{display:"block",fontSize:"11px",color:T.muted,marginBottom:"4px"}}>Icon</label>
          <button onClick={()=>setSp(!sp)} style={{width:42,height:42,borderRadius:"8px",border:`1px solid ${T.border}`,background:T.bg2,fontSize:"20px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>{ni}</button>
          {sp&&<div style={{position:"absolute",top:"100%",left:0,zIndex:10,background:T.bg2,border:`1px solid ${T.border}`,borderRadius:"8px",padding:"8px",display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:"4px",width:260}}>{ICONS.map(ic=><button key={ic} onClick={()=>{setNi(ic);setSp(false);}} style={{width:28,height:28,border:"none",background:ni===ic?T.accent+"20":"transparent",borderRadius:"4px",fontSize:"16px",cursor:"pointer"}}>{ic}</button>)}</div>}</div>
        <div style={{flex:1}}><Inp label="Name" value={nn} onChange={e=>setNn(e.target.value)} placeholder="Category name" style={{marginBottom:0}}/></div>
        <div><label style={{display:"block",fontSize:"11px",color:T.muted,marginBottom:"4px"}}>Color</label><div style={{display:"flex",gap:"4px"}}>{CCOLORS.slice(0,6).map(c=><div key={c} onClick={()=>setNc(c)} style={{width:20,height:20,borderRadius:"50%",background:c,cursor:"pointer",border:nc===c?"2px solid white":"2px solid transparent"}}/>)}</div></div>
        <Btn onClick={add} disabled={!nn.trim()} style={{height:42,padding:"0 16px"}}>Add</Btn></div></div>
  </Modal>;
}

// ── Sub Modal ──
function SubModal({open,onClose,edit}){
  const {state:s,dispatch:d}=useContext(AppCtx); const b=s.budgets.find(x=>x.id===s.activeBudgetId); const cats=b?allCats(b):[];
  const sc=b?.categories.find(c=>c.name==="Subscriptions");
  const [nm,setNm]=useState(""); const [amt,setAmt]=useState(""); const [cy,setCy]=useState("monthly"); const [nd,setNd]=useState(tdy()); const [ci,setCi]=useState(""); const [st,setSt]=useState("active"); const [nt,setNt]=useState("");
  useEffect(()=>{if(edit){setNm(edit.name);setAmt(edit.amount);setCy(edit.billingCycle);setNd(edit.nextBillingDate);setCi(edit.categoryId);setSt(edit.status);setNt(edit.notes||"");}else{setNm("");setAmt("");setCy("monthly");setNd(tdy());setCi(sc?.id||cats[0]?.id||"");setSt("active");setNt("");}},[edit,open]);
  const sub=()=>{if(!nm||!amt)return;d({type:edit?"UPD_SUB":"ADD_SUB",p:{id:edit?.id||uuid(),name:nm,logo:null,amount:Number(amt),billingCycle:cy,nextBillingDate:nd,categoryId:ci,cancelUrl:"",trialEndDate:null,status:st,notes:nt,createdAt:edit?.createdAt||new Date().toISOString()}});onClose();};
  return <Modal open={open} onClose={onClose} title={edit?"Edit Subscription":"Add Subscription"}>
    <Inp label="Service Name" value={nm} onChange={e=>setNm(e.target.value)} placeholder="e.g. Netflix"/>
    <div style={{display:"flex",gap:"12px"}}><div style={{flex:1}}><Inp label="Amount" type="number" value={amt} onChange={e=>setAmt(e.target.value)}/></div><div style={{flex:1}}><Sel label="Cycle" value={cy} onChange={e=>setCy(e.target.value)} options={["weekly","biweekly","monthly","quarterly","annually"]}/></div></div>
    <Inp label="Next Billing" type="date" value={nd} onChange={e=>setNd(e.target.value)}/>
    <Sel label="Category" value={ci} onChange={e=>setCi(e.target.value)} options={cats.map(c=>({value:c.id,label:`${c.icon} ${c.name}`}))}/>
    <Sel label="Status" value={st} onChange={e=>setSt(e.target.value)} options={["active","paused","cancelled"]}/>
    <Inp label="Notes" value={nt} onChange={e=>setNt(e.target.value)}/>
    <div style={{display:"flex",justifyContent:"flex-end",gap:"8px"}}><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={sub} disabled={!nm||!amt}>{edit?"Save":"Add"}</Btn></div>
  </Modal>;
}

// ── Goal Modal ──
function GoalModal({open,onClose,edit}){
  const {state:s,dispatch:d}=useContext(AppCtx);
  const [nm,setNm]=useState(""); const [tg,setTg]=useState(""); const [cr,setCr]=useState(0); const [td2,setTd]=useState(()=>{const x=new Date();x.setMonth(x.getMonth()+6);return x.toISOString().split("T")[0];}); const [cl,setCl]=useState(T.accent);
  useEffect(()=>{if(edit){setNm(edit.name);setTg(edit.targetAmount);setCr(edit.currentAmount);setTd(edit.targetDate);setCl(edit.color);}else{setNm("");setTg("");setCr(0);}},[edit,open]);
  const sub=()=>{if(!nm||!tg)return;d({type:edit?"UPD_GOAL":"ADD_GOAL",p:{id:edit?.id||uuid(),name:nm,targetAmount:Number(tg),currentAmount:Number(cr),targetDate:td2,linkedBudgetId:s.activeBudgetId,color:cl,createdAt:edit?.createdAt||new Date().toISOString()}});onClose();};
  return <Modal open={open} onClose={onClose} title={edit?"Edit Goal":"New Goal"}>
    <Inp label="Goal Name" value={nm} onChange={e=>setNm(e.target.value)} placeholder="e.g. Emergency Fund"/>
    <div style={{display:"flex",gap:"12px"}}><div style={{flex:1}}><Inp label="Target" type="number" value={tg} onChange={e=>setTg(e.target.value)}/></div><div style={{flex:1}}><Inp label="Saved" type="number" value={cr} onChange={e=>setCr(e.target.value)}/></div></div>
    <Inp label="Target Date" type="date" value={td2} onChange={e=>setTd(e.target.value)}/>
    <div style={{marginBottom:"14px"}}><label style={{display:"block",fontSize:"12px",color:T.muted,marginBottom:"6px",textTransform:"uppercase"}}>Color</label><div style={{display:"flex",gap:"8px"}}>{[T.accent,T.accent2,T.warn,T.danger,"#48dbfb","#ff9ff3","#feca57"].map(c=><div key={c} onClick={()=>setCl(c)} style={{width:28,height:28,borderRadius:"50%",background:c,cursor:"pointer",border:cl===c?"2px solid white":"2px solid transparent"}}/>)}</div></div>
    <div style={{display:"flex",justifyContent:"flex-end",gap:"8px"}}><Btn variant="ghost" onClick={onClose}>Cancel</Btn><Btn onClick={sub} disabled={!nm||!tg}>{edit?"Save":"Create"}</Btn></div>
  </Modal>;
}

// ── Dashboard ──
function Dashboard(){
  const {state:s,dispatch:d}=useContext(AppCtx); const b=s.budgets.find(x=>x.id===s.activeBudgetId); const [showEB,setSEB]=useState(false);
  if(!b) return null;
  const tx=s.transactions.filter(e=>e.budgetId===b.id); const exp=tx.filter(t=>t.type==="expense"); const inc=tx.filter(t=>t.type==="income");
  const totE=exp.reduce((a,e)=>a+e.amount,0); const totI=inc.reduce((a,e)=>a+e.amount,0);
  const bal=b.totalAmount+totI-totE;
  const tD=dBetween(b.startDate,b.endDate); const dE=dBetween(b.startDate,tdy()); const dL=Math.max(0,tD-dE);
  const dT=b.totalAmount/tD; const dA=dE>0?totE/dE:0; const dIR=dE>0?totI/dE:0;
  const pEE=dA*tD; const pEI=dIR*tD; const pEnd=b.totalAmount+pEI-pEE;
  const eomS=eom(); const dToE=dBetween(tdy(),eomS); const mEB=b.totalAmount+(totI+dIR*dToE)-(totE+dA*dToE);
  const hs=Math.round(clamp(100-((totE/b.totalAmount)*100-(dE/tD*100))*2,0,100));

  // Upcoming 7d
  const now=new Date(tdy()); const in7=new Date(now); in7.setDate(in7.getDate()+7);
  const up7=[];
  s.subscriptions.filter(x=>x.status==="active").forEach(x=>{const nd=new Date(x.nextBillingDate);if(nd>=now&&nd<=in7)up7.push({id:x.id,title:x.name,amount:x.amount,date:x.nextBillingDate,type:"expense",categoryId:x.categoryId,isSub:true});});
  tx.filter(t=>{const dd=new Date(t.date);return dd>now&&dd<=in7;}).forEach(t=>{if(!up7.find(u=>u.id===t.id))up7.push(t);});
  up7.sort((a,c)=>new Date(a.date)-new Date(c.date));

  const catData=allCats(b).map(c=>({name:c.name,value:exp.filter(e=>e.categoryId===c.id).reduce((a,e)=>a+e.amount,0),color:c.color,icon:c.icon})).filter(c=>c.value>0).sort((a,c)=>c.value-a.value);

  const wkD=[]; const sD=new Date(b.startDate);
  for(let i=0;i<Math.min(12,Math.ceil(tD/7));i++){const ws=new Date(sD);ws.setDate(ws.getDate()+i*7);const we=new Date(ws);we.setDate(we.getDate()+6);
    wkD.push({name:`W${i+1}`,expenses:exp.filter(e=>{const dd=new Date(e.date);return dd>=ws&&dd<=we;}).reduce((a,e)=>a+e.amount,0),income:inc.filter(e=>{const dd=new Date(e.date);return dd>=ws&&dd<=we;}).reduce((a,e)=>a+e.amount,0)});}

  return <div style={{padding:"24px",maxWidth:1200,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"24px",flexWrap:"wrap",gap:"10px"}}>
      <div><h1 style={{fontSize:"28px",fontWeight:800,color:T.text,margin:0}}>{s.displayName?`Hey, ${s.displayName}`:"Dashboard"} ✦</h1><p style={{color:T.muted,fontSize:"14px",margin:"4px 0 0"}}>{b.name} · {fmtDF(b.startDate)} — {fmtDF(b.endDate)}</p></div>
      <Btn variant="ghost" onClick={()=>setSEB(true)} style={{fontSize:"12px"}}>✏️ Edit Budget</Btn></div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:"14px",marginBottom:"18px"}}>
      <Card glow><div style={{fontSize:"11px",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"4px"}}>Today's Balance</div><div style={{fontSize:"28px",fontFamily:"'Courier New',monospace",fontWeight:700,color:bal>=0?T.accent:T.danger}}><AnimNum value={Math.abs(bal)} prefix={bal<0?"-$":"$"}/></div><div style={{fontSize:"11px",color:T.muted}}>Budget + Income − Expenses</div></Card>
      <Card><div style={{fontSize:"11px",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"4px"}}>Month-End Projection</div><div style={{fontSize:"28px",fontFamily:"'Courier New',monospace",fontWeight:700,color:mEB>=0?T.accent:T.danger}}><AnimNum value={Math.abs(mEB)} prefix={mEB<0?"-$":"$"}/></div><div style={{fontSize:"11px",color:T.muted}}>By {fmtD(eomS)}</div></Card>
      <Card><div style={{fontSize:"11px",color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"4px"}}>Period-End Projection</div><div style={{fontSize:"28px",fontFamily:"'Courier New',monospace",fontWeight:700,color:pEnd>=0?T.accent:T.danger}}><AnimNum value={Math.abs(pEnd)} prefix={pEnd<0?"-$":"$"}/></div><div style={{fontSize:"11px",color:T.muted}}>{dL} days remaining</div></Card>
    </div>

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"10px",marginBottom:"18px"}}>
      <Card style={{padding:"14px",textAlign:"center"}}><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>Health</div><ArcGauge value={hs} size={72}/></Card>
      <Card style={{padding:"14px"}}><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase",marginBottom:"4px"}}>Income</div><div style={{fontSize:"20px",fontFamily:"'Courier New',monospace",fontWeight:700,color:T.accent}}>+<AnimNum value={totI} prefix="$"/></div></Card>
      <Card style={{padding:"14px"}}><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase",marginBottom:"4px"}}>Expenses</div><div style={{fontSize:"20px",fontFamily:"'Courier New',monospace",fontWeight:700,color:T.danger}}>-<AnimNum value={totE} prefix="$"/></div></Card>
      <Card style={{padding:"14px"}}><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase",marginBottom:"4px"}}>Daily Avg</div><div style={{fontSize:"20px",fontFamily:"'Courier New',monospace",fontWeight:700,color:dA>dT?T.warn:T.text}}><AnimNum value={dA} prefix="$"/></div><div style={{fontSize:"10px",color:T.muted}}>Target: {fmt(dT)}/d</div></Card>
    </div>

    <Card style={{marginBottom:"18px",padding:"14px 20px"}} hover={false}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:"6px"}}><span style={{fontSize:"12px",color:T.muted,textTransform:"uppercase"}}>Budget</span><span style={{fontSize:"12px",fontFamily:"'Courier New',monospace",color:T.text}}>{fmt(totE)} / {fmt(b.totalAmount)}</span></div>
      <div style={{height:8,background:T.bg,borderRadius:4,overflow:"hidden",position:"relative"}}><div style={{height:"100%",width:`${Math.min(100,(totE/b.totalAmount)*100)}%`,background:(totE/b.totalAmount)>0.9?T.danger:(totE/b.totalAmount)>0.7?T.warn:T.accent,borderRadius:4,transition:"width 1s"}}/><div style={{position:"absolute",left:`${(dE/tD*100)}%`,top:-3,width:2,height:14,background:T.text,opacity:0.3}}/></div>
    </Card>

    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px",marginBottom:"18px"}}>
      <Card hover={false}><h3 style={{color:T.text,fontSize:"14px",fontWeight:600,margin:"0 0 10px"}}>Upcoming 7 Days</h3>
        {up7.length===0?<p style={{color:T.muted,fontSize:"12px",textAlign:"center",padding:"20px 0"}}>Nothing upcoming this week</p>:
        <div style={{maxHeight:200,overflow:"auto"}}>{up7.slice(0,8).map((u,i)=>{const c=getCat(b,u.categoryId);return <div key={u.id+"-"+i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"7px 0",borderBottom:`1px solid ${T.border}`}}>
          <div style={{width:30,height:30,borderRadius:"8px",background:c.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px"}}>{c.icon}</div>
          <div style={{flex:1}}><div style={{fontSize:"12px",color:T.text,fontWeight:500}}>{u.title}</div><div style={{fontSize:"10px",color:T.muted}}>{fmtD(u.date)}{u.isSub?" · Sub":""}</div></div>
          <div style={{fontFamily:"'Courier New',monospace",fontSize:"12px",fontWeight:600,color:u.type==="income"?T.accent:T.text}}>{u.type==="income"?"+":"-"}{fmt(u.amount)}</div></div>;})}</div>}</Card>
      <Card hover={false}><h3 style={{color:T.text,fontSize:"14px",fontWeight:600,margin:"0 0 10px"}}>Categories</h3>
        {catData.length>0?<div style={{display:"flex",alignItems:"center",gap:"14px"}}>
          <ResponsiveContainer width="45%" height={150}><PieChart><Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={35} outerRadius={58} paddingAngle={2} strokeWidth={0}>{catData.map((e,i)=><Cell key={i} fill={e.color}/>)}</Pie></PieChart></ResponsiveContainer>
          <div style={{flex:1,fontSize:"11px"}}>{catData.slice(0,6).map(c=><div key={c.name} style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"5px"}}><div style={{width:7,height:7,borderRadius:"50%",background:c.color,flexShrink:0}}/><span style={{color:T.muted,flex:1}}>{c.icon} {c.name}</span><span style={{color:T.text,fontFamily:"'Courier New',monospace"}}>{fmt(c.value)}</span></div>)}</div>
        </div>:<p style={{color:T.muted,fontSize:"12px",textAlign:"center",padding:"30px 0"}}>No expenses yet 👀</p>}</Card>
    </div>

    {wkD.length>0&&<Card hover={false} style={{marginBottom:"18px"}}><h3 style={{color:T.text,fontSize:"14px",fontWeight:600,margin:"0 0 10px"}}>Weekly Income vs Expenses</h3>
      <ResponsiveContainer width="100%" height={170}><BarChart data={wkD} barGap={2}><XAxis dataKey="name" tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false} width={45}/><Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.text}}/><Bar dataKey="income" fill={T.accent} radius={[4,4,0,0]} name="Income"/><Bar dataKey="expenses" fill={T.danger} radius={[4,4,0,0]} name="Expenses"/></BarChart></ResponsiveContainer></Card>}

    <Card hover={false}><h3 style={{color:T.text,fontSize:"14px",fontWeight:600,margin:"0 0 10px"}}>Recent Transactions</h3>
      {tx.length===0?<p style={{color:T.muted,fontSize:"13px",textAlign:"center",padding:"20px 0"}}>No transactions yet. Your wallet is suspiciously quiet 👀</p>:
      [...tx].sort((a,c)=>new Date(c.date)-new Date(a.date)).slice(0,6).map(e=>{const c=getCat(b,e.categoryId);const ii=e.type==="income";return <div key={e.id} style={{display:"flex",alignItems:"center",gap:"12px",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
        <div style={{width:34,height:34,borderRadius:"10px",background:c.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"15px"}}>{c.icon}</div>
        <div style={{flex:1}}><div style={{color:T.text,fontSize:"13px",fontWeight:500}}>{e.title}</div><div style={{color:T.muted,fontSize:"11px"}}>{c.name} · {fmtD(e.date)}</div></div>
        <div style={{fontFamily:"'Courier New',monospace",fontWeight:600,fontSize:"14px",color:ii?T.accent:T.text}}>{ii?"+":"-"}{fmt(e.amount)}</div></div>;})}</Card>
    <EditBudgetModal open={showEB} onClose={()=>setSEB(false)}/></div>;
}

// ── Transactions Page ──
function TxPage(){
  const {state:s,dispatch:d}=useContext(AppCtx); const b=s.budgets.find(x=>x.id===s.activeBudgetId); if(!b)return null;
  const [q,setQ]=useState(""); const [sb,setSb]=useState("date"); const [fc,setFc]=useState("all"); const [ft,setFt]=useState("all");
  let tx=s.transactions.filter(e=>e.budgetId===b.id);
  if(q) tx=tx.filter(e=>e.title.toLowerCase().includes(q.toLowerCase()));
  if(fc!=="all") tx=tx.filter(e=>e.categoryId===fc); if(ft!=="all") tx=tx.filter(e=>e.type===ft);
  tx.sort((a,c)=>sb==="date"?new Date(c.date)-new Date(a.date):sb==="amount"?c.amount-a.amount:a.title.localeCompare(c.title));
  const tE=tx.filter(t=>t.type==="expense").reduce((a,e)=>a+e.amount,0); const tI=tx.filter(t=>t.type==="income").reduce((a,e)=>a+e.amount,0);
  return <div style={{padding:"24px",maxWidth:900,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px",flexWrap:"wrap",gap:"10px"}}>
      <h1 style={{fontSize:"24px",fontWeight:800,color:T.text,margin:0}}>Transactions</h1>
      <div style={{display:"flex",gap:"8px"}}><Btn variant="secondary" onClick={()=>{d({type:"SET",key:"modalType",value:"income"});d({type:"SET",key:"showModal",value:true});}}>+ Income</Btn><Btn onClick={()=>{d({type:"SET",key:"modalType",value:"expense"});d({type:"SET",key:"showModal",value:true});}}>+ Expense</Btn></div></div>
    <div style={{display:"flex",gap:"10px",marginBottom:"18px",flexWrap:"wrap"}}>
      <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search..." style={{flex:1,minWidth:140,padding:"10px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:"8px",color:T.text,fontSize:"13px",outline:"none"}}/>
      <select value={ft} onChange={e=>setFt(e.target.value)} style={{padding:"10px",background:T.card,border:`1px solid ${T.border}`,borderRadius:"8px",color:T.text,fontSize:"13px"}}><option value="all">All Types</option><option value="expense">Expenses</option><option value="income">Income</option></select>
      <select value={fc} onChange={e=>setFc(e.target.value)} style={{padding:"10px",background:T.card,border:`1px solid ${T.border}`,borderRadius:"8px",color:T.text,fontSize:"13px"}}><option value="all">All Cats</option>{allCats(b).map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select>
      <select value={sb} onChange={e=>setSb(e.target.value)} style={{padding:"10px",background:T.card,border:`1px solid ${T.border}`,borderRadius:"8px",color:T.text,fontSize:"13px"}}><option value="date">Date</option><option value="amount">Amount</option><option value="title">Name</option></select></div>
    {tx.length===0?<Card hover={false}><p style={{color:T.muted,textAlign:"center",padding:"40px 0"}}>{q||fc!=="all"||ft!=="all"?"No matching transactions.":"No transactions yet."}</p></Card>:
    <div style={{display:"flex",flexDirection:"column",gap:"6px"}}>{tx.map(e=>{const c=getCat(b,e.categoryId);const ii=e.type==="income";return <Card key={e.id} style={{padding:"12px 16px"}}><div style={{display:"flex",alignItems:"center",gap:"12px"}}>
      <div style={{width:36,height:36,borderRadius:"10px",background:c.color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"16px",flexShrink:0}}>{c.icon}</div>
      <div style={{flex:1,minWidth:0}}><div style={{display:"flex",alignItems:"center",gap:"6px"}}><span style={{color:T.text,fontSize:"14px",fontWeight:500}}>{e.title}</span><span style={{fontSize:"9px",padding:"1px 6px",borderRadius:"4px",background:ii?T.accent+"18":T.danger+"18",color:ii?T.accent:T.danger,fontWeight:600,textTransform:"uppercase"}}>{e.type}</span></div><div style={{color:T.muted,fontSize:"11px"}}>{c.name} · {fmtD(e.date)}{e.note?` · ${e.note}`:""}</div></div>
      <div style={{fontFamily:"'Courier New',monospace",fontWeight:700,fontSize:"15px",color:ii?T.accent:T.text,whiteSpace:"nowrap"}}>{ii?"+":"-"}{fmt(e.amount)}</div>
      <button onClick={()=>d({type:"DEL_TRANS",id:e.id})} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:"13px",padding:"4px",opacity:0.3}} onMouseEnter={ev=>ev.target.style.opacity=1} onMouseLeave={ev=>ev.target.style.opacity=0.3}>✕</button></div></Card>;})}</div>}
    <div style={{textAlign:"center",padding:"16px 0",color:T.muted,fontSize:"12px"}}>{tx.length} txns · In: {fmt(tI)} · Out: {fmt(tE)} · Net: {fmt(tI-tE)}</div></div>;
}

// ── Subscriptions ──
function SubsPage(){
  const {state:s,dispatch:d}=useContext(AppCtx); const b=s.budgets.find(x=>x.id===s.activeBudgetId);
  const [sm,setSm]=useState(false); const [ed,setEd]=useState(null);
  const subs=s.subscriptions; const act=subs.filter(x=>x.status==="active");
  const mEq=x=>({weekly:x.amount*4.33,biweekly:x.amount*2.17,monthly:x.amount,quarterly:x.amount/3,annually:x.amount/12}[x.billingCycle]||x.amount);
  const tM=act.reduce((a,x)=>a+mEq(x),0);
  return <div style={{padding:"24px",maxWidth:900,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}><h1 style={{fontSize:"24px",fontWeight:800,color:T.text,margin:0}}>Subscriptions</h1><Btn onClick={()=>{setEd(null);setSm(true);}}>+ Add</Btn></div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:"12px",marginBottom:"20px"}}>
      <Card glow style={{padding:"14px"}}><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>Monthly</div><div style={{fontSize:"24px",fontFamily:"'Courier New',monospace",fontWeight:700,color:T.accent,marginTop:"4px"}}><AnimNum value={tM} prefix="$"/><span style={{fontSize:"12px",color:T.muted}}>/mo</span></div></Card>
      <Card style={{padding:"14px"}}><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>Annual</div><div style={{fontSize:"24px",fontFamily:"'Courier New',monospace",fontWeight:700,color:T.text,marginTop:"4px"}}><AnimNum value={tM*12} prefix="$"/><span style={{fontSize:"12px",color:T.muted}}>/yr</span></div></Card>
      <Card style={{padding:"14px"}}><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>Active</div><div style={{fontSize:"24px",fontFamily:"'Courier New',monospace",fontWeight:700,color:T.text,marginTop:"4px"}}>{act.length}</div></Card></div>
    {subs.length===0?<Card hover={false}><p style={{color:T.muted,textAlign:"center",padding:"40px 0"}}>No subscriptions yet.</p></Card>:
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:"12px"}}>{subs.map(x=>{const c=getCat(b,x.categoryId);const m=mEq(x);const sc=x.status==="active"?T.accent:x.status==="paused"?T.warn:T.muted;
      return <Card key={x.id} style={{padding:"16px"}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><div><div style={{fontSize:"15px",fontWeight:600,color:T.text}}>{x.name}</div><div style={{fontSize:"11px",color:T.muted}}>{c.icon} {c.name}</div></div><span style={{fontSize:"10px",fontWeight:600,padding:"2px 8px",borderRadius:"6px",background:sc+"15",color:sc,textTransform:"uppercase",height:"fit-content"}}>{x.status}</span></div>
      <div style={{fontFamily:"'Courier New',monospace",fontSize:"20px",fontWeight:700,color:T.text}}>{fmt(x.amount)}<span style={{fontSize:"11px",color:T.muted,fontWeight:400}}>/{x.billingCycle}</span></div>
      <div style={{fontSize:"11px",color:T.muted,marginTop:"4px"}}>≈ {fmt(m)}/mo · Next: {fmtD(x.nextBillingDate)}</div>
      <div style={{display:"flex",gap:"6px",marginTop:"10px"}}><Btn variant="ghost" onClick={()=>{setEd(x);setSm(true);}} style={{flex:1,fontSize:"11px",padding:"6px"}}>Edit</Btn><Btn variant="danger" onClick={()=>d({type:"DEL_SUB",id:x.id})} style={{fontSize:"11px",padding:"6px 12px"}}>✕</Btn></div></Card>;})}</div>}
    <SubModal open={sm} onClose={()=>{setSm(false);setEd(null);}} edit={ed}/></div>;
}

// ── Insights ──
function InsightsPage(){
  const {state:s}=useContext(AppCtx); const b=s.budgets.find(x=>x.id===s.activeBudgetId); if(!b)return null;
  const tx=s.transactions.filter(e=>e.budgetId===b.id); const exp=tx.filter(t=>t.type==="expense"); const inc=tx.filter(t=>t.type==="income");
  const tE=exp.reduce((a,e)=>a+e.amount,0); const tI=inc.reduce((a,e)=>a+e.amount,0);
  const tD=dBetween(b.startDate,b.endDate); const dE=Math.max(1,dBetween(b.startDate,tdy())); const dL=Math.max(0,tD-dE);
  const dT=b.totalAmount/tD; const dA=tE/dE; const vel=dT>0?dA/dT:0; const sRate=tI>0?((tI-tE)/tI*100):0;
  const aSubs=s.subscriptions.filter(x=>x.status==="active");
  const mSub=aSubs.reduce((a,x)=>a+({weekly:x.amount*4.33,biweekly:x.amount*2.17,monthly:x.amount,quarterly:x.amount/3,annually:x.amount/12}[x.billingCycle]||x.amount),0);
  const subPct=tE>0?(mSub/(tE/dE*30))*100:0;

  const cSpend={}; exp.forEach(e=>{cSpend[e.categoryId]=(cSpend[e.categoryId]||0)+e.amount;});
  const cList=Object.entries(cSpend).map(([id,a])=>({cat:getCat(b,id),amount:a})).sort((a,c)=>c.amount-a.amount);
  const topC=cList[0]; const topPct=tE>0&&topC?(topC.amount/tE*100):0;

  const dSpend=[0,0,0,0,0,0,0],dCnt=[0,0,0,0,0,0,0]; exp.forEach(e=>{const dd=new Date(e.date).getDay();dSpend[dd]+=e.amount;dCnt[dd]++;});
  const dAvg=dSpend.map((v,i)=>dCnt[i]>0?v/dCnt[i]:0); const weAvg=((dAvg[0]||0)+(dAvg[6]||0))/2; const wdAvg=dAvg.slice(1,6).reduce((a,v)=>a+v,0)/5;
  const weR=wdAvg>0?weAvg/wdAvg:0; const dn=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"]; const topD=dAvg.indexOf(Math.max(...dAvg)); const loD=dAvg.indexOf(Math.min(...dAvg.filter(v=>v>0)));

  const wTots=[]; const sD2=new Date(b.startDate);
  for(let i=0;i<Math.ceil(tD/7);i++){const ws=new Date(sD2);ws.setDate(ws.getDate()+i*7);const we=new Date(ws);we.setDate(we.getDate()+6);wTots.push(exp.filter(e=>{const dd=new Date(e.date);return dd>=ws&&dd<=we;}).reduce((a,e)=>a+e.amount,0));}
  const fW=wTots.filter(w=>w>0); const decW=fW.length>=3&&fW.slice(-3).every((v,i,a)=>i===0||v<=a[i-1]); const incW=fW.length>=3&&fW.slice(-3).every((v,i,a)=>i===0||v>=a[i-1]);

  const dtSp={}; exp.forEach(e=>{dtSp[e.date]=(dtSp[e.date]||0)+e.amount;}); const dtP=Object.entries(dtSp); const avgDS=dtP.length>0?dtP.reduce((a,[,v])=>a+v,0)/dtP.length:0; const spike=dtP.find(([,v])=>v>avgDS*2.5);
  const iER=tE>0?tI/tE:0; const lgE=exp.length>0?exp.reduce((m,e)=>e.amount>m.amount?e:m,exp[0]):null; const avgE=exp.length>0?tE/exp.length:0;
  let mxNS=0,cNS=0; for(let i=0;i<tD&&i<dE;i++){const dd=new Date(b.startDate);dd.setDate(dd.getDate()+i);const ds=dd.toISOString().split("T")[0];if(!dtSp[ds]){cNS++;mxNS=Math.max(mxNS,cNS);}else cNS=0;}

  const ins=[];
  if(vel>1.3) ins.push({i:"📈",t:"Spending Too Fast",s:"critical",d:`Burning at ${vel.toFixed(1)}x target. Budget may end ${Math.max(0,Math.round(dL-(b.totalAmount-tE)/dA))} days early.`});
  else if(vel>1.05) ins.push({i:"📈",t:"Slightly Over Pace",s:"warning",d:`${((vel-1)*100).toFixed(0)}% faster than planned. Cut ${fmt(dA-dT)}/day to recover.`});
  else if(vel>0&&vel<=1) ins.push({i:"🎯",t:"On Target",s:"info",d:`Within daily target of ${fmt(dT)}. Projected surplus: ${fmt(b.totalAmount-dA*tD)}.`});
  if(tI>0){if(sRate>30)ins.push({i:"🏆",t:"Great Savings Rate",s:"info",d:`Saving ${sRate.toFixed(0)}% of income — above the recommended 20%.`});else if(sRate>=0&&sRate<=15)ins.push({i:"⚠️",t:"Low Savings",s:"warning",d:`Only ${sRate.toFixed(0)}% saved. Aim for 20%+.`});else if(sRate<0)ins.push({i:"🚨",t:"Overspending Income",s:"critical",d:`Spent ${fmt(tE-tI)} more than earned.`});}
  if(tI>0&&iER>2) ins.push({i:"💰",t:"Income Surplus",s:"info",d:`Earning ${iER.toFixed(1)}x expenses. Consider saving more.`});
  if(weR>2) ins.push({i:"🗓️",t:"Weekend Splurge",s:"warning",d:`${weR.toFixed(1)}x more on weekends. ${dn[topD]} is highest at ${fmt(dAvg[topD])} avg.`});
  if(loD>=0&&dAvg[loD]>0) ins.push({i:"✨",t:"Best Day",s:"info",d:`${dn[loD]}s are cheapest at ${fmt(dAvg[loD])} avg.`});
  if(topC&&topPct>40) ins.push({i:"🔥",t:`${topC.cat.icon} ${topC.cat.name} Heavy`,s:"warning",d:`${topPct.toFixed(0)}% of spending (${fmt(topC.amount)}).`});
  if(mSub>0&&subPct>25) ins.push({i:"💡",t:"High Sub Load",s:"warning",d:`~${fmt(mSub)}/mo (~${subPct.toFixed(0)}% of pace). Audit unused services.`});
  else if(mSub>0) ins.push({i:"🔁",t:"Subscriptions",s:"info",d:`${aSubs.length} active totaling ${fmt(mSub)}/mo (${fmt(mSub*12)}/yr).`});
  if(decW) ins.push({i:"📉",t:"Improving!",s:"info",d:"Weekly spend decreased 3 weeks running. Great momentum!"});
  if(incW) ins.push({i:"📈",t:"Spend Rising",s:"warning",d:"3-week increase streak. Time to course-correct."});
  if(spike) ins.push({i:"⚡",t:"Spike",s:"warning",d:`${fmtD(spike[0])}: ${fmt(spike[1])} — ${(spike[1]/avgDS).toFixed(1)}x daily avg.`});
  if(lgE&&lgE.amount>avgE*3) ins.push({i:"🏷️",t:"Biggest Expense",s:"info",d:`"${lgE.title}" ${fmt(lgE.amount)} — ${(lgE.amount/avgE).toFixed(1)}x avg.`});
  if(exp.length>=5) ins.push({i:"📐",t:"Avg Transaction",s:"info",d:`${fmt(avgE)} across ${exp.length} expenses.`});
  if(mxNS>=2) ins.push({i:"🧘",t:"No-Spend Streak",s:"info",d:`Best: ${mxNS} consecutive no-spend days.`});
  if(fW.length>=2) ins.push({i:"🏅",t:"Week Range",s:"info",d:`Best week: ${fmt(Math.min(...fW))} · Worst: ${fmt(Math.max(...fW))}.`});
  if(exp.length===0&&inc.length===0) ins.push({i:"👋",t:"Get Started",s:"info",d:"Add transactions to unlock insights."});
  const sc={info:T.accent,warning:T.warn,critical:T.danger};
  const dowD=dn.map((n,i)=>({name:n,avg:Math.round(dAvg[i])})); const cCD=cList.slice(0,8).map(c=>({name:c.cat.name,value:c.amount,color:c.cat.color}));

  return <div style={{padding:"24px",maxWidth:1000,margin:"0 auto"}}>
    <h1 style={{fontSize:"24px",fontWeight:800,color:T.text,margin:"0 0 6px"}}>Insights</h1><p style={{color:T.muted,fontSize:"13px",marginBottom:"20px"}}>{ins.length} insights from your data</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:"10px",marginBottom:"20px"}}>
      {[{l:"Txns",v:tx.length,c:T.text},{l:"Avg Exp",v:fmt(avgE),c:T.text},{l:"Savings",v:tI>0?`${sRate.toFixed(0)}%`:"N/A",c:sRate>20?T.accent:T.warn},{l:"Velocity",v:`${vel.toFixed(2)}x`,c:vel>1?T.danger:T.accent}].map(x=>
      <Card key={x.l} style={{padding:"10px",textAlign:"center"}}><div style={{fontSize:"10px",color:T.muted,textTransform:"uppercase"}}>{x.l}</div><div style={{fontSize:"18px",fontFamily:"'Courier New',monospace",fontWeight:700,color:x.c,marginTop:"2px"}}>{x.v}</div></Card>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:"10px",marginBottom:"24px"}}>
      {ins.map((x,i)=><Card key={i} glow={x.s==="info"} style={{borderLeft:`3px solid ${sc[x.s]}`,padding:"14px"}}><div style={{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}}><span style={{fontSize:"18px"}}>{x.i}</span><span style={{fontSize:"13px",fontWeight:600,color:T.text,flex:1}}>{x.t}</span><span style={{fontSize:"9px",fontWeight:700,padding:"2px 6px",borderRadius:"4px",background:sc[x.s]+"20",color:sc[x.s],textTransform:"uppercase"}}>{x.s}</span></div><p style={{color:T.muted,fontSize:"12px",lineHeight:1.5,margin:0}}>{x.d}</p></Card>)}</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"14px"}}>
      <Card hover={false}><h3 style={{color:T.text,fontSize:"14px",fontWeight:600,margin:"0 0 10px"}}>By Day of Week</h3>{exp.length>0?<ResponsiveContainer width="100%" height={140}><BarChart data={dowD}><XAxis dataKey="name" tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false}/><YAxis tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false} width={40}/><Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.text}}/><Bar dataKey="avg" radius={[4,4,0,0]}>{dowD.map((_,i)=><Cell key={i} fill={i===0||i===6?T.warn:T.accent}/>)}</Bar></BarChart></ResponsiveContainer>:<p style={{color:T.muted,fontSize:"12px",textAlign:"center",padding:"20px 0"}}>No data</p>}</Card>
      <Card hover={false}><h3 style={{color:T.text,fontSize:"14px",fontWeight:600,margin:"0 0 10px"}}>Top Categories</h3>{cCD.length>0?<ResponsiveContainer width="100%" height={140}><BarChart data={cCD} layout="vertical"><XAxis type="number" tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false}/><YAxis dataKey="name" type="category" tick={{fill:T.muted,fontSize:10}} axisLine={false} tickLine={false} width={80}/><Tooltip contentStyle={{background:T.card,border:`1px solid ${T.border}`,borderRadius:8,fontSize:12,color:T.text}}/><Bar dataKey="value" radius={[0,4,4,0]}>{cCD.map((c,i)=><Cell key={i} fill={c.color}/>)}</Bar></BarChart></ResponsiveContainer>:<p style={{color:T.muted,fontSize:"12px",textAlign:"center",padding:"20px 0"}}>No data</p>}</Card></div></div>;
}

// ── Goals ──
function GoalsPage(){
  const {state:s,dispatch:d}=useContext(AppCtx); const [sm,setSm]=useState(false); const [eg,setEg]=useState(null);
  return <div style={{padding:"24px",maxWidth:800,margin:"0 auto"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"24px"}}><h1 style={{fontSize:"24px",fontWeight:800,color:T.text,margin:0}}>Goals</h1><Btn onClick={()=>{setEg(null);setSm(true);}}>+ New Goal</Btn></div>
    {s.goals.length===0?<Card hover={false}><div style={{textAlign:"center",padding:"48px"}}><div style={{fontSize:"48px",marginBottom:"12px"}}>🎯</div><p style={{color:T.muted}}>Set a savings target!</p><Btn onClick={()=>setSm(true)} style={{marginTop:"12px"}}>Create Goal</Btn></div></Card>:
    <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>{s.goals.map(g=>{const pct=Math.min(100,(g.currentAmount/g.targetAmount)*100);const dl=dBetween(tdy(),g.targetDate);const rm=g.targetAmount-g.currentAmount;const dn2=dl>0?rm/dl:rm;
      return <Card key={g.id}><div style={{display:"flex",justifyContent:"space-between",marginBottom:"10px"}}><div><div style={{fontSize:"16px",fontWeight:600,color:T.text}}>{g.name}</div><div style={{fontSize:"11px",color:T.muted}}>{fmtDF(g.targetDate)} · {dl>0?`${dl}d left`:"Past due"}</div></div><div style={{display:"flex",gap:"6px"}}><button onClick={()=>{setEg(g);setSm(true);}} style={{background:"none",border:"none",color:T.muted,cursor:"pointer"}}>✏️</button><button onClick={()=>d({type:"DEL_GOAL",id:g.id})} style={{background:"none",border:"none",color:T.muted,cursor:"pointer"}}>✕</button></div></div>
        <div style={{display:"flex",alignItems:"baseline",gap:"8px",marginBottom:"8px"}}><span style={{fontFamily:"'Courier New',monospace",fontSize:"24px",fontWeight:700,color:g.color}}>{fmt(g.currentAmount)}</span><span style={{color:T.muted,fontSize:"13px"}}>of {fmt(g.targetAmount)}</span><span style={{marginLeft:"auto",fontFamily:"'Courier New',monospace",fontSize:"14px",color:pct>=100?T.accent:T.muted}}>{pct.toFixed(0)}%</span></div>
        <div style={{height:6,background:T.bg,borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct}%`,background:g.color,borderRadius:3,transition:"width 0.8s"}}/></div>
        {pct<100&&dl>0&&<div style={{fontSize:"11px",color:T.muted,marginTop:"6px"}}>Need {fmt(dn2)}/day</div>}{pct>=100&&<div style={{fontSize:"12px",color:T.accent,marginTop:"6px",fontWeight:600}}>🎉 Achieved!</div>}</Card>;})}</div>}
    <GoalModal open={sm} onClose={()=>{setSm(false);setEg(null);}} edit={eg}/></div>;
}

// ── Settings ──
function SettingsPage(){
  const {state:s,dispatch:d}=useContext(AppCtx); const [cm,setCm]=useState(false);
  const expJ=()=>{const bl=new Blob([JSON.stringify({budgets:s.budgets,transactions:s.transactions,subscriptions:s.subscriptions,goals:s.goals,displayName:s.displayName,currency:s.currency,theme:s.theme},null,2)],{type:"application/json"});const a=document.createElement("a");a.href=URL.createObjectURL(bl);a.download=`finflow-${tdy()}.json`;a.click();};
  const expC=()=>{const b=s.budgets.find(x=>x.id===s.activeBudgetId);const h=["Date","Title","Amount","Type","Category","Note"];const r=s.transactions.filter(e=>e.budgetId===s.activeBudgetId).map(e=>[e.date,e.title,e.amount,e.type,getCat(b,e.categoryId).name,e.note]);const csv=[h,...r].map(r2=>r2.map(v=>`"${v}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"}));a.download=`finflow-${tdy()}.csv`;a.click();};
  const impJ=()=>{const i=document.createElement("input");i.type="file";i.accept=".json";i.onchange=async e=>{try{const dt=JSON.parse(await e.target.files[0].text());d({type:"IMPORT",payload:{budgets:dt.budgets||[],transactions:dt.transactions||[],subscriptions:dt.subscriptions||[],goals:dt.goals||[],displayName:dt.displayName||"",currency:dt.currency||"USD",theme:dt.theme||"emerald",activeBudgetId:dt.budgets?.[0]?.id||null,onboarded:true}});}catch{alert("Invalid file");}};i.click();};
  return <div style={{padding:"24px",maxWidth:600,margin:"0 auto"}}>
    <h1 style={{fontSize:"24px",fontWeight:800,color:T.text,margin:"0 0 24px"}}>Settings</h1>
    <Card hover={false} style={{marginBottom:"16px"}}><h3 style={{color:T.text,fontSize:"14px",fontWeight:600,margin:"0 0 16px"}}>Profile</h3><Inp label="Name" value={s.displayName} onChange={e=>d({type:"SET",key:"displayName",value:e.target.value})}/><Sel label="Currency" options={CURRENCIES} value={s.currency} onChange={e=>d({type:"SET",key:"currency",value:e.target.value})}/></Card>
    <Card hover={false} style={{marginBottom:"16px"}}><h3 style={{color:T.text,fontSize:"14px",fontWeight:600,margin:"0 0 16px"}}>Theme</h3>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px"}}>{Object.entries(THEMES).map(([k,t])=><button key={k} onClick={()=>d({type:"SET",key:"theme",value:k})} style={{padding:"10px 6px",borderRadius:"8px",border:`2px solid ${s.theme===k?t.accent:t.border}`,background:t.bg2,cursor:"pointer",textAlign:"center",transition:"all 0.2s"}}><div style={{width:20,height:20,borderRadius:"50%",background:t.accent,margin:"0 auto 4px"}}/><div style={{fontSize:"10px",color:t.text}}>{t.name}</div></button>)}</div></Card>
    <Card hover={false} style={{marginBottom:"16px"}}><h3 style={{color:T.text,fontSize:"14px",fontWeight:600,margin:"0 0 12px"}}>Categories</h3><Btn variant="secondary" onClick={()=>setCm(true)}>Manage Categories</Btn></Card>
    <Card hover={false} style={{marginBottom:"16px"}}><h3 style={{color:T.text,fontSize:"14px",fontWeight:600,margin:"0 0 12px"}}>Export</h3><div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}><Btn variant="secondary" onClick={expJ}>JSON</Btn><Btn variant="secondary" onClick={expC}>CSV</Btn><Btn variant="ghost" onClick={impJ}>Import</Btn></div></Card>
    <Card hover={false}><h3 style={{color:T.danger,fontSize:"14px",fontWeight:600,margin:"0 0 12px"}}>Danger</h3><Btn variant="danger" onClick={()=>{if(confirm("Delete all data?")){localStorage.removeItem(SKEY);window.location.reload();}}}>Reset All</Btn></Card>
    <CatManager open={cm} onClose={()=>setCm(false)}/></div>;
}

// ── CmdPalette ──
function CmdP(){
  const {state:s,dispatch:d}=useContext(AppCtx); const [q,setQ]=useState(""); const r=useRef();
  useEffect(()=>{if(s.showCmd){setQ("");setTimeout(()=>r.current?.focus(),50);}},[s.showCmd]);
  const acts=[{l:"Add Expense",a:()=>{d({type:"SET",key:"showCmd",value:false});d({type:"SET",key:"modalType",value:"expense"});d({type:"SET",key:"showModal",value:true});}},{l:"Add Income",a:()=>{d({type:"SET",key:"showCmd",value:false});d({type:"SET",key:"modalType",value:"income"});d({type:"SET",key:"showModal",value:true});}},{l:"Dashboard",a:()=>{d({type:"SET",key:"showCmd",value:false});d({type:"SET",key:"page",value:"dashboard"});}},{l:"Transactions",a:()=>{d({type:"SET",key:"showCmd",value:false});d({type:"SET",key:"page",value:"transactions"});}},{l:"Subscriptions",a:()=>{d({type:"SET",key:"showCmd",value:false});d({type:"SET",key:"page",value:"subscriptions"});}},{l:"Insights",a:()=>{d({type:"SET",key:"showCmd",value:false});d({type:"SET",key:"page",value:"insights"});}},{l:"Goals",a:()=>{d({type:"SET",key:"showCmd",value:false});d({type:"SET",key:"page",value:"goals"});}},{l:"Settings",a:()=>{d({type:"SET",key:"showCmd",value:false});d({type:"SET",key:"page",value:"settings"});}}];
  const f=q?acts.filter(a=>a.l.toLowerCase().includes(q.toLowerCase())):acts;
  if(!s.showCmd) return null;
  return <div onClick={()=>d({type:"SET",key:"showCmd",value:false})} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)",zIndex:2000,display:"flex",alignItems:"flex-start",justifyContent:"center",paddingTop:"20vh"}}>
    <div onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:480,background:T.bg2,border:`1px solid ${T.border}`,borderRadius:"12px",overflow:"hidden"}}>
      <input ref={r} value={q} onChange={e=>setQ(e.target.value)} placeholder="Type a command..." onKeyDown={e=>{if(e.key==="Escape")d({type:"SET",key:"showCmd",value:false});if(e.key==="Enter"&&f[0])f[0].a();}} style={{width:"100%",padding:"16px 20px",background:"transparent",border:"none",borderBottom:`1px solid ${T.border}`,color:T.text,fontSize:"15px",outline:"none",boxSizing:"border-box"}}/>
      <div style={{maxHeight:300,overflow:"auto"}}>{f.map(a=><button key={a.l} onClick={a.a} style={{display:"flex",alignItems:"center",width:"100%",padding:"12px 20px",background:"transparent",border:"none",color:T.text,fontSize:"13px",cursor:"pointer",textAlign:"left"}} onMouseEnter={e=>e.target.style.background=T.accent+"08"} onMouseLeave={e=>e.target.style.background="transparent"}>{a.l}</button>)}</div></div></div>;
}

// ── Sidebar ──
function Sidebar(){
  const {state:s,dispatch:d}=useContext(AppCtx); const b=s.budgets.find(x=>x.id===s.activeBudgetId);
  const tE=b?s.transactions.filter(e=>e.budgetId===b.id&&e.type==="expense").reduce((a,e)=>a+e.amount,0):0;
  const pct=b?clamp(100-(tE/b.totalAmount)*100,0,100):0;
  const nav=[{id:"dashboard",ic:"◈",l:"Dashboard"},{id:"transactions",ic:"◇",l:"Transactions"},{id:"subscriptions",ic:"↻",l:"Subscriptions"},{id:"insights",ic:"◆",l:"Insights"},{id:"goals",ic:"◎",l:"Goals"},{id:"settings",ic:"⚙",l:"Settings"}];
  return <div style={{width:220,height:"100vh",background:T.bg2,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0}}>
    <div style={{padding:"20px 16px 12px"}}><div style={{fontSize:"22px",fontWeight:800,color:T.text}}><span style={{color:T.accent}}>Fin</span>Flow</div>{b&&<div style={{fontSize:"11px",color:T.muted,marginTop:"4px"}}>{b.name}</div>}</div>
    <div style={{flex:1,padding:"8px"}}>{nav.map(n=><IconBtn key={n.id} active={s.page===n.id} onClick={()=>d({type:"SET",key:"page",value:n.id})}><span style={{fontSize:"14px",width:"24px",textAlign:"center"}}>{n.ic}</span><span style={{fontSize:"13px",fontWeight:s.page===n.id?600:400}}>{n.l}</span></IconBtn>)}</div>
    {b&&<div style={{padding:"16px",borderTop:`1px solid ${T.border}`}}><ArcGauge value={pct} size={80} label="Remaining"/></div>}</div>;
}

// ── App ──
export default function FinFlow(){
  const [state,dispatch]=useReducer(reducer,init);
  T=getTheme(state.theme);
  useEffect(()=>{const s=load();if(s)dispatch({type:"LOAD",payload:s});},[]);
  useEffect(()=>{const {page,showModal,showCmd,modalType,...p}=state;save(p);},[state]);
  useEffect(()=>{const h=e=>{if(e.target.tagName==="INPUT"||e.target.tagName==="TEXTAREA"||e.target.tagName==="SELECT")return;if((e.metaKey||e.ctrlKey)&&e.key==="k"){e.preventDefault();dispatch({type:"SET",key:"showCmd",value:true});return;}if(e.key==="n"){e.preventDefault();dispatch({type:"SET",key:"modalType",value:"expense"});dispatch({type:"SET",key:"showModal",value:true});}if(e.key==="i"&&!e.ctrlKey&&!e.metaKey){e.preventDefault();dispatch({type:"SET",key:"modalType",value:"income"});dispatch({type:"SET",key:"showModal",value:true});}if(e.key==="b")dispatch({type:"SET",key:"page",value:"dashboard"});if(e.key==="Escape"){dispatch({type:"SET",key:"showModal",value:false});dispatch({type:"SET",key:"showCmd",value:false});}};window.addEventListener("keydown",h);return()=>window.removeEventListener("keydown",h);},[]);
  const ctx=useMemo(()=>({state,dispatch}),[state]);
  if(!state.onboarded) return <AppCtx.Provider value={ctx}><Onboarding/></AppCtx.Provider>;
  const pages={dashboard:Dashboard,transactions:TxPage,subscriptions:SubsPage,insights:InsightsPage,goals:GoalsPage,settings:SettingsPage};
  const P=pages[state.page]||Dashboard;
  return <AppCtx.Provider value={ctx}>
    <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;margin:0;padding:0}body{background:${T.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}::selection{background:${T.accent}33}input[type="date"]::-webkit-calendar-picker-indicator{filter:invert(0.7)}select{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7080' d='M6 8L1 3h10z'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;padding-right:32px!important}`}</style>
    <div style={{display:"flex",minHeight:"100vh",background:T.bg}}><Sidebar/><div style={{flex:1,minWidth:0,overflow:"auto"}}><P/></div></div>
    <div style={{position:"fixed",bottom:24,right:24,display:"flex",flexDirection:"column",gap:"8px",alignItems:"flex-end",zIndex:100}}>
      <button onClick={()=>{dispatch({type:"SET",key:"modalType",value:"income"});dispatch({type:"SET",key:"showModal",value:true});}} style={{width:42,height:42,borderRadius:"50%",background:T.accent+"20",border:`1px solid ${T.accent}40`,color:T.accent,fontSize:"16px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}} title="Income">↑</button>
      <button onClick={()=>{dispatch({type:"SET",key:"modalType",value:"expense"});dispatch({type:"SET",key:"showModal",value:true});}} style={{width:56,height:56,borderRadius:"50%",background:T.accent,border:"none",color:T.bg,fontSize:"28px",fontWeight:300,cursor:"pointer",boxShadow:`0 4px 20px ${T.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",transition:"transform 0.2s"}} onMouseEnter={e=>e.target.style.transform="scale(1.1)"} onMouseLeave={e=>e.target.style.transform=""} title="Expense">+</button></div>
    <div style={{position:"fixed",bottom:24,left:"50%",transform:"translateX(-50%)",background:T.card,border:`1px solid ${T.border}`,borderRadius:"8px",padding:"6px 12px",fontSize:"11px",color:T.muted,zIndex:50,opacity:0.5}}><kbd style={{fontFamily:"'Courier New',monospace"}}>⌘K</kbd> commands</div>
    <TransModal/><CmdP/></AppCtx.Provider>;
}
