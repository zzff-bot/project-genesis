import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  UserPlus,
  Shield,
  RefreshCw,
  Calendar,
  Mail,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import { EmptyState } from '@/shared/ui/EmptyState';
import { toast } from '@/stores/toastStore';
import { api, type User, type AdminStats } from '@/shared/services/api';

const PAGE_SIZE = 20;

export default function AdminPage() {
  // 统计
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // 用户列表
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [usersLoading, setUsersLoading] = useState(true);

  const loadStats = async () => {
    setStatsLoading(true);
    try {
      const data = await api.adminStats();
      setStats(data);
    } catch (err: any) {
      toast.error('加载统计数据失败', err.message);
    } finally {
      setStatsLoading(false);
    }
  };

  const loadUsers = async (pageNum: number) => {
    setUsersLoading(true);
    try {
      const data = await api.adminUsers(PAGE_SIZE, pageNum * PAGE_SIZE);
      setUsers(data.users);
      setTotal(data.total);
    } catch (err: any) {
      toast.error('加载用户列表失败', err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadUsers(0);
  }, []);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const goToPage = (newPage: number) => {
    if (newPage < 0 || newPage >= totalPages) return;
    setPage(newPage);
    loadUsers(newPage);
  };

  // 格式化日期
  const formatDate = (ts: number) => {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 统计卡片配置
  const statCards = [
    {
      label: '总用户数',
      value: stats?.totalUsers ?? '—',
      icon: Users,
      color: '#6366f1',
    },
    {
      label: '今日新增',
      value: stats?.todayUsers ?? '—',
      icon: UserPlus,
      color: '#22c55e',
    },
    {
      label: '管理员',
      value: stats?.adminCount ?? '—',
      icon: Shield,
      color: '#f59e0b',
    },
  ];

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-text)] mb-1">
              管理后台
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              用户管理 · 平台统计
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              loadStats();
              loadUsers(page);
            }}
            loading={statsLoading && usersLoading}
          >
            <RefreshCw size={14} />
            刷新
          </Button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {statCards.map((card) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card padding="md" className="h-full">
                <div className="flex items-center gap-3">
                  <div
                    className="flex items-center justify-center w-10 h-10 rounded-lg"
                    style={{
                      backgroundColor: `${card.color}15`,
                    }}
                  >
                    <card.icon size={20} style={{ color: card.color }} />
                  </div>
                  <div>
                    <p className="text-xs text-[var(--color-text-tertiary)] mb-0.5">
                      {card.label}
                    </p>
                    {statsLoading ? (
                      <Skeleton variant="text" className="w-12 h-6" />
                    ) : (
                      <p className="text-2xl font-semibold text-[var(--color-text)] tabular-nums">
                        {card.value}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* 用户列表 */}
        <Card padding="none" className="overflow-hidden">
          {/* 表头 */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-sm font-medium text-[var(--color-text)] flex items-center gap-2">
              <Users size={16} />
              用户列表
            </h2>
            {total > 0 && (
              <span className="text-xs text-[var(--color-text-tertiary)]">
                共 {total} 个用户
              </span>
            )}
          </div>

          {/* 表格 */}
          {usersLoading ? (
            <div className="p-5 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} variant="rectangular" className="w-full h-12 rounded-lg" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon={<Users size={40} />}
                title="暂无用户"
                description="当有用户注册时，他们会出现在这里"
              />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-xs text-[var(--color-text-tertiary)] border-b border-[var(--color-border)]">
                      <th className="py-3 px-5 font-medium">#</th>
                      <th className="py-3 px-5 font-medium">用户</th>
                      <th className="py-3 px-5 font-medium">邮箱</th>
                      <th className="py-3 px-5 font-medium">角色</th>
                      <th className="py-3 px-5 font-medium hidden md:table-cell">
                        <Calendar size={12} className="inline mr-1" />
                        注册时间
                      </th>
                      <th className="py-3 px-5 font-medium hidden lg:table-cell">
                        最后登录
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr
                        key={user.id}
                        className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-bg-secondary)]/50 transition-colors"
                      >
                        <td className="py-3 px-5 text-sm text-[var(--color-text-tertiary)] tabular-nums">
                          {page * PAGE_SIZE + idx + 1}
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-xs font-medium text-[var(--color-text)]">
                              {user.username.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-[var(--color-text)]">
                              {user.username}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)]">
                            <Mail size={12} className="shrink-0" />
                            <span className="truncate max-w-[160px]">{user.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <Badge
                            variant={user.role === 'admin' ? 'primary' : 'outline'}
                            size="sm"
                          >
                            {user.role === 'admin' ? '管理员' : '用户'}
                          </Badge>
                        </td>
                        <td className="py-3 px-5 text-sm text-[var(--color-text-tertiary)] hidden md:table-cell whitespace-nowrap">
                          {formatDate(user.created_at)}
                        </td>
                        <td className="py-3 px-5 text-sm text-[var(--color-text-tertiary)] hidden lg:table-cell whitespace-nowrap">
                          {formatDate(user.last_login || 0)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 分页 */}
              {total > PAGE_SIZE && (
                <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--color-border)]">
                  <span className="text-xs text-[var(--color-text-tertiary)]">
                    第 {page + 1} / {totalPages} 页
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => goToPage(page - 1)}
                      disabled={page === 0}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      iconOnly
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages - 1}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
