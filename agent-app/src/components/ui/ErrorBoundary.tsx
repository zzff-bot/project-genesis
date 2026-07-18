import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * 全局错误边界 — 捕获渲染异常，防止空白页
 * 显示错误信息并提供返回首页按钮
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[ErrorBoundary] 捕获到渲染错误:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            padding: '2rem',
            background: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-body)',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '420px' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: 'var(--color-bg-secondary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                fontSize: 20,
                color: 'var(--color-text-tertiary)',
              }}
            >
              !
            </div>
            <h2
              style={{
                fontSize: '1.25rem',
                fontWeight: 600,
                marginBottom: 8,
                color: 'var(--color-text)',
              }}
            >
              页面发生了意外错误
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--color-text-secondary)',
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              {this.state.error?.message || '渲染组件时出现了未知错误'}
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 24px',
                borderRadius: 12,
                background: 'var(--color-text)',
                color: 'var(--color-bg)',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              返回首页
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
