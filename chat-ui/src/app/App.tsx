import { BotMessageSquare } from 'lucide-react';

import { ChatWindow } from '../features/chat/components/ChatWindow';

export function App() {
  return (
    <main className="app-shell">
      <header className="app-header">
        <span className="app-logo" aria-hidden="true">
          <BotMessageSquare size={22} />
        </span>
        <span>Health Assistant</span>
      </header>
      <ChatWindow />
    </main>
  );
}
