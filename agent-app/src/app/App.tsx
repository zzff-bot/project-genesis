import { lazy } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AgentProvider } from '@/contexts/AgentContext';
import { useTheme } from '@/shared/hooks/useTheme';
import { AppShell } from '@/shared/layout';
import { CommandPalette } from '@/shared/layout/CommandPalette';
import { ToastContainer } from '@/shared/ui';
import { LandingPage } from '@/features/landing';
import { DashboardPage } from '@/features/dashboard';
import { AgentMarketplacePage, AgentCreatePage } from '@/features/agents';
import { SettingsPage } from '@/features/settings';
import { ChatPage } from '@/features/chat';
import { ConversationsPage } from '@/features/conversations';

const DesignSystemPage = lazy(() =>
  import('@/features/design-system').then((m) => ({ default: m.DesignSystemPage })),
);

function ThemeSync() {
  useTheme();
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <AgentProvider>
        <ThemeSync />
        <CommandPalette />
        <ToastContainer />
        <Routes>
          {/* 首页界面 — 全屏，无侧栏 */}
          <Route path="/" element={<LandingPage />} />

          {/* 主页界面 + 所有功能页 — 带侧栏 AppShell */}
          <Route path="/*" element={
            <AppShell>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/agents" element={<AgentMarketplacePage />} />
                <Route path="/agents/create" element={<AgentCreatePage />} />
                <Route path="/agents/:agentId/edit" element={<AgentCreatePage />} />
                <Route path="/chat/:agentId" element={<ChatPage />} />
                <Route path="/chat/:agentId/:conversationId" element={<ChatPage />} />
                <Route path="/conversations" element={<ConversationsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/prompts" element={<PlaceholderPage title="提示词库" emoji="📝" description="精心编排的提示词模板，让你的 AI 对话更高效" />} />
                <Route path="/knowledge" element={<PlaceholderPage title="知识库" emoji="📖" description="构建你的专属知识体系，让智能体更懂你" />} />
                <Route path="/workflows" element={<PlaceholderPage title="工作流" emoji="⚡" description="自动化你的创意流程，释放更多可能性" />} />
                <Route path="/design-system" element={<DesignSystemPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </AppShell>
          } />
        </Routes>
      </AgentProvider>
    </HashRouter>
  );
}

function PlaceholderPage({ title, emoji, description }: { title: string; emoji: string; description: string }) {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="text-center py-16 px-8">
        <div className="text-5xl mb-6 select-none">{emoji}</div>
        <h2 className="text-xl font-medium mb-2 tracking-tight text-[var(--color-text)]">{title}</h2>
        <p className="text-sm max-w-xs mx-auto leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
        <div className="mt-8 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs bg-[var(--color-bg-secondary)] text-[var(--color-text-tertiary)]">即将推出</div>
      </div>
    </div>
  );
}
