import React from 'react';
import './IdleScreen.css';

const IdleScreen = ({ onWakeUp }) => {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="idle-screen" onClick={onWakeUp}>
      <div className="idle-content">
        <div className="clock">{currentTime}</div>
        <div className="date">{currentDate}</div>
        <div className="tap-message">
          <p>Tap anywhere to continue</p>
        </div>
        <div className="logo">
          <h1>ISAH ELECTRONICS</h1>
        </div>
      </div>
    </div>
  );
};

export default IdleScreen;