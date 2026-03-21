import { useState, useEffect } from 'react';
import { initSDK, getAccelerationMode } from './runanywhere';
import { ChatTab } from './components/ChatTab';
import { VoiceTab } from './components/VoiceTab';

type Tab = 'voice' | 'chat' | 'mood' | 'history';

export function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('voice');

  useEffect(() => {
    console.log('🚀 Initializing SDK...');
    initSDK()
      .then(() => {
        console.log('✅ SDK Ready!');
        setSdkReady(true);
      })
      .catch((err) => {
        console.error('❌ SDK Error:', err);
        setSdkError(err instanceof Error ? err.message : String(err));
      });
  }, []);

  if (sdkError) {
    return (
      <div className="app-loading">
        <h2>SDK Error</h2>
        <p className="error-text">{sdkError}</p>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <h2>Loading Serenio...</h2>
        <p>Initializing AI engine</p>
      </div>
    );
  }

  const accel = getAccelerationMode();

  return (
    <div className="app">
      <header className="app-header">
        <h1>SERENIO</h1>
        {accel && <span className="badge">{accel === 'webgpu' ? 'WebGPU' : 'CPU'}</span>}
      </header>

      <nav className="tab-bar">
        <button
          className={activeTab === 'voice' ? 'active' : ''}
          onClick={() => setActiveTab('voice')}
        >
          🎙️ Voice
        </button>
        <button
          className={activeTab === 'chat' ? 'active' : ''}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button
          className={activeTab === 'mood' ? 'active' : ''}
          onClick={() => setActiveTab('mood')}
        >
          😊 Mood
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
        >
          📖 History
        </button>
      </nav>

      <main className="tab-content">
        {activeTab === 'voice' && <VoiceTab />}
        {activeTab === 'chat' && <ChatTab />}
        {activeTab === 'mood' && (
          <div className="tab-panel">
            <div className="empty-state">
              <h3>😊 Mood Check</h3>
              <p>Coming soon — Person C is building this!</p>
            </div>
          </div>
        )}
        {activeTab === 'history' && (
          <div className="tab-panel">
            <div className="empty-state">
              <h3>📖 Your Journal</h3>
              <p>Coming soon — Person C is building this!</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}