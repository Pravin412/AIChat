import { BotMessageSquare } from 'lucide-react';

import { ChatWindow } from '../features/chat/components/ChatWindow';
import '../features/chat/chat.css';
import '../features/chat/composer.css';
import '../features/chat/markdown.css';

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
