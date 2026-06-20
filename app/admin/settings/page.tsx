'use client';

import React, { useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { isAdmin, getSurveyConfig, saveSurveyConfig, SurveyConfig, DEFAULT_CONFIG } from '@/lib/config';
import { AdminStyles, AdminChrome } from '@/lib/admin-ui';

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SurveySettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [cfg, setCfg] = useState<SurveyConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ok = await isAdmin(u.uid);
        setAllowed(ok);
        if (ok) setCfg(await getSurveyConfig());
      } else {
        setAllowed(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const flash = (kind: 'ok' | 'err', msg: string) => {
    setBanner({ kind, msg });
    setTimeout(() => setBanner(null), 3500);
  };

  // ---- Time slot editing ----
  const setTime = (i: number, val: string) =>
    setCfg(c => ({ ...c, times: c.times.map((t, idx) => idx === i ? val : t) }));
  const addTime = () => setCfg(c => ({ ...c, times: [...c.times, ''] }));
  const removeTime = (i: number) =>
    setCfg(c => ({ ...c, times: c.times.filter((_, idx) => idx !== i) }));
  const moveTime = (i: number, dir: -1 | 1) => setCfg(c => {
    const t = [...c.times];
    const j = i + dir;
    if (j < 0 || j >= t.length) return c;
    [t[i], t[j]] = [t[j], t[i]];
    return { ...c, times: t };
  });

  const toggleDay = (day: string) => setCfg(c => {
    const has = c.days.includes(day);
    // Preserve canonical weekday order when re-adding.
    const next = has ? c.days.filter(d => d !== day)
                     : ALL_DAYS.filter(d => c.days.includes(d) || d === day);
    return { ...c, days: next };
  });

  const save = async () => {
    const cleanTimes = cfg.times.map(t => t.trim()).filter(Boolean);
    if (cleanTimes.length === 0) return flash('err', 'Add at least one time slot before saving.');
    if (cfg.days.length === 0) return flash('err', 'Select at least one day before saving.');
    if (!cfg.title.trim()) return flash('err', 'The survey needs a title.');
    setSaving(true);
    try {
      const toSave = { ...cfg, times: cleanTimes };
      await saveSurveyConfig(toSave);
      setCfg(toSave);
      flash('ok', 'Saved. The survey updates immediately for everyone.');
    } catch {
      flash('err', 'Could not save. Check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Shell><p style={{ padding: 40, textAlign: 'center', color: '#5d6b7a' }}>Loading…</p></Shell>;
  if (!user || !allowed) return <Denied signedIn={!!user} />;

  return (
    <Shell>
      <AdminChrome email={user.email || ''} active="settings" onSignOut={() => signOut(auth)} />

      {banner && <div className={`banner ${banner.kind}`}>{banner.msg}</div>}

      <div className="card">
        <p className="eyebrow">Status</p>
        <h2>Survey availability</h2>
        <p className="sub">Close the survey when you&apos;ve collected enough responses. Closed surveys show a friendly notice instead of the form.</p>
        <div className="toggle-wrap">
          <button className={`toggle ${cfg.open ? 'on' : ''}`} onClick={() => setCfg(c => ({ ...c, open: !c.open }))} aria-label="Toggle survey open">
            <span />
          </button>
          <div>
            <div style={{ fontWeight: 650, fontSize: 14.5 }}>{cfg.open ? 'Accepting responses' : 'Closed to new responses'}</div>
            <div style={{ fontSize: 13, color: '#5d6b7a' }}>{cfg.open ? 'Anyone with the link can submit.' : 'The form is hidden until you reopen it.'}</div>
          </div>
        </div>
      </div>

      <div className="card">
        <p className="eyebrow">Wording</p>
        <h2>Header &amp; instructions</h2>
        <p className="sub">What players see at the top of the survey.</p>
        <div className="field">
          <label>Title</label>
          <input value={cfg.title} onChange={e => setCfg(c => ({ ...c, title: e.target.value }))} placeholder="Practice Schedule Survey" />
        </div>
        <div className="field">
          <label>Subtitle</label>
          <input value={cfg.subtitle} onChange={e => setCfg(c => ({ ...c, subtitle: e.target.value }))} placeholder="Help us find the best practice times" />
        </div>
        <div className="field">
          <label>Welcome heading</label>
          <input value={cfg.welcomeTitle} onChange={e => setCfg(c => ({ ...c, welcomeTitle: e.target.value }))} placeholder="Welcome" />
        </div>
        <div className="field" style={{ marginBottom: 0 }}>
          <label>Welcome message</label>
          <textarea value={cfg.welcomeText} onChange={e => setCfg(c => ({ ...c, welcomeText: e.target.value }))} placeholder="Let's get your name first…" />
        </div>
      </div>

      <div className="card">
        <p className="eyebrow">Options</p>
        <h2>Time slots</h2>
        <p className="sub">These are the choices players rank for each day. Reorder with the arrows; the order here is the order they appear.</p>
        <div className="row-list">
          {cfg.times.map((t, i) => (
            <div className="slot" key={i}>
              <span className="ord">{i + 1}</span>
              <input value={t} onChange={e => setTime(i, e.target.value)} placeholder="e.g. 6:00 PM" />
              <div className="arrows">
                <button className="icon-btn" onClick={() => moveTime(i, -1)} disabled={i === 0} aria-label="Move up">↑</button>
                <button className="icon-btn" onClick={() => moveTime(i, 1)} disabled={i === cfg.times.length - 1} aria-label="Move down">↓</button>
              </div>
              <button className="icon-btn" onClick={() => removeTime(i)} aria-label="Remove" disabled={cfg.times.length <= 1}>✕</button>
            </div>
          ))}
        </div>
        <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={addTime}>+ Add time slot</button>
      </div>

      <div className="card">
        <p className="eyebrow">Schedule</p>
        <h2>Active days</h2>
        <p className="sub">Tap to include or remove a day from the survey.</p>
        <div className="day-grid">
          {ALL_DAYS.map(day => (
            <button key={day} className={`day-chip ${cfg.days.includes(day) ? 'on' : ''}`} onClick={() => toggleDay(day)}>
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, position: 'sticky', bottom: 14 }}>
        <button className="btn btn-clay" style={{ flex: 1, boxShadow: '0 6px 18px rgba(199,91,57,.28)' }} onClick={save} disabled={saving}>
          {saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="aw" suppressHydrationWarning>
      <AdminStyles />
      <div className="a-shell">{children}</div>
    </div>
  );
}

function Denied({ signedIn }: { signedIn: boolean }) {
  return (
    <Shell>
      <div className="card" style={{ textAlign: 'center', marginTop: 40 }}>
        <h2>{signedIn ? 'Not authorized' : 'Sign in required'}</h2>
        <p className="sub" style={{ marginBottom: 18 }}>
          {signedIn ? 'This account is not an admin. Ask an existing admin to add you.' : 'Please sign in from the dashboard.'}
        </p>
        <a className="btn btn-primary" href="/admin" style={{ textDecoration: 'none' }}>Go to dashboard</a>
      </div>
    </Shell>
  );
}
