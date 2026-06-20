'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getSurveyConfig, SurveyConfig, DEFAULT_CONFIG } from '@/lib/config';

type RankingItem = { time: string; rank: number };
type DayData = { rankings: RankingItem[]; unavailable: boolean[]; importance: { [k: string]: number } };

const dayColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#ef4444'];

function labelFor(time: string): string {
  const t = time.toLowerCase();
  if (t.includes('am')) {
    const h = parseInt(time);
    if (h <= 8) return 'Early morning';
    if (h <= 11) return 'Morning';
    return 'Late morning';
  }
  const h = parseInt(time);
  if (h === 12 || h <= 1) return 'Midday';
  if (h <= 4) return 'Afternoon';
  if (h <= 6) return 'Evening';
  return 'Night';
}

export default function SurveyPage() {
  const [cfg, setCfg] = useState<SurveyConfig | null>(null);
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [progress, setProgress] = useState(20);
  const [draggedItem, setDraggedItem] = useState<RankingItem | null>(null);
  const [currentDay, setCurrentDay] = useState(0);
  const [dayData, setDayData] = useState<DayData[]>([]);
  const [reviewData, setReviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getSurveyConfig().then(c => {
      setCfg(c);
      setDayData(c.days.map(() => ({
        rankings: [],
        unavailable: c.times.map(() => false),
        importance: {},
      })));
    }).catch(() => setCfg(DEFAULT_CONFIG));
  }, []);

  if (!cfg) {
    return <div suppressHydrationWarning style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', fontFamily: 'system-ui', color: '#64748b' }}>Loading…</div>;
  }

  if (!cfg.open) {
    return (
      <div suppressHydrationWarning style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', background: '#f4f5f3', fontFamily: 'system-ui', padding: 24 }}>
        <div style={{ maxWidth: 440, textAlign: 'center', background: '#fff', padding: 40, borderRadius: 16, border: '1px solid #e3e6ea' }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🗓️</div>
          <h1 style={{ fontSize: 22, margin: '0 0 8px' }}>This survey is closed</h1>
          <p style={{ color: '#5d6b7a', fontSize: 14.5, margin: 0 }}>Thanks for your interest. The scheduling survey isn&apos;t accepting responses right now.</p>
        </div>
      </div>
    );
  }

  const times = cfg.times;
  const days = cfg.days;

  const handleNameSubmit = () => { if (name.trim()) { setStep(2); setProgress(40); } };
  const goToStep = (n: number) => { setStep(n); setProgress([0, 20, 40, 80, 100][n - 1]); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const toggleTime = (di: number, ti: number) => {
    const nd = [...dayData]; const time = times[ti];
    if (nd[di].unavailable[ti]) return;
    const ex = nd[di].rankings.findIndex(r => r.time === time);
    if (ex > -1) nd[di].rankings.splice(ex, 1);
    else nd[di].rankings.push({ time, rank: 0 });
    nd[di].rankings = nd[di].rankings.map((r, i) => ({ ...r, rank: i + 1 }));
    setDayData(nd);
  };

  const toggleUnavailable = (di: number, ti: number) => {
    const nd = [...dayData];
    nd[di].unavailable[ti] = !nd[di].unavailable[ti];
    if (nd[di].unavailable[ti]) {
      const time = times[ti];
      nd[di].rankings = nd[di].rankings.filter(r => r.time !== time).map((r, i) => ({ ...r, rank: i + 1 }));
    }
    setDayData(nd);
  };

  const isSel = (di: number, ti: number) => dayData[di].rankings.some(r => r.time === times[ti]);

  const onDrop = (e: React.DragEvent, di: number, dropRank: number) => {
    e.preventDefault();
    if (!draggedItem) return;
    const nd = [...dayData];
    const from = nd[di].rankings.findIndex(r => r.time === draggedItem.time);
    if (from === -1) return;
    const [m] = nd[di].rankings.splice(from, 1);
    nd[di].rankings.splice(dropRank - 1, 0, m);
    nd[di].rankings = nd[di].rankings.map((r, i) => ({ ...r, rank: i + 1 }));
    setDayData(nd); setDraggedItem(null);
  };

  const setImportance = (di: number, time: string, v: number) => {
    const nd = [...dayData]; nd[di].importance[time] = v; setDayData(nd);
  };

  const goToReview = () => {
    setReviewData(days.map((day, di) => ({
      day, picks: dayData[di].rankings,
      unavailable: times.filter((_, i) => dayData[di].unavailable[i]),
      importance: dayData[di].importance,
    })));
    goToStep(3);
  };

  const submitSurvey = async () => {
    setLoading(true); setError('');
    try {
      await addDoc(collection(db, 'surveys'), {
        name, submittedAt: serverTimestamp(),
        days: days.map((day, di) => ({
          day, picks: dayData[di].rankings,
          unavailable: times.filter((_, i) => dayData[di].unavailable[i]),
          importance: dayData[di].importance,
        })),
      });
      goToStep(4);
    } catch (err) {
      setError('Failed to submit. Please try again.'); console.error(err);
    } finally { setLoading(false); }
  };

  return (
    <div suppressHydrationWarning style={{ margin: 0, padding: 0, background: '#f4f5f3', minHeight: '100dvh' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .sv { font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .container { max-width: 760px; margin: 0 auto; padding: 0 16px; }
        .card-main { background: #fff; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,.06), 0 10px 30px rgba(20,32,46,.06); overflow: hidden; margin: 18px auto 40px; }
        .header { background: linear-gradient(150deg, #14202e 0%, #223349 100%); color: #fff; padding: 40px 32px; text-align: center; }
        .header h1 { font-size: 27px; font-weight: 700; letter-spacing: -.02em; margin-bottom: 7px; }
        .header p { font-size: 14.5px; opacity: .82; max-width: 460px; margin: 0 auto; line-height: 1.55; }
        .progress { margin-top: 22px; height: 3px; background: rgba(255,255,255,.16); border-radius: 2px; overflow: hidden; }
        .progress > div { height: 100%; background: #c75b39; transition: width .4s; }
        .content { padding: 36px 32px; }
        .step { display: none; } .step.active { display: block; animation: fade .35s ease; }
        @keyframes fade { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        .stitle { font-size: 23px; font-weight: 700; letter-spacing: -.01em; margin-bottom: 6px; }
        .ssub { font-size: 14px; color: #5d6b7a; margin-bottom: 28px; line-height: 1.5; }
        .field label { display:block; font-size:12px; font-weight:600; color:#5d6b7a; text-transform:uppercase; letter-spacing:.05em; margin-bottom:8px; }
        .field input { width:100%; padding:13px 15px; border:1.5px solid #e3e6ea; border-radius:11px; font-size:15px; background:#fafbfc; }
        .field input:focus { outline:none; border-color:#14202e; background:#fff; box-shadow:0 0 0 3px rgba(20,32,46,.08); }
        .daytabs { display:flex; gap:7px; margin-bottom:28px; flex-wrap:wrap; }
        .daytab { padding:9px 16px; border:1.5px solid #e3e6ea; background:#fff; color:#5d6b7a; font-size:13px; font-weight:600; cursor:pointer; border-radius:999px; }
        .daytab.active { color:#fff; border-color:#14202e; background:#14202e; }
        .daycontent { display:none; } .daycontent.active { display:block; }
        .shead { font-size:12px; font-weight:700; color:#5d6b7a; text-transform:uppercase; letter-spacing:.06em; margin:26px 0 13px; }
        .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(120px,1fr)); gap:10px; }
        .slot { padding:16px 14px; border:1.5px solid #e3e6ea; border-radius:12px; text-align:center; cursor:pointer; background:#fff; transition:all .18s; position:relative; }
        .slot:hover:not(.un) { border-color:#c2c8cf; transform:translateY(-1px); }
        .slot.un { opacity:.4; cursor:not-allowed; background:#f1f2f3; }
        .slot.sel { border-color:#14202e; background:#eef1f4; box-shadow:0 0 0 3px rgba(20,32,46,.07); }
        .slot.sel::after { content:'✓'; position:absolute; top:8px; right:9px; color:#2f7d54; font-weight:800; font-size:12px; }
        .slot .t { font-size:15px; font-weight:700; color:#16202b; margin-bottom:3px; }
        .slot .l { font-size:11.5px; color:#94a3b8; }
        .hint { font-size:12.5px; color:#5d6b7a; margin-top:12px; padding:10px 13px; background:#eef1f4; border-left:3px solid #14202e; border-radius:7px; }
        .unsec { background:#fafbfc; padding:18px; border-radius:12px; margin:22px 0; border:1.5px solid #e3e6ea; }
        .unsec h3 { font-size:12px; font-weight:700; color:#5d6b7a; text-transform:uppercase; letter-spacing:.05em; margin-bottom:13px; }
        .cbs { display:flex; flex-wrap:wrap; gap:13px; }
        .cb { display:flex; align-items:center; gap:8px; cursor:pointer; }
        .cb input { width:18px; height:18px; accent-color:#c75b39; cursor:pointer; }
        .cb label { font-size:13.5px; color:#475569; font-weight:500; cursor:pointer; }
        .ranklist { display:flex; flex-direction:column; gap:9px; min-height:70px; padding:12px; background:#fafbfc; border-radius:12px; border:2px dashed #cbd3da; }
        .rankitem { padding:13px 15px; background:#fff; border-radius:9px; display:flex; align-items:center; gap:13px; cursor:grab; border:1.5px solid #e3e6ea; }
        .rankitem .h { color:#cbd3da; font-size:15px; }
        .rankitem .n { min-width:30px; height:30px; border-radius:8px; background:#14202e; color:#fff; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; font-family:ui-monospace,monospace; }
        .rankitem .tm { flex:1; font-size:14px; color:#16202b; font-weight:600; }
        .empty { padding:26px; text-align:center; color:#94a3b8; font-size:13px; }
        .impsec { background:#fafbfc; padding:18px; border-radius:12px; margin:22px 0; border:1.5px solid #e3e6ea; }
        .impsec h3 { font-size:12px; font-weight:700; color:#5d6b7a; text-transform:uppercase; letter-spacing:.05em; margin-bottom:16px; }
        .impitem { margin-bottom:15px; padding:13px; background:#fff; border-radius:9px; border:1.5px solid #e3e6ea; }
        .implabel { font-size:13px; font-weight:600; color:#475569; margin-bottom:9px; display:flex; justify-content:space-between; }
        .implabel .v { color:#c75b39; font-weight:700; font-family:ui-monospace,monospace; }
        .slider { width:100%; height:6px; border-radius:3px; background:#e3e6ea; -webkit-appearance:none; appearance:none; }
        .slider::-webkit-slider-thumb { -webkit-appearance:none; width:18px; height:18px; border-radius:50%; background:#c75b39; cursor:pointer; }
        .slider::-moz-range-thumb { width:18px; height:18px; border-radius:50%; background:#c75b39; cursor:pointer; border:none; }
        .rcard { border:1.5px solid #e3e6ea; border-radius:12px; margin-bottom:16px; overflow:hidden; }
        .rhead { font-size:14px; font-weight:700; color:#fff; padding:14px 18px; }
        .rcontent { padding:18px; }
        .rpick { display:flex; gap:12px; padding:9px 0; border-bottom:1px solid #f1f2f3; }
        .rpick:last-child { border-bottom:none; }
        .rpick .n { min-width:27px; height:27px; border-radius:7px; background:#14202e; color:#fff; display:flex; align-items:center; justify-content:center; font-size:11px; font-weight:700; font-family:ui-monospace,monospace; }
        .rpick .tm { font-size:14px; font-weight:600; color:#16202b; }
        .rpick .im { font-size:12px; color:#94a3b8; }
        .runav { background:#f1f2f3; padding:11px; border-radius:7px; font-size:13px; color:#475569; border-left:3px solid #5d6b7a; margin-top:10px; }
        .btns { display:flex; gap:11px; margin-top:32px; }
        button.b { padding:13px 26px; border:none; border-radius:11px; font-size:14px; font-weight:650; cursor:pointer; flex:1; }
        .bp { background:#c75b39; color:#fff; box-shadow:0 4px 14px rgba(199,91,57,.25); }
        .bs { background:#fff; color:#475569; border:1.5px solid #e3e6ea; }
        .bp:disabled { opacity:.55; cursor:not-allowed; }
        .err { background:#f6e9e4; color:#c75b39; padding:12px; border-radius:9px; margin-bottom:18px; font-size:14px; }
        .success { text-align:center; padding:70px 32px 56px; }
        .success .i { font-size:64px; margin-bottom:20px; }
        .success h2 { font-size:25px; font-weight:700; margin-bottom:8px; }
        .success p { font-size:14px; color:#5d6b7a; margin-bottom:8px; }
        @media (max-width:560px){ .content{padding:28px 20px;} .header{padding:32px 22px;} }
      `}</style>

      <div className="sv">
        <div className="container">
          <div className="card-main">
            <div className="header">
              <h1>{cfg.title}</h1>
              <p>{cfg.subtitle}</p>
              <div className="progress"><div style={{ width: `${progress}%` }} /></div>
            </div>

            <div className="content">
              {/* Step 1 */}
              <div className={`step ${step === 1 ? 'active' : ''}`}>
                <h2 className="stitle">{cfg.welcomeTitle}</h2>
                <p className="ssub">{cfg.welcomeText}</p>
                <div className="field">
                  <label>Your name</label>
                  <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleNameSubmit()} placeholder="Enter your full name…" />
                </div>
                <div className="btns">
                  <button className="b bp" onClick={handleNameSubmit}>Start survey</button>
                </div>
              </div>

              {/* Step 2 */}
              <div className={`step ${step === 2 ? 'active' : ''}`}>
                <h2 className="stitle">Your preferences</h2>
                <p className="ssub">For each day, tap the times that work and rank them by preference.</p>
                <div className="daytabs">
                  {days.map((d, i) => (
                    <button key={i} className={`daytab ${currentDay === i ? 'active' : ''}`} onClick={() => setCurrentDay(i)}>{d}</button>
                  ))}
                </div>

                {days.map((_day, di) => (
                  <div key={di} className={`daycontent ${currentDay === di ? 'active' : ''}`}>
                    <div className="shead">Available times</div>
                    <div className="grid">
                      {times.map((time, ti) => (
                        <div key={ti}
                          className={`slot ${isSel(di, ti) ? 'sel' : ''} ${dayData[di].unavailable[ti] ? 'un' : ''}`}
                          onClick={() => !dayData[di].unavailable[ti] && toggleTime(di, ti)}>
                          <div className="t">{time}</div>
                          <div className="l">{labelFor(time)}</div>
                        </div>
                      ))}
                    </div>
                    <div className="hint">Tip: pick several, then drag to rank them below.</div>

                    <div className="unsec">
                      <h3>Times you&apos;re NOT available</h3>
                      <div className="cbs">
                        {times.map((time, ti) => (
                          <div key={ti} className="cb">
                            <input type="checkbox" id={`u${di}-${ti}`} checked={dayData[di].unavailable[ti]} onChange={() => toggleUnavailable(di, ti)} />
                            <label htmlFor={`u${di}-${ti}`}>{time}</label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="shead">Rank your preferences</div>
                    <div className="ranklist" onDragOver={e => e.preventDefault()} onDrop={e => e.preventDefault()}>
                      {dayData[di].rankings.length === 0 ? <div className="empty">Select times above to rank them here</div> :
                        dayData[di].rankings.map((item, idx) => (
                          <div key={idx} className="rankitem" draggable
                            onDragStart={() => setDraggedItem(item)}
                            onDragOver={e => e.preventDefault()}
                            onDrop={e => onDrop(e, di, idx + 1)}>
                            <span className="h">⋮⋮</span>
                            <div className="n">{item.rank}</div>
                            <div className="tm">{item.time}</div>
                          </div>
                        ))}
                    </div>

                    {dayData[di].rankings.length > 1 && (
                      <div className="impsec">
                        <h3>How important is each time?</h3>
                        {dayData[di].rankings.map(r => (
                          <div key={r.time} className="impitem">
                            <div className="implabel"><span>{r.time}</span><span className="v">{dayData[di].importance[r.time] || 5}/10</span></div>
                            <input type="range" min={1} max={10} className="slider"
                              value={dayData[di].importance[r.time] || 5}
                              onChange={e => setImportance(di, r.time, parseInt(e.target.value))} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <div className="btns">
                  <button className="b bs" onClick={() => goToStep(1)}>Back</button>
                  <button className="b bp" onClick={goToReview}>Review answers</button>
                </div>
              </div>

              {/* Step 3 */}
              <div className={`step ${step === 3 ? 'active' : ''}`}>
                <h2 className="stitle">Review your answers</h2>
                <p className="ssub">Make sure everything looks right before submitting.</p>
                {reviewData && reviewData.map((dr: any, idx: number) => (
                  <div key={idx} className="rcard">
                    <div className="rhead" style={{ background: dayColors[idx % dayColors.length] }}>{dr.day}</div>
                    <div className="rcontent">
                      {dr.picks.length === 0 && dr.unavailable.length === 0 ? (
                        <div style={{ fontSize: 13, color: '#94a3b8' }}>No preferences set.</div>
                      ) : (
                        <>
                          {dr.picks.map((p: any, pi: number) => (
                            <div key={pi} className="rpick">
                              <div className="n">{p.rank}</div>
                              <div>
                                <div className="tm">{p.time}</div>
                                <div className="im">Importance: {dayData[idx].importance[p.time] || 5}/10</div>
                              </div>
                            </div>
                          ))}
                          {dr.unavailable.length > 0 && <div className="runav">Unavailable: {dr.unavailable.join(', ')}</div>}
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {error && <div className="err">{error}</div>}
                <div className="btns">
                  <button className="b bs" onClick={() => goToStep(2)}>Back</button>
                  <button className="b bp" onClick={submitSurvey} disabled={loading}>{loading ? 'Submitting…' : 'Submit survey'}</button>
                </div>
              </div>

              {/* Step 4 */}
              <div className={`step ${step === 4 ? 'active' : ''}`}>
                <div className="success">
                  <div className="i">✅</div>
                  <h2>All set!</h2>
                  <p>Your survey has been submitted.</p>
                  <p>Thanks for helping schedule the best practice times.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
