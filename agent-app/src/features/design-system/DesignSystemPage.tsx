import { useState } from 'react';
import {
  Button, Card, GlassPanel, Badge, Input, Modal, Toggle,
  ToastContainer, toast, Skeleton, Avatar, Tooltip, Dropdown,
  Tabs, Progress, StatusBar, Divider, EmptyState,
} from '@/shared/ui';
import {
  Bot, Search, MoreHorizontal, Trash2,
  Copy, ExternalLink, MessageSquare, Zap, Palette, Eye, EyeOff,
} from 'lucide-react';
import type { VisualStyle } from '@/shared/types';

const THEMES: VisualStyle[] = ['modern', 'warm', 'playful'];

export function DesignSystemPage() {
  const [theme, setTheme] = useState<VisualStyle>('modern');
  const [dark, setDark] = useState(false);
  const [mode, setMode] = useState<'character' | 'professional'>('character');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className={`theme-${theme} ${dark ? 'dark' : ''} ${mode === 'character' ? 'mode-character' : 'mode-professional'}`}>
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] p-6 space-y-8">
        <ToastContainer />

        {/* 控制栏 */}
        <GlassPanel variant="strong" padding="lg">
          <h1 className="text-2xl font-bold mb-1">🎨 Design System v2</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mb-5">
            Project Genesis — 组件库展示 · Token 体系 · Character / Expert 双模式
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            {/* 主题选择 */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--color-text-secondary)]">主题</span>
              <div className="flex gap-1">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      theme === t
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-tertiary)]'
                    }`}
                  >
                    {t === 'modern' ? '现代' : t === 'warm' ? '温暖' : '活泼'}
                  </button>
                ))}
              </div>
            </div>

            <Divider orientation="vertical" className="h-8" />

            {/* 暗/亮 */}
            <Toggle
              size="sm"
              checked={dark}
              onChange={setDark}
              label={dark ? '🌙 暗色' : '☀️ 亮色'}
            />

            <Divider orientation="vertical" className="h-8" />

            {/* Mode */}
            <button
              onClick={() => setMode(mode === 'character' ? 'professional' : 'character')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
              style={{
                background: mode === 'professional' ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: mode === 'professional' ? '#fff' : 'var(--color-text-secondary)',
                border: mode === 'professional' ? 'none' : '1px solid var(--color-border)',
              }}
            >
              {mode === 'professional' ? <Eye size={14} /> : <EyeOff size={14} />}
              {mode === 'professional' ? 'Expert' : 'Character'}
            </button>
          </div>
        </GlassPanel>

        {/* Tab 内容 */}
        <Tabs value="components" onValueChange={() => {}}>
          <Tabs.List>
            <Tabs.Tab value="components" icon={Zap}>Components</Tabs.Tab>
            <Tabs.Tab value="tokens" icon={Palette}>Tokens</Tabs.Tab>
          </Tabs.List>
        </Tabs>

        {/* ===== Button ===== */}
        <Section title="Button 按钮">
          <div className="flex flex-wrap items-end gap-3">
            {(['primary', 'secondary', 'ghost', 'danger', 'outline'] as const).map((v) => (
              <Button key={v} variant={v} size="md">{v}</Button>
            ))}
            <Button loading>加载中</Button>
            <Button iconOnly variant="ghost" size="md"><Search size={16} /></Button>
          </div>
          <div className="flex flex-wrap items-end gap-3 mt-2">
            <Button size="sm">小号</Button>
            <Button size="md">中号</Button>
            <Button size="lg">大号</Button>
          </div>
        </Section>

        {/* ===== Card ===== */}
        <Section title="Card 卡片">
          <div className="grid grid-cols-3 gap-4">
            <Card hover padding="md">
              <p className="text-sm font-medium">默认卡片</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">hover 上浮动效</p>
            </Card>
            <GlassPanel variant="default" padding="md">
              <p className="text-sm font-medium">玻璃态卡片</p>
              <p className="text-xs text-[var(--color-text-secondary)] mt-1">glass variant</p>
            </GlassPanel>
            <Card hover={false} padding="sm">
              <p className="text-xs font-medium">禁止 hover</p>
              <p className="text-xs text-[var(--color-text-secondary)]">静态卡片</p>
            </Card>
          </div>
        </Section>

        {/* ===== GlassPanel ===== */}
        <Section title="GlassPanel 玻璃面板">
          <div className="flex gap-4">
            {(['subtle', 'default', 'strong'] as const).map((v) => (
              <GlassPanel key={v} variant={v} padding="md" className="flex-1">
                <p className="text-sm font-medium">{v}</p>
                <p className="text-xs text-[var(--color-text-secondary)]">毛玻璃效果</p>
              </GlassPanel>
            ))}
          </div>
        </Section>

        {/* ===== Badge ===== */}
        <Section title="Badge 徽章">
          <div className="flex flex-wrap items-center gap-2">
            {(['default', 'primary', 'success', 'warning', 'outline'] as const).map((v) => (
              <Badge key={v} variant={v} size="md">{v}</Badge>
            ))}
            <Badge size="sm">小号</Badge>
          </div>
        </Section>

        {/* ===== Input ===== */}
        <Section title="Input 输入框">
          <div className="grid grid-cols-2 gap-4">
            <Input label="名称" placeholder="输入名称…" />
            <Input label="搜索" placeholder="搜索…" icon={Search} />
            <Input label="邮箱" placeholder="email@example.com" error="邮箱格式不正确" />
            <Input label="备注" placeholder="写点什么…" textarea />
          </div>
        </Section>

        {/* ===== Toggle ===== */}
        <Section title="Toggle 开关">
          <div className="flex items-center gap-6">
            <Toggle checked={true} onChange={() => {}} label="已开启" />
            <Toggle checked={false} onChange={() => {}} label="已关闭" />
            <Toggle checked={true} onChange={() => {}} label="禁用" disabled size="sm" />
          </div>
        </Section>

        {/* ===== Modal ===== */}
        <Section title="Modal 模态框">
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setModalOpen(true)}>打开通用 Modal</Button>
            <Button variant="primary" onClick={() => setConfirmOpen(true)}>打开确认 Modal</Button>
          </div>
          <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="通用模态框">
            <p className="text-sm text-[var(--color-text-secondary)]">这里是模态框内容。按 Escape 或点击遮罩关闭。</p>
          </Modal>
          <Modal
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            variant="confirm"
            title="确认删除？"
            description="此操作不可撤销。确定要继续吗？"
            confirmLabel="删除"
            cancelLabel="取消"
            danger
            onConfirm={() => toast.success('已删除', '操作成功完成')}
          />
        </Section>

        {/* ===== Toast ===== */}
        <Section title="Toast 通知">
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => toast.success('保存成功', '配置已保存到本地')}>成功提示</Button>
            <Button variant="secondary" onClick={() => toast.error('操作失败', '请检查网络连接后重试')}>失败提示</Button>
            <Button variant="secondary" onClick={() => toast.warning('注意', '部分数据可能丢失')}>警告提示</Button>
            <Button variant="secondary" onClick={() => toast.info('提示', '新版本 v2.0 已发布')}>信息提示</Button>
          </div>
        </Section>

        {/* ===== Skeleton ===== */}
        <Section title="Skeleton 骨架屏">
          <div className="space-y-4">
            <Skeleton variant="text" lines={3} />
            <div className="flex gap-3">
              <Skeleton variant="circular" width={48} />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Skeleton variant="card" />
              <Skeleton variant="card" />
              <Skeleton variant="rectangular" height={100} />
            </div>
          </div>
        </Section>

        {/* ===== Avatar ===== */}
        <Section title="Avatar 头像">
          <div className="flex items-end gap-4">
            <Avatar alt="User" colorScheme="user" size="xs" />
            <Avatar alt="User" colorScheme="user" size="sm" status="online" />
            <Avatar alt="User" colorScheme="user" size="md" status="away" />
            <Avatar alt="AI" colorScheme="modern" size="lg" />
            <Avatar alt="Bot" colorScheme="playful" size="xl" />
            {(['modern', 'warm', 'playful'] as VisualStyle[]).map((cs) => (
              <Avatar key={cs} alt={cs} colorScheme={cs} size="sm" />
            ))}
          </div>
        </Section>

        {/* ===== Tooltip ===== */}
        <Section title="Tooltip 提示">
          <div className="flex items-center gap-4">
            <Tooltip content="这是顶部提示" position="top">
              <Button variant="secondary" size="sm">悬浮看提示 ↑</Button>
            </Tooltip>
            <Tooltip content="这是底部提示" position="bottom">
              <Button variant="secondary" size="sm">悬浮看提示 ↓</Button>
            </Tooltip>
            <Tooltip content="这是左侧提示" position="left">
              <Button variant="secondary" size="sm">左侧 ←</Button>
            </Tooltip>
            <Tooltip content="这是右侧提示" position="right">
              <Button variant="secondary" size="sm">右侧 →</Button>
            </Tooltip>
          </div>
        </Section>

        {/* ===== Dropdown ===== */}
        <Section title="Dropdown 下拉菜单">
          <Dropdown
            trigger={
              <Button variant="secondary" size="sm">
                <MoreHorizontal size={16} /> 操作菜单
              </Button>
            }
          >
            <Dropdown.Item icon={Copy} shortcut="⌘C">复制</Dropdown.Item>
            <Dropdown.Item icon={ExternalLink}>打开链接</Dropdown.Item>
            <Dropdown.Separator />
            <Dropdown.Item icon={Trash2} danger shortcut="⌘⌫">删除</Dropdown.Item>
          </Dropdown>
        </Section>

        {/* ===== Tabs ===== */}
        <Section title="Tabs 标签页">
          <TabsDemo />
        </Section>

        {/* ===== Progress ===== */}
        <Section title="Progress 进度条">
          <div className="space-y-4 max-w-md">
            <Progress value={60} />
            <Progress value={90} variant="success" showLabel />
            <Progress value={45} variant="warning" showLabel />
            <Progress value={15} variant="error" showLabel />
            <Progress value={0} indeterminate size="sm" />
          </div>
        </Section>

        {/* ===== StatusBar ===== */}
        <Section title="StatusBar 状态条">
          <div className="flex flex-col gap-2 max-w-md">
            <StatusBar status="loading" label="AI 处理中" detail="正在调用 DeepSeek API…" />
            <StatusBar status="success" label="就绪" detail="所有系统正常" />
            <StatusBar status="error" label="错误" detail="API 连接失败" />
            <StatusBar status="warning" label="注意" detail="Token 余量不足" />
            <StatusBar status="idle" label="空闲" />
          </div>
        </Section>

        {/* ===== Divider ===== */}
        <Section title="Divider 分割线">
          <div className="space-y-4 max-w-md">
            <Divider />
            <Divider label="或" />
            <Divider variant="middle" />
            <div className="flex items-center gap-3 h-12">
              <span>A</span>
              <Divider orientation="vertical" />
              <span>B</span>
            </div>
          </div>
        </Section>

        {/* ===== EmptyState ===== */}
        <Section title="EmptyState 空状态">
          <div className="grid grid-cols-2 gap-4">
            <Card padding="lg">
              <EmptyState
                icon={MessageSquare}
                title="暂无对话"
                description="开始与智能体对话"
                size="sm"
              />
            </Card>
            <Card padding="lg">
              <EmptyState
                icon={Bot}
                title="还没有智能体"
                description="创建你的第一个数字生命"
                action={{ label: '创建智能体', onClick: () => toast.info('示例', '点击了创建按钮') }}
              />
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}

// ===== Helper =====

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wide mb-3">
        {title}
      </h2>
      {children}
    </div>
  );
}

function TabsDemo() {
  const [tab, setTab] = useState('tab1');
  return (
    <Tabs value={tab} onValueChange={setTab}>
      <Tabs.List>
        <Tabs.Tab value="tab1" badge={3}>标签一</Tabs.Tab>
        <Tabs.Tab value="tab2">标签二</Tabs.Tab>
        <Tabs.Tab value="tab3" disabled>禁用</Tabs.Tab>
      </Tabs.List>
    </Tabs>
  );
}
