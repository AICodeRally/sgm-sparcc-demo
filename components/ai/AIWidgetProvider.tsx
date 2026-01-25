'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AIWidgetState {
  opsChiefOpen: boolean;
  askItemOpen: boolean;
  appChatbotOpen: boolean;
}

interface AIWidgetContextValue {
  state: AIWidgetState;
  toggleOpsChief: () => void;
  toggleAskItem: () => void;
  toggleAppChatbot: () => void;
  closeAll: () => void;
}

const AIWidgetContext = createContext<AIWidgetContextValue | undefined>(undefined);

export function AIWidgetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AIWidgetState>({
    opsChiefOpen: false,
    askItemOpen: false,
    appChatbotOpen: false,
  });

  const toggleOpsChief = () => {
    setState(s => ({ ...s, opsChiefOpen: !s.opsChiefOpen }));
  };

  const toggleAskItem = () => {
    setState(s => ({ ...s, askItemOpen: !s.askItemOpen }));
  };

  const toggleAppChatbot = () => {
    setState(s => ({ ...s, appChatbotOpen: !s.appChatbotOpen }));
  };

  const closeAll = () => {
    setState({
      opsChiefOpen: false,
      askItemOpen: false,
      appChatbotOpen: false,
    });
  };

  return (
    <AIWidgetContext.Provider
      value={{
        state,
        toggleOpsChief,
        toggleAskItem,
        toggleAppChatbot,
        closeAll,
      }}
    >
      {children}
    </AIWidgetContext.Provider>
  );
}

export function useAIWidgets() {
  const context = useContext(AIWidgetContext);
  if (!context) {
    throw new Error('useAIWidgets must be used within AIWidgetProvider');
  }
  return context;
}
