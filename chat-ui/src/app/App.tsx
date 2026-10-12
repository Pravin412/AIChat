import { HeartPulse } from 'lucide-react';

import { ChatWindow } from '../features/chat/components/ChatWindow';
import '../features/chat/chat.css';
import '../features/chat/composer.css';
import '../features/chat/markdown.css';

export function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <HeartPulse size={24} aria-hidden="true" />
        <span>Health Assistant</span>
      </header>
      <ChatWindow />
    </main>
  );
}
