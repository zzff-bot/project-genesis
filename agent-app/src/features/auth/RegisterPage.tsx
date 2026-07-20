import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { GlassPanel } from '@/shared/ui/GlassPanel';
import { toast } from '@/stores/toastStore';
import { useAuthStore } from '@/stores/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!email || !username || !password || !confirmPassword) {
      toast.warning('请填写完整', '所有字段都是必填的');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warning('邮箱格式不正确');
      return;
    }

    if (username.length < 1 || username.length > 50) {
      toast.warning('用户名长度应在 1-50 个字符之间');
      return;
    }

    if (password.length < 6) {
      toast.warning('密码太短', '密码长度不能少于 6 位');
      return;
    }

    if (password !== confirmPassword) {
      toast.warning('密码不一致', '两次输入的密码不相同');
      return;
    }

    try {
      await register(email, username, password);
      toast.success('注册成功！', '欢迎来到 Genesis');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error('注册失败', err.message || '请稍后重试');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] px-4 py-8">
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
              <UserPlus size={22} className="text-[var(--color-text)]" />
            </div>
            <h1 className="text-xl font-semibold text-[var(--color-text)] mb-1">
              创建账号
            </h1>
            <p className="text-sm text-[var(--color-text-tertiary)]">
              开始你的数字生命创造之旅
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

            <Input
              label="用户名"
              type="text"
              placeholder="给自己起个名字"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              icon={User}
              autoComplete="username"
            />

            <div className="relative">
              <Input
                label="密码"
                type={showPassword ? 'text' : 'password'}
                placeholder="至少 6 位密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={Lock}
                autoComplete="new-password"
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

            <Input
              label="确认密码"
              type={showPassword ? 'text' : 'password'}
              placeholder="再次输入密码"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              icon={Lock}
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isLoading}
              className="w-full mt-2"
            >
              注册
            </Button>
          </form>

          {/* 底部链接 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[var(--color-text-tertiary)]">
              已有账号？{' '}
              <Link
                to="/login"
                className="text-[var(--color-text)] font-medium hover:underline underline-offset-2"
              >
                立即登录
              </Link>
            </p>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
