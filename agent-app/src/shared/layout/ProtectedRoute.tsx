import { useEffect, type ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

/**
 * 认证守卫
 * 未登录 → 重定向到 /login（携带当前路径以便登录后跳回）
 * 初始化中 → 显示加载占位
 */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isInitialized, isLoading, checkAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // 页面加载时验证 token
  useEffect(() => {
    if (!isInitialized) {
      checkAuth();
    }
  }, [isInitialized, checkAuth]);

  // 初始化完成后，未登录则重定向
  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`, { replace: true });
    }
  }, [isInitialized, isAuthenticated, navigate, location.pathname]);

  // 加载中
  if (!isInitialized || isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-[var(--color-bg)]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-text)]/20 border-t-[var(--color-text)] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-[var(--color-text-tertiary)]">加载中...</p>
        </div>
      </div>
    );
  }

  // 已登录
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // 验证中
  return null;
}

/**
 * 管理员守卫（自包含，不依赖 ProtectedRoute）
 * 未登录 → /admin/login，非 admin → /
 */
export function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isInitialized, checkAuth } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized) checkAuth();
  }, [isInitialized, checkAuth]);

  useEffect(() => {
    if (!isInitialized) return;
    if (!isAuthenticated) {
      navigate('/admin/login', { replace: true });
    } else if (user?.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [isInitialized, isAuthenticated, user?.role, navigate]);

  if (!isInitialized) return (
    <div className="h-screen flex items-center justify-center bg-[var(--color-bg)]">
      <div className="w-8 h-8 border-2 border-[var(--color-text)]/20 border-t-[var(--color-text)] rounded-full animate-spin" />
    </div>
  );

  if (!isAuthenticated || user?.role !== 'admin') return null;
  return <>{children}</>;
}
