import { useEffect, useState } from 'react';
import { Bot, User, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { toast } from '@/stores/toastStore';
import { api, type AgentData } from '@/shared/services/api';

const PAGE = 20;

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async (p = 0) => {
    setLoading(true);
    try { const d = await api.adminAllAgents(PAGE, p * PAGE); setAgents(d.agents); setTotal(d.total); }
    catch (err: any) { toast.error('加载失败', err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const fmt = (ts: number) => ts ? new Date(ts).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
  const totalPages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">智能体管理</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">共 {total} 个智能体</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rectangular" className="w-full h-14 rounded-lg" />)}</div>
        ) : agents.length === 0 ? (
          <EmptyState icon={<Bot size={40} />} title="暂无智能体" />
        ) : (
          <>
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-[var(--color-text-tertiary)] border-b border-[var(--color-border)]">
                  <th className="py-3 px-5 font-medium">#</th>
                  <th className="py-3 px-5 font-medium">名称</th>
                  <th className="py-3 px-5 font-medium hidden md:table-cell"><User size={12} className="inline mr-1" />创建者</th>
                  <th className="py-3 px-5 font-medium">模式</th>
                  <th className="py-3 px-5 font-medium hidden lg:table-cell"><Calendar size={12} className="inline mr-1" />创建时间</th>
                </tr>
              </thead>
              <tbody>
                {agents.map((a, idx) => (
                  <tr key={a.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                    <td className="py-3 px-5 text-sm text-[var(--color-text-tertiary)] tabular-nums">{page * PAGE + idx + 1}</td>
                    <td className="py-3 px-5"><span className="text-sm font-medium text-[var(--color-text)]">{a.name}</span></td>
                    <td className="py-3 px-5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                        <div className="w-5 h-5 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[10px] font-medium">{a.username?.[0]?.toUpperCase()}</div>
                        <span>{a.username}</span>
                      </div>
                    </td>
                    <td className="py-3 px-5"><Badge variant={a.config?.mode === 'character' ? 'primary' : 'outline'} size="sm">{a.config?.mode === 'character' ? 'Character' : 'Expert'}</Badge></td>
                    <td className="py-3 px-5 text-sm text-[var(--color-text-tertiary)] hidden lg:table-cell whitespace-nowrap">{fmt(a.created_at)}</td>
                  </tr>
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
