'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface AIWidgetState {
  orgChiefOpen: boolean;
  askDockOpen: boolean;
  appChatbotOpen: boolean;
}

interface AIWidgetContextValue {
  state: AIWidgetState;
  toggleOrgChief: () => void;
  toggleAskDock: () => void;
  toggleAppChatbot: () => void;
  closeAll: () => void;
}

const AIWidgetContext = createContext<AIWidgetContextValue | undefined>(undefined);

export function AIWidgetProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AIWidgetState>({
    orgChiefOpen: false,
    askDockOpen: false,
    appChatbotOpen: false,
  });

  const toggleOrgChief = () => {
    setState(s => ({ ...s, orgChiefOpen: !s.orgChiefOpen }));
  };

  const toggleAskDock = () => {
    setState(s => ({ ...s, askDockOpen: !s.askDockOpen }));
  };

  const toggleAppChatbot = () => {
    setState(s => ({ ...s, appChatbotOpen: !s.appChatbotOpen }));
  };

  const closeAll = () => {
    setState({
      orgChiefOpen: false,
      askDockOpen: false,
      appChatbotOpen: false,
    });
  };

  return (
    <AIWidgetContext.Provider
      value={{
        state,
        toggleOrgChief,
        toggleAskDock,
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
