import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { GlassPanel } from '@/shared/ui/GlassPanel';
import { toast } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';
import { api, setToken } from '@/shared/services/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const setUser = useAuthStore((s) => s.setUser);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.warning('请填写完整'); return; }
    setLoading(true);
    try {
      const result = await api.login(email, password);
      if (result.user.role !== 'admin') {
        toast.error('无权访问', '该账号不是管理员');
        setLoading(false);
        return;
      }
      if (result.user.status === 'frozen') {
        toast.error('账户已被冻结');
        setLoading(false);
        return;
      }
      // 同时设置 token 和 authStore 状态
      setToken(result.token);
      setUser(result.user);
      toast.success('登录成功');
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      toast.error('登录失败', err.message);
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
        <ArrowLeft size={16} />返回首页
      </Link>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <GlassPanel padding="lg" className="rounded-2xl border border-white/10">
          <div className="text-center mb-8">
            <Shield size={28} className="mx-auto mb-3 text-[var(--color-text)]" />
            <h1 className="text-lg font-semibold text-[var(--color-text)] mb-1">管理员登录</h1>
            <p className="text-xs text-[var(--color-text-tertiary)]">仅限管理员账号访问</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="邮箱" type="email" placeholder="管理员邮箱" value={email} onChange={(e) => setEmail(e.target.value)} icon={Mail} autoFocus />
            <div className="relative">
              <Input label="密码" type={showPw ? 'text' : 'password'} placeholder="密码" value={password} onChange={(e) => setPassword(e.target.value)} icon={Lock} />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 bottom-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)]" tabIndex={-1}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full">登录后台</Button>
          </form>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
