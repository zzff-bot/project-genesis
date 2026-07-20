import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye, EyeOff, Bot, MessageSquare, ChevronLeft, ChevronRight, Trash2, Snowflake, Unlock } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { Modal } from '@/shared/ui/Modal';
import { toast } from '@/stores/toastStore';
import { api, type User, type AdminUserDetail } from '@/shared/services/api';

const PAGE = 20;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const loadUsers = async (p = 0) => {
    setLoading(true);
    try { const d = await api.adminUsers(PAGE, p * PAGE); setUsers(d.users); setTotal(d.total); }
    catch (e: any) { toast.error('加载失败', e.message); }
    finally { setLoading(false); }
  };

  const toggleDetail = async (uid: string) => {
    if (selected === uid) { setSelected(null); setDetail(null); return; }
    setSelected(uid); setDetail(null); setDetailLoading(true); setShowPw(false);
    try { const d = await api.adminUserDetail(uid); setDetail(d); }
    catch (e: any) { toast.error('加载详情失败', e.message); }
    finally { setDetailLoading(false); }
  };

  const toggleStatus = async (uid: string, cur: string) => {
    const next = cur === 'active' ? 'frozen' : 'active';
    try { await api.adminUpdateStatus(uid, next); toast.success(next === 'frozen' ? '已冻结' : '已解冻'); loadUsers(page); }
    catch (e: any) { toast.error('操作失败', e.message); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await api.adminDeleteUser(deleteTarget.id); toast.success('已注销账户'); setDeleteTarget(null); loadUsers(page); setSelected(null); setDetail(null); }
    catch (e: any) { toast.error('注销失败', e.message); }
  };

  useEffect(() => { loadUsers(); }, []);

  const fmt = (ts: number) => ts ? new Date(ts).toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—';
  const dur = (ms: number) => { const m = Math.floor(ms / 60000); return m < 1 ? '<1m' : m > 60 ? `${Math.floor(m / 60)}h${m % 60}m` : `${m}m`; };
  const tp = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="px-6 py-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--color-text)]">用户管理</h1>
        <p className="text-sm text-[var(--color-text-secondary)] mt-1">共 {total} 个注册用户</p>
      </div>

      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} variant="rectangular" className="w-full h-14 rounded-lg" />)}</div>
        ) : users.length === 0 ? (
          <EmptyState icon={<Users size={40} />} title="暂无用户" />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-[var(--color-text-tertiary)] border-b border-[var(--color-border)]">
                <th className="py-3 px-4 font-medium w-8"></th>
                <th className="py-3 px-4 font-medium">用户</th>
                <th className="py-3 px-4 font-medium hidden lg:table-cell">邮箱</th>
                <th className="py-3 px-4 font-medium">状态</th>
                <th className="py-3 px-4 font-medium hidden md:table-cell">注册时间</th>
                <th className="py-3 px-4 font-medium w-24">操作</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <>
                  <tr key={u.id} className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-secondary)]/50 transition-colors">
                    <td className="py-3 px-4 cursor-pointer" onClick={() => toggleDetail(u.id)}>
                      <span className="text-[var(--color-text-tertiary)] text-sm">{selected === u.id ? '▾' : '▸'}</span>
                    </td>
                    <td className="py-3 px-4 cursor-pointer" onClick={() => toggleDetail(u.id)}>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-xs font-medium">{u.username.charAt(0).toUpperCase()}</div>
                        <span className="text-sm font-medium text-[var(--color-text)]">{u.username}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--color-text-secondary)] hidden lg:table-cell">{u.email}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.status === 'active' ? 'primary' : 'outline'} size="sm">
                        {u.status === 'active' ? '正常' : '已冻结'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--color-text-tertiary)] hidden md:table-cell whitespace-nowrap">{fmt(u.created_at)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="sm" iconOnly onClick={() => toggleStatus(u.id, u.status)} title={u.status === 'active' ? '冻结' : '解冻'}>
                          {u.status === 'active' ? <Snowflake size={14} /> : <Unlock size={14} />}
                        </Button>
                        {u.role !== 'admin' && (
                          <Button variant="ghost" size="sm" iconOnly onClick={() => setDeleteTarget(u)} title="注销账户">
                            <Trash2 size={14} className="text-red-400" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                  <AnimatePresence>
                    {selected === u.id && (
                      <tr key={`det-${u.id}`}>
                        <td colSpan={6} className="p-0">
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden bg-[var(--color-bg-secondary)]/10">
                            {detailLoading ? (
                              <div className="p-5"><Skeleton variant="text" className="w-full h-20" /></div>
                            ) : detail ? (
                              <div className="p-5 space-y-5">
                                <div className="flex items-start justify-between flex-wrap gap-4">
                                  <div>
                                    <h3 className="font-semibold">{detail.user.username}</h3>
                                    <p className="text-xs text-[var(--color-text-secondary)]">{detail.user.email} · {detail.user.role === 'admin' ? '管理员' : '用户'}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    {detail.password ? (
                                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)]">
                                        <span className="text-xs font-mono">{showPw ? detail.password : '••••••••'}</span>
                                        <button onClick={() => setShowPw(!showPw)} className="text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]">{showPw ? <EyeOff size={14} /> : <Eye size={14} />}</button>
                                      </div>
                                    ) : <span className="text-xs text-[var(--color-text-tertiary)]">密码不可查看（旧账户请重置）</span>}
                                  </div>
                                </div>

                                <div className="grid grid-cols-4 gap-3">
                                  {[{ l: '消息', v: detail.stats.totalMessages }, { l: '智能体', v: detail.stats.totalAgents }, { l: '对话', v: detail.stats.totalConversations }, { l: '活跃天', v: detail.stats.activeDays }].map(s => (
                                    <div key={s.l} className="text-center p-2 rounded-lg bg-[var(--color-bg-secondary)]/30">
                                      <p className="text-lg font-bold tabular-nums">{s.v}</p>
                                      <p className="text-[10px] text-[var(--color-text-tertiary)]">{s.l}</p>
                                    </div>
                                  ))}
                                </div>

                                {detail.agents.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-medium mb-2 flex items-center gap-1"><Bot size={12} />智能体 ({detail.agents.length})</h4>
                                    <div className="space-y-1">
                                      {detail.agents.map(a => (
                                        <div key={a.id} className="flex justify-between text-xs px-3 py-1.5 rounded bg-[var(--color-bg-secondary)]/20">
                                          <span>{a.name}</span>
                                          <span className="text-[var(--color-text-tertiary)]">{String(a.config?.mode || '—')} · {fmt(a.created_at)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {detail.conversations.length > 0 && (
                                  <div>
                                    <h4 className="text-xs font-medium mb-2 flex items-center gap-1"><MessageSquare size={12} />对话 ({detail.conversations.length})</h4>
                                    <div className="space-y-1 max-h-40 overflow-y-auto">
                                      {detail.conversations.map(c => (
                                        <div key={c.id} className="flex justify-between text-xs px-3 py-1.5 rounded bg-[var(--color-bg-secondary)]/20">
                                          <span className="truncate max-w-[200px]">{c.title || '(无标题)'}</span>
                                          <span className="text-[var(--color-text-tertiary)]">{c.messageCount}条 · {c.duration ? dur(c.duration) : '—'}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ) : null}
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </>
              ))}
            </tbody>
          </table>
        )}
        {total > PAGE && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-tertiary)]">第 {page + 1} / {tp} 页</span>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" iconOnly onClick={() => { setPage(page - 1); loadUsers(page - 1); }} disabled={page === 0}><ChevronLeft size={16} /></Button>
              <Button variant="ghost" size="sm" iconOnly onClick={() => { setPage(page + 1); loadUsers(page + 1); }} disabled={page >= tp - 1}><ChevronRight size={16} /></Button>
            </div>
          </div>
        )}
      </Card>

      {/* 注销确认弹窗 */}
      {deleteTarget && (
        <Modal
          open={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          variant="confirm"
          title="确认注销账户"
          description={`确定要注销用户「${deleteTarget.username}」(${deleteTarget.email}) 吗？这将删除该用户的所有智能体、对话记录、消息和使用日志。此操作不可撤销。`}
          danger
          confirmLabel="确认注销"
          onConfirm={confirmDelete}
        />
      )}
    </div>
  );
}
