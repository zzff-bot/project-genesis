import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { GlassPanel } from '@/shared/ui/GlassPanel';
import { toast } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.warning('请填写完整', '邮箱和密码不能为空');
      return;
    }

    try {
      await login(email, password);
      toast.success('欢迎回来！');
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect, { replace: true });
    } catch (err: any) {
      toast.error('登录失败', err.message || '请检查邮箱和密码');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4">
      {/* 返回首页 */}
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
      >
        <ArrowLeft size={16} />
        返回首页
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <GlassPanel padding="lg" className="rounded-2xl">
          {/* 标题区 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-bg-secondary)] mb-4">
              <LogIn size={22} className="text-[var(--color-text)]" />
            </div>
            <h1 className="text-xl font-semibold text-[var(--color-text)] mb-1">
              登录 Genesis
            </h1>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              继续你的数字生命之旅
            </p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="邮箱"
              type="email"
              placeholder="请输入邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              autoComplete="email"
              autoFocus
            />

            <div className="relative">
              <Input
                label="密码"
                type={showPassword ? 'text' : 'password'}
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 bottom-[10px] text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full mt-2"
            >
              登录
            </Button>
          </form>

          {/* 底部链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              还没有账号？{' '}
              <Link
                to="/register"
                className="text-[var(--color-text)] font-medium hover:underline underline-offset-2"
              >
                立即注册
              </Link>
            </p>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
