'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  sendPasswordResetEmail, User,
} from 'firebase/auth';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { isAdmin, getSurveyConfig, SurveyConfig, DEFAULT_CONFIG } from '@/lib/config';
import { AdminStyles, AdminChrome } from '@/lib/admin-ui';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [surveys, setSurveys] = useState<any[]>([]);
  const [cfg, setCfg] = useState<SurveyConfig>(DEFAULT_CONFIG);
  const [view, setView] = useState<'responses' | 'results' | 'importance'>('responses');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ok = await isAdmin(u.uid);
        setAllowed(ok);
        if (ok) {
          setCfg(await getSurveyConfig());
          await loadSurveys();
        }
      } else {
        setAllowed(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const loadSurveys = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'surveys')));
      setSurveys(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error('Error loading surveys:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setNotice('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setEmail(''); setPassword('');
    } catch {
      setError('Email or password is incorrect.');
    }
  };

  const handleReset = async () => {
    if (!email.trim()) return setError('Enter your email above first, then tap reset.');
    setError(''); setNotice('');
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setNotice('Password reset email sent. Check your inbox.');
    } catch {
      setError('Could not send a reset email to that address.');
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (confirm('Delete this response? This cannot be undone.')) {
      try { await deleteDoc(doc(db, 'surveys', id)); loadSurveys(); }
      catch (err) { console.error(err); }
    }
  };

  const downloadCSV = () => {
    const head = ['Name', 'Submitted'];
    cfg.days.forEach(d => head.push(`${d} Picks`, `${d} Unavailable`, `${d} Importance`));
    const rows = surveys.map(s => {
      const byDay: Record<string, any> = {};
      (s.days || []).forEach((d: any) => { byDay[d.day] = d; });
      const cells = [s.name, s.submittedAt?.toDate?.().toLocaleString() || 'N/A'];
      cfg.days.forEach(dn => {
        const d = byDay[dn];
        cells.push(
          d?.picks?.map((p: any) => `${p.rank}. ${p.time}`).join('; ') || 'None',
          d?.unavailable?.join(', ') || 'None',
          d ? Object.entries(d.importance || {}).map(([t, v]) => `${t}:${v}`).join('; ') : 'None',
        );
      });
      return cells;
    });
    let csv = head.join(',') + '\n';
    rows.forEach(r => { csv += r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',') + '\n'; });
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url; a.download = `responses-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
  };

  // Weighted scoring keyed on the live config (days + times).
  const scoreResults = () => {
    const res: Record<string, Record<string, number>> = {};
    cfg.days.forEach(d => { res[d] = {}; cfg.times.forEach(t => { res[d][t] = 0; }); });
    surveys.forEach(s => (s.days || []).forEach((d: any) => {
      if (!res[d.day]) return;
      d.picks?.forEach((p: any) => {
        const pts = p.rank === 1 ? 5 : p.rank === 2 ? 3 : 1;
        if (res[d.day][p.time] === undefined) res[d.day][p.time] = 0;
        res[d.day][p.time] += pts;
      });
    }));
    return res;
  };

  // Average importance (1-10) per slot, independent of ranking points.
  const importanceProfile = () => {
    const sum: Record<string, Record<string, number>> = {};
    const cnt: Record<string, Record<string, number>> = {};
    cfg.days.forEach(d => { sum[d] = {}; cnt[d] = {}; cfg.times.forEach(t => { sum[d][t] = 0; cnt[d][t] = 0; }); });
    surveys.forEach(s => (s.days || []).forEach((d: any) => {
      if (!sum[d.day]) return;
      Object.entries(d.importance || {}).forEach(([t, v]: any) => {
        if (sum[d.day][t] === undefined) { sum[d.day][t] = 0; cnt[d.day][t] = 0; }
        sum[d.day][t] += Number(v); cnt[d.day][t] += 1;
      });
    }));
    return { sum, cnt };
  };

  if (loading) return <Shell><p style={{ padding: 40, textAlign: 'center', color: '#5d6b7a' }}>Loading…</p></Shell>;

  // ---- Login screen (no public signup) ----
  if (!user) {
    return (
      <Shell>
        <div className="card" style={{ maxWidth: 400, margin: '48px auto 0' }}>
          <div className="a-badge" style={{ margin: '0 auto 16px' }}>EG</div>
          <h2 style={{ textAlign: 'center' }}>Admin sign in</h2>
          <p className="sub" style={{ textAlign: 'center' }}>Team operations dashboard</p>
          {error && <div className="banner err">{error}</div>}
          {notice && <div className="banner ok">{notice}</div>}
          <form onSubmit={handleLogin}>
            <div className="field">
              <label>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <div className="field">
              <label>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }}>Sign in</button>
          </form>
          <button onClick={handleReset} className="btn btn-ghost btn-sm" style={{ width: '100%' }}>Forgot password?</button>
        </div>
        <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: 12.5, marginTop: 16 }}>
          Access is invite-only. Ask an existing admin to add you.
        </p>
      </Shell>
    );
  }

  // ---- Signed in but not an admin ----
  if (!allowed) {
    return (
      <Shell>
        <div className="card" style={{ textAlign: 'center', maxWidth: 440, margin: '48px auto 0' }}>
          <h2>Not authorized</h2>
          <p className="sub">This account isn&apos;t on the admin list. Ask an existing admin to invite this email, then sign in again.</p>
          <button className="btn btn-ghost" onClick={() => signOut(auth)}>Sign out</button>
        </div>
      </Shell>
    );
  }

  const results = scoreResults();
  const { sum, cnt } = importanceProfile();

  return (
    <Shell>
      <AdminChrome email={user.email || ''} active="dashboard" onSignOut={() => signOut(auth)} />

      <div className="a-nav" style={{ marginTop: -6 }}>
        <a className={view === 'responses' ? 'active' : ''} onClick={() => setView('responses')} style={{ cursor: 'pointer' }}>Responses · {surveys.length}</a>
        <a className={view === 'results' ? 'active' : ''} onClick={() => setView('results')} style={{ cursor: 'pointer' }}>Best times</a>
        <a className={view === 'importance' ? 'active' : ''} onClick={() => setView('importance')} style={{ cursor: 'pointer' }}>Importance</a>
        <a onClick={downloadCSV} style={{ cursor: 'pointer', marginLeft: 'auto', color: '#2f7d54', borderColor: '#bfe0cd' }}>↓ CSV</a>
      </div>

      {view === 'responses' && (
        <div className="card">
          <h2>Individual responses</h2>
          <p className="sub">Every submission, newest grouping by day.</p>
          {surveys.length === 0 ? <Empty /> : surveys.map(s => (
            <div key={s.id} style={{ borderTop: '1px solid #e3e6ea', paddingTop: 16, marginTop: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: 10 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700 }}>{s.name}</div>
                  <div style={{ fontSize: 12.5, color: '#5d6b7a', fontFamily: 'var(--mono)' }}>{s.submittedAt?.toDate?.().toLocaleString() || 'N/A'}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeleteSurvey(s.id)}>Delete</button>
              </div>
              {(s.days || []).map((d: any, i: number) => (
                <div key={i} style={{ margin: '12px 0 0', paddingLeft: 14, borderLeft: '3px solid #c75b39' }}>
                  <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>{d.day}</div>
                  <div style={{ fontSize: 13, color: '#475569' }}><strong>Picks:</strong> {d.picks?.map((p: any) => `${p.rank}. ${p.time}`).join(', ') || 'None'}</div>
                  <div style={{ fontSize: 13, color: '#475569' }}><strong>Unavailable:</strong> {d.unavailable?.join(', ') || 'None'}</div>
                  <div style={{ fontSize: 13, color: '#475569' }}><strong>Importance:</strong> {Object.entries(d.importance || {}).map(([t, v]: any) => `${t}: ${v}/10`).join(', ') || 'None'}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {view === 'results' && (
        <div className="card">
          <h2>Best times by day</h2>
          <p className="sub">Weighted: 1st choice = 5 pts, 2nd = 3, 3rd+ = 1. Highest total wins the day.</p>
          {surveys.length === 0 ? <Empty /> : cfg.days.map(day => {
            const ranked = Object.entries(results[day] || {}).map(([time, score]) => ({ time, score })).sort((a, b) => b.score - a.score);
            const top = ranked[0]?.score || 0;
            return (
              <div key={day} style={{ marginTop: 22 }}>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{day}</div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {ranked.map(r => (
                    <div key={r.time} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 78, fontFamily: 'var(--mono)', fontSize: 13, color: '#16202b' }}>{r.time}</span>
                      <div style={{ flex: 1, background: '#eef0ee', borderRadius: 6, height: 26, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, width: top ? `${(r.score / top) * 100}%` : '0%', background: r.score === top && top > 0 ? '#2f7d54' : '#9fb7a8', borderRadius: 6, transition: 'width .4s' }} />
                      </div>
                      <span style={{ width: 50, textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700 }}>{r.score} pt</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {view === 'importance' && (
        <div className="card">
          <h2>Importance profile</h2>
          <p className="sub">Average of the 1–10 importance sliders players set — separate from ranking points.</p>
          {surveys.length === 0 ? <Empty /> : cfg.days.map(day => (
            <div key={day} style={{ marginTop: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{day}</div>
              <div style={{ display: 'grid', gap: 8 }}>
                {cfg.times.map(t => {
                  const c = cnt[day]?.[t] || 0;
                  const avg = c ? (sum[day][t] / c) : 0;
                  return (
                    <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ width: 78, fontFamily: 'var(--mono)', fontSize: 13 }}>{t}</span>
                      <div style={{ flex: 1, background: '#eef0ee', borderRadius: 6, height: 26, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', inset: 0, width: `${(avg / 10) * 100}%`, background: '#c75b39', borderRadius: 6, transition: 'width .4s' }} />
                      </div>
                      <span style={{ width: 64, textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700 }}>{c ? avg.toFixed(1) : '—'}{c ? '/10' : ''}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

function Empty() {
  return <p style={{ color: '#94a3b8', textAlign: 'center', padding: '36px 0' }}>No responses yet.</p>;
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="aw" suppressHydrationWarning>
      <AdminStyles />
      <div className="a-shell">{children}</div>
    </div>
  );
}
