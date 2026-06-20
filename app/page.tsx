'use client';

import React, { useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

type RankingItem = {
  time: string;
  rank: number;
};

type DayData = {
  rankings: RankingItem[];
  unavailable: boolean[];
  importance: { [key: string]: number };
};

export default function SurveyPage() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [progress, setProgress] = useState(20);
  const [draggedItem, setDraggedItem] = useState<RankingItem | null>(null);
  const [currentDay, setCurrentDay] = useState(0);

  const times = ['7:00 AM', '10:00 AM', '2:00 PM', '5:00 PM', '7:00 PM'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const dayColors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  const [dayData, setDayData] = useState<DayData[]>(
    Array(5).fill(null).map(() => ({
      rankings: [],
      unavailable: [false, false, false, false, false],
      importance: {}
    }))
  );

  const [reviewData, setReviewData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNameSubmit = () => {
    if (name.trim()) {
      setStep(2);
      setProgress(40);
    }
  };

  const goToStep = (newStep: number) => {
    setStep(newStep);
    const percentages = [0, 20, 40, 80, 100];
    setProgress(percentages[newStep - 1]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTime = (dayIndex: number, timeIndex: number) => {
    const newData = [...dayData];
    const time = times[timeIndex];
    
    if (newData[dayIndex].unavailable[timeIndex]) return;
    
    const existingIndex = newData[dayIndex].rankings.findIndex(r => r.time === time);
    if (existingIndex > -1) {
      newData[dayIndex].rankings.splice(existingIndex, 1);
      newData[dayIndex].rankings = newData[dayIndex].rankings.map((r, i) => ({
        ...r,
        rank: i + 1
      }));
    } else {
      newData[dayIndex].rankings.push({
        time,
        rank: newData[dayIndex].rankings.length + 1
      });
    }
    
    setDayData(newData);
  };

  const toggleUnavailable = (dayIndex: number, timeIndex: number) => {
    const newData = [...dayData];
    newData[dayIndex].unavailable[timeIndex] = !newData[dayIndex].unavailable[timeIndex];
    
    if (newData[dayIndex].unavailable[timeIndex]) {
      const time = times[timeIndex];
      newData[dayIndex].rankings = newData[dayIndex].rankings.filter(r => r.time !== time);
      newData[dayIndex].rankings = newData[dayIndex].rankings.map((r, i) => ({
        ...r,
        rank: i + 1
      }));
    }
    
    setDayData(newData);
  };

  const isTimeSelected = (dayIndex: number, timeIndex: number) => {
    return dayData[dayIndex].rankings.some(r => r.time === times[timeIndex]);
  };

  const handleDragStart = (item: RankingItem) => {
    setDraggedItem(item);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dayIndex: number, dropRank: number) => {
    e.preventDefault();
    if (!draggedItem) return;

    const newData = [...dayData];
    const draggedIndex = newData[dayIndex].rankings.findIndex(r => r.time === draggedItem.time);
    
    if (draggedIndex === -1) return;

    const [removed] = newData[dayIndex].rankings.splice(draggedIndex, 1);
    newData[dayIndex].rankings.splice(dropRank - 1, 0, removed);
    newData[dayIndex].rankings = newData[dayIndex].rankings.map((r, i) => ({
      ...r,
      rank: i + 1
    }));

    setDayData(newData);
    setDraggedItem(null);
  };

  const handleImportanceChange = (dayIndex: number, time: string, value: number) => {
    const newData = [...dayData];
    newData[dayIndex].importance[time] = value;
    setDayData(newData);
  };

  const goToReview = () => {
    const review = days.map((day, dayIndex) => ({
      day,
      picks: dayData[dayIndex].rankings,
      unavailable: times.filter((_, i) => dayData[dayIndex].unavailable[i]),
      importance: dayData[dayIndex].importance
    }));
    setReviewData(review);
    goToStep(3);
  };

  const submitSurvey = async () => {
    setLoading(true);
    setError('');
    try {
      const surveyData = {
        name,
        submittedAt: serverTimestamp(),
        days: days.map((day, dayIndex) => ({
          day,
          picks: dayData[dayIndex].rankings,
          unavailable: times.filter((_, i) => dayData[dayIndex].unavailable[i]),
          importance: dayData[dayIndex].importance
        }))
      };

      await addDoc(collection(db, 'surveys'), surveyData);
      goToStep(4);
    } catch (err) {
      setError('Failed to submit survey. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div suppressHydrationWarning style={{ margin: 0, padding: 0, backgroundColor: '#f8f9fb', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        .container { max-width: 820px; margin: 0 auto; background: white; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07), 0 10px 20px rgba(0, 0, 0, 0.05); overflow: hidden; }
        .header { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: white; padding: 50px 40px; text-align: center; }
        .header h1 { font-size: 32px; margin-bottom: 8px; font-weight: 700; }
        .header p { font-size: 15px; opacity: 0.85; max-width: 500px; margin: 0 auto; line-height: 1.6; }
        .progress-bar { margin-top: 24px; height: 3px; background: rgba(255, 255, 255, 0.2); border-radius: 2px; overflow: hidden; }
        .progress-fill { height: 100%; background: white; transition: width 0.4s ease; }
        .content { padding: 50px 40px; }
        .step { display: none; }
        .step.active { display: block; }
        .step-title { font-size: 26px; color: #1a1f36; margin-bottom: 8px; font-weight: 700; }
        .step-subtitle { font-size: 14px; color: #64748b; margin-bottom: 32px; }
        .form-group { margin-bottom: 28px; }
        .form-group label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 10px; text-transform: uppercase; }
        .form-group input { width: 100%; padding: 14px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; font-size: 15px; background: #f8fafc; }
        .day-tabs { display: flex; gap: 8px; margin-bottom: 40px; flex-wrap: wrap; }
        .day-tab { padding: 10px 20px; border: 1.5px solid #e2e8f0; background: white; color: #64748b; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 10px; }
        .day-tab.active { color: white; border-color: #3b82f6; background: #3b82f6; }
        .day-content { display: none; }
        .day-content.active { display: block; }
        .section-header { font-size: 13px; font-weight: 700; color: #475569; text-transform: uppercase; margin: 32px 0 16px 0; }
        .time-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 28px; }
        .time-slot { padding: 18px 16px; border: 1.5px solid #e2e8f0; border-radius: 10px; text-align: center; cursor: pointer; background: white; }
        .time-slot.unavailable { opacity: 0.4; cursor: not-allowed; background: #f1f5f9; }
        .time-slot.selected { border-color: #3b82f6; background: #eff6ff; }
        .time-slot-time { font-size: 15px; font-weight: 700; color: #1a1f36; margin-bottom: 4px; }
        .time-slot-label { font-size: 12px; color: #94a3b8; }
        .unavailable-section { background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 28px; border: 1.5px solid #e2e8f0; }
        .unavailable-section h3 { font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 14px; }
        .checkbox-group { display: flex; flex-wrap: wrap; gap: 14px; }
        .checkbox-item { display: flex; align-items: center; gap: 8px; cursor: pointer; }
        .checkbox-item input { cursor: pointer; width: 18px; height: 18px; }
        .checkbox-item label { cursor: pointer; font-size: 14px; color: #475569; margin: 0; font-weight: 500; }
        .ranking-list { display: flex; flex-direction: column; gap: 10px; min-height: 80px; padding: 12px; background: #f8fafc; border-radius: 10px; border: 2px dashed #cbd5e1; }
        .ranking-item { padding: 14px 16px; background: white; border-radius: 8px; display: flex; align-items: center; gap: 14px; cursor: grab; border: 1.5px solid #e2e8f0; }
        .ranking-rank { min-width: 32px; height: 32px; border-radius: 8px; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; }
        .drag-handle { color: #cbd5e1; font-size: 16px; }
        .ranking-time { flex: 1; font-size: 14px; color: #1a1f36; font-weight: 600; }
        .empty-state { padding: 30px; text-align: center; color: #94a3b8; font-size: 13px; }
        .importance-section { background: #f8fafc; padding: 20px; border-radius: 10px; margin-bottom: 28px; border: 1.5px solid #e2e8f0; }
        .importance-section h3 { font-size: 13px; font-weight: 700; color: #475569; margin-bottom: 18px; }
        .importance-item { margin-bottom: 16px; padding: 14px; background: white; border-radius: 8px; border: 1.5px solid #e2e8f0; }
        .importance-label { font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 10px; display: flex; justify-content: space-between; }
        .importance-value { color: #3b82f6; font-weight: 700; }
        .slider { width: 100%; height: 6px; border-radius: 3px; background: #e2e8f0; }
        .review-card { background: white; border: 1.5px solid #e2e8f0; border-radius: 10px; padding: 0; margin-bottom: 18px; overflow: hidden; }
        .review-day-header { font-size: 14px; font-weight: 700; color: white; padding: 16px 20px; }
        .review-content { padding: 20px; }
        .review-picks { margin-bottom: 14px; }
        .review-pick { display: flex; align-items: flex-start; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
        .pick-rank { min-width: 28px; height: 28px; border-radius: 6px; background: #3b82f6; color: white; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; }
        .pick-time { font-size: 14px; font-weight: 600; color: #1a1f36; margin-bottom: 2px; }
        .pick-importance { font-size: 12px; color: #94a3b8; }
        .review-unavailable { background: #f1f5f9; padding: 12px; border-radius: 6px; font-size: 13px; color: #475569; border-left: 3px solid #64748b; }
        .button-group { display: flex; gap: 12px; justify-content: space-between; flex-wrap: wrap; margin-top: 40px; }
        button { padding: 12px 28px; border: none; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; }
        .btn-primary { background: #3b82f6; color: white; flex: 1; min-width: 150px; }
        .btn-secondary { background: white; color: #475569; border: 1.5px solid #e2e8f0; flex: 1; min-width: 150px; }
        .success-state { text-align: center; padding: 80px 40px 60px; }
        .success-icon { font-size: 80px; margin-bottom: 24px; }
        .success-state h2 { font-size: 28px; color: #1a1f36; margin-bottom: 8px; font-weight: 700; }
        .success-state p { font-size: 14px; color: #64748b; margin-bottom: 10px; }
        .error { background: #fee2e2; color: #dc2626; padding: 12px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>Practice Schedule Survey</h1>
          <p>Help us find the best times for team practice this summer</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="content">
          <div className={`step ${step === 1 ? 'active' : ''}`}>
            <h2 className="step-title">Welcome</h2>
            <p className="step-subtitle">Let's get your name first, then we'll find the best practice times for you.</p>
            <div className="form-group">
              <label htmlFor="athleteName">Your Name</label>
              <input
                type="text"
                id="athleteName"
                placeholder="Enter your full name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleNameSubmit()}
              />
            </div>
            <div className="button-group">
              <button className="btn-primary" onClick={handleNameSubmit}>Start Survey</button>
            </div>
          </div>

          <div className={`step ${step === 2 ? 'active' : ''}`}>
            <h2 className="step-title">Your Preferences</h2>
            <p className="step-subtitle">For each day, select the times that work for you and rank them by preference.</p>
            
            <div className="day-tabs">
              {days.map((day, idx) => (
                <button
                  key={idx}
                  className={`day-tab ${currentDay === idx ? 'active' : ''}`}
                  onClick={() => setCurrentDay(idx)}
                >
                  {day}
                </button>
              ))}
            </div>

            {days.map((day, dayIndex) => (
              <div key={dayIndex} className={`day-content ${currentDay === dayIndex ? 'active' : ''}`}>
                <div className="section-header">Available Times</div>
                <div className="time-grid">
                  {times.map((time, timeIndex) => (
                    <div
                      key={timeIndex}
                      className={`time-slot ${isTimeSelected(dayIndex, timeIndex) ? 'selected' : ''} ${dayData[dayIndex].unavailable[timeIndex] ? 'unavailable' : ''}`}
                      onClick={() => !dayData[dayIndex].unavailable[timeIndex] && toggleTime(dayIndex, timeIndex)}
                    >
                      <div className="time-slot-time">{time}</div>
                      <div className="time-slot-label">
                        {time.includes('7:00 AM') ? 'Morning' : time.includes('10:00') ? 'Mid-Morning' : time.includes('2:00') ? 'Afternoon' : time.includes('5:00') ? 'Evening' : 'Late Evening'}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="unavailable-section">
                  <h3>Times You're NOT Available</h3>
                  <div className="checkbox-group">
                    {times.map((time, timeIndex) => (
                      <div key={timeIndex} className="checkbox-item">
                        <input
                          type="checkbox"
                          id={`unavail${dayIndex}-${timeIndex}`}
                          checked={dayData[dayIndex].unavailable[timeIndex]}
                          onChange={() => toggleUnavailable(dayIndex, timeIndex)}
                        />
                        <label htmlFor={`unavail${dayIndex}-${timeIndex}`}>{time}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="section-header">Rank Your Preferences</div>
                <div className="ranking-list" onDragOver={handleDragOver} onDrop={(e) => e.preventDefault()}>
                  {dayData[dayIndex].rankings.length === 0 ? (
                    <div className="empty-state">Select times above to rank them here</div>
                  ) : (
                    dayData[dayIndex].rankings.map((item, idx) => (
                      <div
                        key={idx}
                        className="ranking-item"
                        draggable
                        onDragStart={() => handleDragStart(item)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, dayIndex, idx + 1)}
                      >
                        <span className="drag-handle">⋮⋮</span>
                        <div className="ranking-rank">{item.rank}</div>
                        <div className="ranking-time">{item.time}</div>
                      </div>
                    ))
                  )}
                </div>

                {dayData[dayIndex].rankings.length > 1 && (
                  <div className="importance-section">
                    <h3>How Important is Each Time?</h3>
                    {dayData[dayIndex].rankings.map((rankedItem) => (
                      <div key={rankedItem.time} className="importance-item">
                        <div className="importance-label">
                          <span>{rankedItem.time}</span>
                          <span className="importance-value">{dayData[dayIndex].importance[rankedItem.time] || 5}/10</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={dayData[dayIndex].importance[rankedItem.time] || 5}
                          className="slider"
                          onChange={(e) => handleImportanceChange(dayIndex, rankedItem.time, parseInt(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="button-group">
              <button className="btn-secondary" onClick={() => goToStep(1)}>Back</button>
              <button className="btn-primary" onClick={goToReview}>Review Answers</button>
            </div>
          </div>

          <div className={`step ${step === 3 ? 'active' : ''}`}>
            <h2 className="step-title">Review Your Answers</h2>
            <p className="step-subtitle">Make sure everything looks good before you submit.</p>
            
            {reviewData && reviewData.map((dayReview: any, idx: number) => (
              <div key={idx} className="review-card">
                <div className="review-day-header" style={{ background: dayColors[idx] }}>{dayReview.day}</div>
                <div className="review-content">
                  <div className="review-picks">
                    {dayReview.picks.map((pick: any, pidx: number) => (
                      <div key={pidx} className="review-pick">
                        <div className="pick-rank">{pick.rank}</div>
                        <div>
                          <div className="pick-time">{pick.time}</div>
                          <div className="pick-importance">Importance: {dayData[idx].importance[pick.time] || 5}/10</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {dayReview.unavailable.length > 0 && (
                    <div className="review-unavailable">Unavailable: {dayReview.unavailable.join(', ')}</div>
                  )}
                </div>
              </div>
            ))}

            {error && <div className="error">{error}</div>}

            <div className="button-group">
              <button className="btn-secondary" onClick={() => goToStep(2)}>Back</button>
              <button className="btn-primary" onClick={submitSurvey} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Survey'}
              </button>
            </div>
          </div>

          <div className={`step ${step === 4 ? 'active' : ''}`}>
            <div className="success-state">
              <div className="success-icon">✅</div>
              <h2>Perfect!</h2>
              <p>Your survey has been submitted successfully.</p>
              <p>Thank you for helping us schedule the best practice times for the team.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
