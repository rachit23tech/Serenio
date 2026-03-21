import { useState, useEffect } from 'react';
import { initSDK, getAccelerationMode } from './runanywhere';
import { ChatTab } from './components/ChatTab';
import { VisionTab } from './components/VisionTab';
import { VoiceTab } from './components/VoiceTab';
import { ToolsTab } from './components/ToolsTab';

type Tab = 'chat' | 'vision' | 'voice' | 'tools';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'chat',   label: 'Chat',   icon: '💬' },
  { id: 'vision', label: 'Vision', icon: '📷' },
  { id: 'voice',  label: 'Voice',  icon: '🎙️' },
  { id: 'tools',  label: 'Tools',  icon: '🔧' },
];

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#070b10] flex flex-col items-center justify-center gap-6 px-6">
      <div className="relative flex items-center justify-center w-20 h-20">
        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-500/20 animate-ping" />
        <div className="relative w-14 h-14 rounded-full border border-blue-500/30 bg-slate-800/80 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      </div>
      <div className="text-center">
        <h1 className="text-2xl font-extralight tracking-[0.3em] text-slate-200 uppercase mb-1">Serenio</h1>
        <p className="text-slate-500 text-xs tracking-widest uppercase">Initializing on-device AI…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-[#070b10] flex flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-900/30 border border-red-500/30 flex items-center justify-center mb-2">
        <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h2 className="text-slate-300 text-lg font-light tracking-wide">SDK failed to load</h2>
      <p className="text-red-400/80 text-sm font-light max-w-xs leading-relaxed">{message}</p>
    </div>
  );
}

export function App() {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('chat');

  useEffect(() => {
    initSDK()
      .then(() => setSdkReady(true))
      .catch((err) => setSdkError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (sdkError) return <ErrorScreen message={sdkError} />;
  if (!sdkReady) return <LoadingScreen />;

  const accel = getAccelerationMode();

  return (
    <div className="min-h-screen bg-[#070b10] flex flex-col">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-blue-900/10 blur-[100px]" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[250px] rounded-full bg-indigo-900/10 blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-8 pb-3">
        <div>
          <h1 className="text-xl font-extralight tracking-[0.3em] text-slate-200 uppercase">Serenio</h1>
          <p className="text-slate-600 text-[10px] tracking-widest uppercase mt-0.5">your calm companion</p>
        </div>
        {accel && (
          <span className={`text-[10px] tracking-widest uppercase px-3 py-1.5 rounded-full border font-light
            ${accel === 'webgpu'
              ? 'text-teal-400 border-teal-500/30 bg-teal-900/20'
              : 'text-slate-400 border-slate-600/40 bg-slate-800/40'
            }`}>
            {accel === 'webgpu' ? '⚡ WebGPU' : '🖥 CPU'}
          </span>
        )}
      </header>

      {/* Tab bar */}
      <nav className="relative z-10 flex items-center gap-1 mx-6 mb-4 p-1 rounded-2xl bg-slate-900/60 border border-slate-800/60 backdrop-blur-sm">
        {TABS.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-light tracking-widest uppercase transition-all duration-300 cursor-pointer
              ${activeTab === id
                ? 'bg-slate-700/80 text-slate-100 shadow-lg border border-slate-600/40'
                : 'text-slate-600 hover:text-slate-400 hover:bg-slate-800/40'
              }`}
          >
            <span className="text-base leading-none">{icon}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <main className="relative z-10 flex-1 mx-6 mb-6 rounded-2xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm overflow-hidden">
        {activeTab === 'chat'   && <ChatTab />}
        {activeTab === 'vision' && <VisionTab />}
        {activeTab === 'voice'  && <VoiceTab />}
        {activeTab === 'tools'  && <ToolsTab />}
      </main>
    </div>
  );
}