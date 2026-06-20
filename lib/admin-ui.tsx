'use client';

// Shared style block + small UI primitives for all admin pages.
// Keeping this in one place guarantees the settings, users, and dashboard
// pages look like one product rather than three.

import React from 'react';

export function AdminStyles() {
  return (
    <style suppressHydrationWarning>{`
      :root {
        --navy: #14202e;
        --navy-2: #1d2d40;
        --line: #e3e6ea;
        --ink: #16202b;
        --muted: #5d6b7a;
        --clay: #c75b39;
        --clay-soft: #f6e9e4;
        --field: #2f7d54;
        --bg: #f4f5f3;
        --white: #ffffff;
        --radius: 14px;
        --mono: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
        --sans: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }
      * { box-sizing: border-box; }
      .aw { min-height: 100dvh; background: var(--bg); color: var(--ink);
            font-family: var(--sans); margin: 0; }
      .a-shell { max-width: 1040px; margin: 0 auto; padding: 20px 18px 80px; }

      /* Top bar */
      .a-top { display: flex; align-items: center; justify-content: space-between;
               gap: 12px; padding: 16px 18px; background: var(--navy);
               border-radius: var(--radius); color: #eaf0f6; margin-bottom: 18px; }
      .a-brand { display: flex; align-items: center; gap: 12px; min-width: 0; }
      .a-badge { width: 38px; height: 38px; border-radius: 10px; flex-shrink: 0;
                 background: var(--clay); display: grid; place-items: center;
                 font-family: var(--mono); font-weight: 700; color: #fff; font-size: 17px; }
      .a-brand h1 { font-size: 16px; font-weight: 650; margin: 0; letter-spacing: -.01em;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .a-brand p { margin: 2px 0 0; font-size: 12px; color: #9fb0c2;
                   font-family: var(--mono); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
      .a-signout { background: transparent; border: 1px solid #38485b; color: #cdd9e5;
                   padding: 9px 14px; border-radius: 9px; font-weight: 600; font-size: 13px;
                   cursor: pointer; white-space: nowrap; }
      .a-signout:hover { background: #24364a; }

      /* Nav tabs (route links) */
      .a-nav { display: flex; gap: 8px; margin-bottom: 18px; flex-wrap: wrap; }
      .a-nav a { text-decoration: none; padding: 9px 15px; border-radius: 999px;
                 font-size: 13.5px; font-weight: 600; color: var(--muted);
                 background: var(--white); border: 1px solid var(--line); }
      .a-nav a.active { color: #fff; background: var(--navy); border-color: var(--navy); }
      .a-nav a:hover:not(.active) { border-color: #c9ced4; }

      /* Cards */
      .card { background: var(--white); border: 1px solid var(--line);
              border-radius: var(--radius); padding: 22px; margin-bottom: 16px; }
      .card h2 { font-size: 18px; font-weight: 700; margin: 0 0 4px; letter-spacing: -.01em; }
      .card .sub { color: var(--muted); font-size: 13.5px; margin: 0 0 18px; }
      .eyebrow { font-family: var(--mono); font-size: 11px; letter-spacing: .12em;
                 text-transform: uppercase; color: var(--clay); margin: 0 0 6px; font-weight: 600; }

      /* Form fields */
      .field { margin-bottom: 16px; }
      .field label { display: block; font-size: 12px; font-weight: 600; color: var(--muted);
                     text-transform: uppercase; letter-spacing: .04em; margin-bottom: 7px; }
      .field input, .field textarea {
        width: 100%; padding: 12px 14px; border: 1.5px solid var(--line); border-radius: 10px;
        font-size: 15px; font-family: var(--sans); background: #fafbfc; color: var(--ink); }
      .field textarea { resize: vertical; min-height: 70px; line-height: 1.5; }
      .field input:focus, .field textarea:focus { outline: none; border-color: var(--navy);
        background: #fff; box-shadow: 0 0 0 3px rgba(20,32,46,.08); }

      /* Buttons */
      .btn { padding: 11px 18px; border-radius: 10px; font-weight: 650; font-size: 14px;
             cursor: pointer; border: 1px solid transparent; font-family: var(--sans); }
      .btn-primary { background: var(--navy); color: #fff; }
      .btn-primary:hover { background: #0e1722; }
      .btn-primary:disabled { opacity: .5; cursor: not-allowed; }
      .btn-clay { background: var(--clay); color: #fff; }
      .btn-clay:hover { background: #b04e2f; }
      .btn-ghost { background: #fff; color: var(--ink); border-color: var(--line); }
      .btn-ghost:hover { background: #f6f7f8; }
      .btn-danger { background: var(--clay-soft); color: var(--clay); }
      .btn-danger:hover { background: #efd9d1; }
      .btn-sm { padding: 7px 12px; font-size: 12.5px; border-radius: 8px; }

      /* Slot / day rows */
      .row-list { display: flex; flex-direction: column; gap: 9px; }
      .slot { display: flex; align-items: center; gap: 10px; padding: 10px 12px;
              background: #fafbfc; border: 1.5px solid var(--line); border-radius: 11px; }
      .slot .ord { font-family: var(--mono); font-size: 12px; color: var(--muted);
                   width: 22px; flex-shrink: 0; text-align: center; }
      .slot input { flex: 1; border: none; background: transparent; font-size: 15px;
                    color: var(--ink); padding: 4px 2px; min-width: 0; }
      .slot input:focus { outline: none; }
      .slot .arrows { display: flex; gap: 3px; }
      .icon-btn { width: 30px; height: 30px; border-radius: 8px; border: 1px solid var(--line);
                  background: #fff; cursor: pointer; display: grid; place-items: center;
                  color: var(--muted); font-size: 13px; flex-shrink: 0; }
      .icon-btn:hover:not(:disabled) { background: #f1f2f3; color: var(--ink); }
      .icon-btn:disabled { opacity: .35; cursor: not-allowed; }

      /* Day toggles */
      .day-grid { display: flex; flex-wrap: wrap; gap: 8px; }
      .day-chip { padding: 9px 15px; border-radius: 999px; border: 1.5px solid var(--line);
                  background: #fff; font-weight: 600; font-size: 13.5px; cursor: pointer;
                  color: var(--muted); }
      .day-chip.on { background: var(--field); border-color: var(--field); color: #fff; }

      /* Toast / banners */
      .banner { padding: 12px 15px; border-radius: 10px; font-size: 13.5px; margin-bottom: 16px;
                font-weight: 500; }
      .banner.ok { background: #e7f4ec; color: #1d6e42; }
      .banner.err { background: var(--clay-soft); color: var(--clay); }

      /* Users table */
      .u-row { display: flex; align-items: center; justify-content: space-between; gap: 12px;
               padding: 14px 4px; border-bottom: 1px solid var(--line); }
      .u-row:last-child { border-bottom: none; }
      .u-mail { font-size: 14.5px; font-weight: 600; word-break: break-all; }
      .u-tag { font-family: var(--mono); font-size: 11px; color: var(--field);
               letter-spacing: .04em; }
      .u-you { font-family: var(--mono); font-size: 11px; color: var(--muted); }

      .toggle-wrap { display: flex; align-items: center; gap: 12px; padding: 14px;
                     background: #fafbfc; border: 1.5px solid var(--line); border-radius: 11px; }
      .toggle { width: 46px; height: 27px; border-radius: 999px; background: #cdd3da;
                position: relative; cursor: pointer; flex-shrink: 0; transition: background .2s; border: none; }
      .toggle.on { background: var(--field); }
      .toggle span { position: absolute; top: 3px; left: 3px; width: 21px; height: 21px;
                     background: #fff; border-radius: 50%; transition: left .2s; }
      .toggle.on span { left: 22px; }

      @media (max-width: 560px) {
        .a-shell { padding: 14px 12px 70px; }
        .card { padding: 18px 16px; }
        .a-top { padding: 14px; }
      }
    `}</style>
  );
}

export function AdminChrome({
  email, active, onSignOut,
}: { email: string; active: 'dashboard' | 'settings' | 'users'; onSignOut: () => void }) {
  return (
    <>
      <div className="a-top">
        <div className="a-brand">
          <div className="a-badge">EG</div>
          <div style={{ minWidth: 0 }}>
            <h1>Team Operations</h1>
            <p>{email}</p>
          </div>
        </div>
        <button className="a-signout" onClick={onSignOut}>Sign out</button>
      </div>
      <nav className="a-nav">
        <a href="/admin" className={active === 'dashboard' ? 'active' : ''}>Responses</a>
        <a href="/admin/settings" className={active === 'settings' ? 'active' : ''}>Survey setup</a>
        <a href="/admin/users" className={active === 'users' ? 'active' : ''}>Admins</a>
      </nav>
    </>
  );
}