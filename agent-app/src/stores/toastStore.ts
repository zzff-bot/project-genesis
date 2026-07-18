import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  /** 自动关闭时间（ms），0 = 不自动关闭 */
  duration?: number;
  /** 操作按钮 */
  action?: { label: string; onClick: () => void };
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAll: () => void;
}

let toastId = 0;

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${++toastId}-${Date.now()}`;
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
  clearAll: () => set({ toasts: [] }),
}));

// ===== 便捷函数（模块级别） =====
const add = (toast: Omit<Toast, 'id'>) => {
  return useToastStore.getState().addToast(toast);
};

export const toast = {
  success: (title: string, description?: string) =>
    add({ type: 'success', title, description }),
  error: (title: string, description?: string) =>
    add({ type: 'error', title, description }),
  warning: (title: string, description?: string) =>
    add({ type: 'warning', title, description }),
  info: (title: string, description?: string) =>
    add({ type: 'info', title, description }),
  /** 带操作按钮的提示 */
  action: (title: string, action: { label: string; onClick: () => void }) =>
    add({ type: 'info', title, action, duration: 0 }),
  /** 显示 promise 状态的提示 */
  promise: async <T>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string },
  ) => {
    const id = add({ type: 'info', title: messages.loading, duration: 0 });
    try {
      await promise;
      useToastStore.getState().removeToast(id);
      add({ type: 'success', title: messages.success });
    } catch {
      useToastStore.getState().removeToast(id);
      add({ type: 'error', title: messages.error });
    }
  },
};

// 类型导出（避免组件直接依赖 store）
export type { ToastState };
