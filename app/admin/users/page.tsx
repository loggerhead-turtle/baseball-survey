'use client';

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged, signOut, User,
  createUserWithEmailAndPassword, sendPasswordResetEmail,
} from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { isAdmin } from '@/lib/config';
import { AdminStyles, AdminChrome } from '@/lib/admin-ui';

type AdminRecord = { uid: string; email: string; addedAt?: any };

export default function AdminUsersPage() {
  const [user, setUser] = useState<User | null>(null);
  const [allowed, setAllowed] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [working, setWorking] = useState(false);
  const [banner, setBanner] = useState<{ kind: 'ok' | 'err'; msg: string } | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const ok = await isAdmin(u.uid);
        setAllowed(ok);
        if (ok) await loadAdmins();
      } else {
        setAllowed(false);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const flash = (kind: 'ok' | 'err', msg: string) => {
    setBanner({ kind, msg });
    setTimeout(() => setBanner(null), 5000);
  };

  const loadAdmins = async () => {
    const snap = await getDocs(collection(db, 'admins'));
    setAdmins(snap.docs.map(d => ({ uid: d.id, ...(d.data() as any) })));
  };

  // Create the new user on a SECONDARY app so the current admin stays logged in,
  // then send them a password-reset link to choose their own password.
  const inviteAdmin = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) return flash('err', 'Enter a valid email address.');
    if (admins.some(a => a.email.toLowerCase() === email)) return flash('err', 'That person is already an admin.');

    setWorking(true);
    let secondary;
    try {
      // Spin up an isolated app instance using the same config.
      secondary = initializeApp((auth.app.options as any), 'admin-invite-' + Date.now());
      const secAuth = getAuth(secondary);

      // Random throwaway password; the user never uses it — they set their own via the reset link.
      const tempPw = cryptoRandom();
      const cred = await createUserWithEmailAndPassword(secAuth, email, tempPw);

      // Record them as an approved admin (uses the PRIMARY db/session, which is the admin).
      await setDoc(doc(db, 'admins', cred.user.uid), {
        email,
        addedAt: new Date().toISOString(),
        addedBy: user?.email || '',
      });

      // Email them a link to set their password.
      await sendPasswordResetEmail(secAuth, email);

      await signOut(secAuth); // clean up the secondary session
      setNewEmail('');
      await loadAdmins();
      flash('ok', `Invited ${email}. They'll get an email to set their password.`);
    } catch (e: any) {
      const code = e?.code || '';
      if (code === 'auth/email-already-in-use') {
        flash('err', 'That email already has a login. Ask them to use "Forgot password" on the sign-in screen, then add them again once resolved.');
      } else if (code === 'auth/weak-password') {
        flash('err', 'Temporary password rejected. Try again.');
      } else {
        flash('err', 'Could not create that admin. ' + (e?.message || ''));
      }
    } finally {
      if (secondary) { try { await deleteApp(secondary); } catch {} }
      setWorking(false);
    }
  };

  const removeAdmin = async (rec: AdminRecord) => {
    if (rec.uid === user?.uid) return; // never remove yourself
    if (!confirm(`Remove ${rec.email} as an admin? They keep their login but lose dashboard access.`)) return;
    try {
      await deleteDoc(doc(db, 'admins', rec.uid));
      await loadAdmins();
      flash('ok', `Removed ${rec.email}.`);
    } catch {
      flash('err', 'Could not remove that admin.');
    }
  };

  if (loading) return <Shell><p style={{ padding: 40, textAlign: 'center', color: '#5d6b7a' }}>Loading…</p></Shell>;
  if (!user || !allowed) return <Denied signedIn={!!user} />;

  return (
    <Shell>
      <AdminChrome email={user.email || ''} active="users" onSignOut={() => signOut(auth)} />

      {banner && <div className={`banner ${banner.kind}`}>{banner.msg}</div>}

      <div className="card">
        <p className="eyebrow">Access control</p>
        <h2>Invite an admin</h2>
        <p className="sub">Enter their email. They receive a link to set their own password — you never see or set it. Only people listed below can reach the admin area.</p>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Email address</label>
          <input
            type="email" value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && inviteAdmin()}
            placeholder="coach@example.com"
          />
        </div>
        <button className="btn btn-clay" onClick={inviteAdmin} disabled={working}>
          {working ? 'Sending invite…' : 'Send invite'}
        </button>
      </div>

      <div className="card">
        <p className="eyebrow">{admins.length} {admins.length === 1 ? 'person' : 'people'}</p>
        <h2>Current admins</h2>
        <p className="sub">Everyone here can view responses and change survey setup.</p>
        <div>
          {admins.length === 0 ? (
            <p style={{ color: '#94a3b8', padding: '20px 0' }}>No admins recorded yet.</p>
          ) : admins.map(rec => (
            <div className="u-row" key={rec.uid}>
              <div style={{ minWidth: 0 }}>
                <div className="u-mail">{rec.email}</div>
                <div className="u-tag">{rec.uid === user.uid ? 'YOU · ADMIN' : 'ADMIN'}</div>
              </div>
              {rec.uid === user.uid
                ? <span className="u-you">can&apos;t remove self</span>
                : <button className="btn btn-danger btn-sm" onClick={() => removeAdmin(rec)}>Remove</button>}
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}

function cryptoRandom() {
  // 24+ char random string with mixed classes to satisfy Firebase password rules.
  const arr = new Uint8Array(20);
  (globalThis.crypto || (window as any).crypto).getRandomValues(arr);
  const base = Array.from(arr, b => b.toString(36)).join('');
  return 'Aa1!' + base;
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
