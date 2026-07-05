/* features/auth/AuthSection/AuthSection.jsx */
import { useState } from "react";
import { useApp } from "../../../core/AppContext/AppContext";

export function AuthSection() {
  const { login, register, toast } = useApp();
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ username: "", email: "", pass: "", ref: "" });
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    try {
      if (mode === "login") { login(f.email, f.pass); toast("success", "Welcome back! ⛏️"); }
      else { register(f.username, f.email, f.pass, f.ref || undefined); toast("success", "Account created 🎉"); }
    } catch (err) { toast("error", err.message); }
  };

  const demo = (email, pass) => { setMode("login"); setF((s) => ({ ...s, email, pass })); };

  return (
    <section className="center-screen">
      <div className="logo-box">⛏️</div>
      <h1 className="logo-text">Lit<span className="grad">Miner</span></h1>
      <p className="muted">Mine Litecoin · Invite friends · Earn daily</p>

      <div className="auth-tabs">
        <button className={`auth-tab ${mode === "login" ? "active" : ""}`} onClick={() => setMode("login")}>Sign In</button>
        <button className={`auth-tab ${mode === "register" ? "active" : ""}`} onClick={() => setMode("register")}>Sign Up</button>
      </div>

      <form className="auth-form" onSubmit={submit}>
        {mode === "register" && <input className="input" placeholder="Username (min 3)" value={f.username} onChange={set("username")} required />}
        <input className="input" type="email" placeholder="Email" value={f.email} onChange={set("email")} required />
        <input className="input" type="password" placeholder="Password (min 6)" value={f.pass} onChange={set("pass")} required />
        {mode === "register" && <input className="input" placeholder="Referral code (optional)" value={f.ref} onChange={set("ref")} />}
        <button className="btn btn-primary btn-block" type="submit">{mode === "login" ? "Sign In" : "Create Account"}</button>
      </form>

      <div className="demo-box">
        <p><b>🧪 Demo accounts (click to fill):</b></p>
        <button className="demo-cred" onClick={() => demo("demo@litminer.app", "demo123")}>👤 demo@litminer.app / demo123</button>
        <button className="demo-cred" onClick={() => demo("admin@litminer.app", "admin123")}>🛡️ admin@litminer.app / admin123</button>
      </div>
    </section>
  );
}
