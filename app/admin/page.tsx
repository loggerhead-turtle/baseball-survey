'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, getDocs, deleteDoc, doc } from 'firebase/firestore';

export default function AdminPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState('');
  const [surveys, setSurveys] = useState<any[]>([]);
  const [view, setView] = useState('responses'); // 'responses' or 'results'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        loadSurveys();
      }
    });
    return unsubscribe;
  }, []);

  const loadSurveys = async () => {
    try {
      const q = query(collection(db, 'surveys'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSurveys(data);
    } catch (err) {
      console.error('Error loading surveys:', err);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleDeleteSurvey = async (id: string) => {
    if (confirm('Are you sure you want to delete this survey response?')) {
      try {
        await deleteDoc(doc(db, 'surveys', id));
        loadSurveys();
      } catch (err) {
        console.error('Error deleting survey:', err);
      }
    }
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Submitted At', 'Monday Picks', 'Monday Unavailable', 'Monday Importance', 'Tuesday Picks', 'Tuesday Unavailable', 'Tuesday Importance', 'Wednesday Picks', 'Wednesday Unavailable', 'Wednesday Importance', 'Thursday Picks', 'Thursday Unavailable', 'Thursday Importance', 'Friday Picks', 'Friday Unavailable', 'Friday Importance'];
    const rows = surveys.map(survey => {
      const days = survey.days || [];
      return [
        survey.name,
        survey.submittedAt?.toDate?.().toLocaleString() || 'N/A',
        ...days.map((day: any) => [
          day.picks.map((p: any) => `${p.rank}. ${p.time}`).join('; ') || 'None',
          day.unavailable.join(', ') || 'None',
          JSON.stringify(day.importance || {})
        ]).flat()
      ];
    });

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `survey-responses-${new Date().toISOString()}.csv`;
    a.click();
  };

  const calculateResults = () => {
    const results: any = {};
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

    days.forEach(day => {
      results[day] = {
        '7:00 AM': 0,
        '10:00 AM': 0,
        '2:00 PM': 0,
        '5:00 PM': 0,
        '7:00 PM': 0
      };
    });

    surveys.forEach(survey => {
      (survey.days || []).forEach((dayData: any, dayIdx: number) => {
        const day = days[dayIdx];
        dayData.picks?.forEach((pick: any) => {
          const points = pick.rank === 1 ? 5 : pick.rank === 2 ? 3 : 1;
          results[day][pick.time] = (results[day][pick.time] || 0) + points;
        });
      });
    });

    return results;
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  if (!user) {
    return (
      <div style={{ maxWidth: '400px', margin: '60px auto', padding: '40px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ marginBottom: '30px', textAlign: 'center', fontSize: '24px' }}>Admin Login</h1>
        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}
        <form onSubmit={handleAuth}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', fontSize: '14px' }}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px', border: '1.5px solid #e2e8f0', borderRadius: '8px', fontSize: '14px' }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
          >
            {isSignup ? 'Sign Up' : 'Sign In'}
          </button>
          <button
            type="button"
            onClick={() => setIsSignup(!isSignup)}
            style={{
              width: '100%',
              padding: '12px',
              background: 'white',
              color: '#3b82f6',
              border: '1.5px solid #3b82f6',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {isSignup ? 'Have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </form>
      </div>
    );
  }

  const results = calculateResults();
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 20px', background: '#f8f9fb', minHeight: '100vh' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '5px' }}>Admin Dashboard</h1>
            <p style={{ color: '#64748b', fontSize: '14px' }}>Logged in as: {user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <button
            onClick={() => setView('responses')}
            style={{
              padding: '10px 20px',
              background: view === 'responses' ? '#3b82f6' : 'white',
              color: view === 'responses' ? 'white' : '#64748b',
              border: view === 'responses' ? 'none' : '1.5px solid #e2e8f0',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Individual Responses ({surveys.length})
          </button>
          <button
            onClick={() => setView('results')}
            style={{
              padding: '10px 20px',
              background: view === 'results' ? '#3b82f6' : 'white',
              color: view === 'results' ? 'white' : '#64748b',
              border: view === 'results' ? 'none' : '1.5px solid #e2e8f0',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Aggregated Results
          </button>
          <button
            onClick={downloadCSV}
            style={{
              padding: '10px 20px',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              marginLeft: 'auto'
            }}
          >
            Download CSV
          </button>
        </div>
      </div>

      {view === 'responses' && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '20px' }}>Individual Responses</h2>
          {surveys.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No survey responses yet</p>
          ) : (
            surveys.map((survey, idx) => (
              <div key={survey.id} style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '5px' }}>{survey.name}</h3>
                    <p style={{ color: '#64748b', fontSize: '13px' }}>Submitted: {survey.submittedAt?.toDate?.().toLocaleString() || 'N/A'}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSurvey(survey.id)}
                    style={{
                      padding: '6px 12px',
                      background: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
                {(survey.days || []).map((day: any, dayIdx: number) => (
                  <div key={dayIdx} style={{ marginLeft: '20px', marginBottom: '15px', paddingLeft: '15px', borderLeft: '3px solid #3b82f6' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>{days[dayIdx]}</h4>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                      <strong>Picks:</strong> {day.picks?.map((p: any) => `${p.rank}. ${p.time}`).join(', ') || 'None'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569', marginBottom: '6px' }}>
                      <strong>Unavailable:</strong> {day.unavailable?.join(', ') || 'None'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#475569' }}>
                      <strong>Importance:</strong> {Object.entries(day.importance || {}).map(([time, imp]: any) => `${time}: ${imp}/10`).join(', ') || 'None'}
                    </div>
                  </div>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {view === 'results' && (
        <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '30px' }}>Aggregated Results by Day</h2>
          {surveys.length === 0 ? (
            <p style={{ color: '#94a3b8', textAlign: 'center', padding: '40px' }}>No survey responses yet</p>
          ) : (
            days.map((day, idx) => {
              const dayResults = Object.entries(results[day])
                .map(([time, score]: any) => ({ time, score }))
                .sort((a, b) => b.score - a.score);
              
              return (
                <div key={day} style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '15px', color: '#1a1f36' }}>{day}</h3>
                  <div style={{ display: 'grid', gap: '10px' }}>
                    {dayResults.map((item: any) => (
                      <div key={item.time} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                        <span style={{ fontWeight: '600', color: '#1a1f36' }}>{item.time}</span>
                        <span style={{ background: '#3b82f6', color: 'white', padding: '6px 12px', borderRadius: '6px', fontWeight: '700', fontSize: '13px' }}>{item.score} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
