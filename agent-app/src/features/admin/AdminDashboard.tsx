import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, Bot, MessageSquare, Shield, RefreshCw } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Button } from '@/shared/ui/Button';
import { toast } from '@/stores/toastStore';
import { api, type AdminStats } from '@/shared/services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    try {
      const data = await api.adminStats();
      setStats(data);
    } catch (err: any) {
      toast.error('加载失败', err.message);
    } finally { setLoading(false); }
  };

  useEffect(() => { loadStats(); }, []);

  const cards = [
    { label: '总用户', value: stats?.totalUsers, icon: Users, color: '#6366f1' },
    { label: '今日新增', value: stats?.todayUsers, icon: UserPlus, color: '#22c55e' },
    { label: '管理员', value: stats?.adminCount, icon: Shield, color: '#f59e0b' },
    { label: '智能体', value: stats?.totalAgents, icon: Bot, color: '#3b82f6' },
    { label: '对话', value: stats?.totalConversations, icon: MessageSquare, color: '#8b5cf6' },
    { label: '消息', value: stats?.totalMessages, icon: MessageSquare, color: '#ec4899' },
  ];

  return (
    <div className="px-6 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-text)]">仪表盘</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">Genesis 平台运营概览</p>
        </div>
        <Button variant="secondary" size="sm" onClick={loadStats} loading={loading}><RefreshCw size={14} />刷新</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((card) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Card padding="md" className="text-center">
              <card.icon size={22} style={{ color: card.color }} className="mx-auto mb-2" />
              {loading ? <Skeleton variant="text" className="w-10 h-7 mx-auto" /> :
                <p className="text-2xl font-bold text-[var(--color-text)] tabular-nums">{card.value ?? '—'}</p>}
              <p className="text-xs text-[var(--color-text-tertiary)] mt-0.5">{card.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
