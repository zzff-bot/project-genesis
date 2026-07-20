import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, User, Bot, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { toast } from '@/stores/toastStore';
import { api, type ConversationData, type MessageData } from '@/shared/services/api';

const PAGE = 20;

export default function AdminConversationsPage() {
  const [convs, setConvs] = useState<ConversationData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [msgLoading, setMsgLoading] = useState(false);

  const load = async (p = 0) => {
    setLoading(true);
    try { const d = await api.adminAllConversations(PAGE, p * PAGE); setConvs(d.conversations); setTotal(d.total); }
    catch (err: any) { toast.error('加载失败', err.message); }
    finally { setLoading(false); }
  };

  const toggleExpand = async (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id); setMsgLoading(true);
    try {
      const d = await api.adminConversationMessages(id);
      setMessages(d.messages);
    } catch (err: any) { toast.error('加载消息失败', err.message); }
    finally { setMsgLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const fmt = (ts: number) => new Date(ts).toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
  const totalPages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">对话记录</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">共 {total} 个对话</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rectangular" className="w-full h-14 rounded-lg" />)}</div>
        ) : convs.length === 0 ? (
          <EmptyState icon={<MessageSquare size={40} />} title="暂无对话" />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[var(--color-text-tertiary)] border-b border-[var(--color-border)]">
                  <th className="py-3 px-5 font-medium w-8"></th>
                  <th className="py-3 px-5 font-medium">标题</th>
                  <th className="py-3 px-5 font-medium hidden md:table-cell"><User size={12} className="inline mr-1" />用户</th>
                  <th className="py-3 px-5 font-medium">消息数</th>
                  <th className="py-3 px-5 font-medium hidden lg:table-cell">时间</th>
                </tr>
              </thead>
              <tbody>
                {convs.map((c) => (
                  <>
                    <tr key={c.id}
                      onClick={() => toggleExpand(c.id)}
                      className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-secondary)]/50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-5 text-[var(--color-text-tertiary)]">{expanded === c.id ? '▾' : '▸'}</td>
                      <td className="py-3 px-5"><span className="text-sm text-[var(--color-text)]">{c.title || '(无标题)'}</span></td>
                      <td className="py-3 px-5 text-sm text-[var(--color-text-secondary)] hidden md:table-cell">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[10px] font-medium">{c.username?.[0]?.toUpperCase()}</div>
                          <span>{c.username}</span>
                        </div>
                      </td>
                      <td className="py-3 px-5 text-sm text-[var(--color-text-secondary)] tabular-nums">{c.messageCount}</td>
                      <td className="py-3 px-5 text-xs text-[var(--color-text-tertiary)] hidden lg:table-cell whitespace-nowrap">{fmt(c.updated_at)}</td>
                    </tr>
                    <AnimatePresence>
                      {expanded === c.id && (
                        <tr key={`msg-${c.id}`}>
                          <td colSpan={6} className="p-0">
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[var(--color-bg-secondary)]/20 border-b border-[var(--color-border)]/50">
                              <div className="p-4 max-h-96 overflow-y-auto space-y-3">
                                {msgLoading ? <Skeleton variant="text" className="w-full h-20" /> :
                                  messages.map((m) => (
                                    <div key={m.id} className={`flex gap-2 text-sm ${m.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                                      <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${m.role === 'assistant' ? 'bg-blue-500/10 text-blue-500' : 'bg-green-500/10 text-green-500'}`}>
                                        {m.role === 'assistant' ? <Bot size={12} /> : <User size={12} />}
                                      </div>
                                      <div className={`max-w-[70%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role === 'assistant' ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text)]' : 'bg-[var(--color-text)]/10 text-[var(--color-text)]'}`}>
                                        <p className="whitespace-pre-wrap break-words">{m.content}</p>
                                        <span className="text-[10px] text-[var(--color-text-tertiary)] mt-1 block">{fmt(m.timestamp)}</span>
                                      </div>
                                    </div>
                                  ))
                                }
                              </div>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </>
                ))}
              </tbody>
            </table>
            {total > PAGE && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
                <span className="text-xs text-[var(--color-text-tertiary)]">第 {page + 1} / {totalPages} 页</span>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" iconOnly onClick={() => { setPage(page - 1); load(page - 1); }} disabled={page === 0}><ChevronLeft size={16} /></Button>
                  <Button variant="ghost" size="sm" iconOnly onClick={() => { setPage(page + 1); load(page + 1); }} disabled={page >= totalPages - 1}><ChevronRight size={16} /></Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
