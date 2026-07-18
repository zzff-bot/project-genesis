import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, Bot, Palette, User, Target, ChevronRight } from 'lucide-react';
import { useAgent } from '@/contexts/AgentContext';
import type { VisualStyle } from '@/shared/types';
import { VISUAL_STYLES } from '@/shared/types';
import { buildSystemPrompt } from '@/engines/prompt/promptBuilder';
import { sendMessage } from '@/shared/services/deepseek';

/* ═════════════════════════════════════════════════════════════
   AgentCreatePage — "Discover → Refine → Preview → Birth"
   设计哲学：Create Someone, Not Something
   ═════════════════════════════════════════════════════════════ */

type Step = 'intent' | 'refine' | 'preview' | 'birth';

const spring = { type: 'spring' as const, stiffness: 200, damping: 22 };

/* ── AI 意图分析 ── */
async function analyzeIntent(input: string): Promise<{
  name: string; personality: string; character: string; goal: string; visualStyle: VisualStyle; type: 'character' | 'expert';
} | null> {
  const prompt = `你是一个智能体创建助手。用户描述了想要创造的AI角色，请分析并返回JSON。

规则：
- name: 2-8个字符的中文名
- personality: 100-200字的性格描述
- character: 简短角色定位（如"资深Python程序员"）
- goal: 一句话引导目的
- visualStyle: "modern"(蓝紫) | "warm"(温暖) | "playful"(柔和粉)
- type: "character"(陪伴型) | "expert"(专家型)

仅返回JSON，不要额外文字。用户输入：${input}`;

  try {
    const result = await sendMessage(prompt, [], '请分析');
    const json = result.replace(/```json|```/g, '').trim();
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/* ═════════════════════════════════════════════════════════════
   主组件
   ═════════════════════════════════════════════════════════════ */
export default function AgentCreatePage() {
  const navigate = useNavigate();
  const { agentId } = useParams<{ agentId: string }>();
  const { createAgent, selectAgent, getAgent } = useAgent();
  const isEdit = !!agentId;

  const [step, setStep] = useState<Step>(isEdit ? 'refine' : 'intent');
  const [intent, setIntent] = useState('');
  const [analyzing, setAnalyzing] = useState(false);

  const [name, setName] = useState('');
  const [personality, setPersonality] = useState('');
  const [character, setCharacter] = useState('');
  const [goal, setGoal] = useState('');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('modern');
  const [humanLike, setHumanLike] = useState(false);

  // 编辑模式：加载已有数据
  useEffect(() => {
    if (!isEdit || !agentId) return;
    const agent = getAgent(agentId);
    if (!agent) { navigate('/agents/create', { replace: true }); return; }
    setName(agent.name);
    setPersonality(agent.personality);
    setCharacter(agent.character);
    setGoal(agent.goal);
    setVisualStyle(agent.visualStyle);
    setHumanLike(agent.humanLike ?? false);
  }, [isEdit, agentId]);

  // 意图分析
  const handleAnalyze = async () => {
    if (!intent.trim()) return;
    setAnalyzing(true);
    const result = await analyzeIntent(intent.trim());
    setAnalyzing(false);
    if (result) {
      setName(result.name);
      setPersonality(result.personality);
      setCharacter(result.character);
      setGoal(result.goal);
      setVisualStyle(result.visualStyle);
    }
    setStep('refine');
  };

  // 跳过AI → 直接手动配置
  const handleSkip = () => setStep('refine');

  // 创建并出生
  const handleBirth = () => {
    if (!name.trim() || !personality.trim()) return;
    setStep('birth');
    setTimeout(() => {
      const agent = createAgent({ name: name.trim(), visualStyle, personality: personality.trim(), character: character.trim(), goal: goal.trim(), humanLike });
      selectAgent(agent.id);
      navigate(`/chat/${agent.id}`);
    }, 1800);
  };

  // ── 渲染 ──
  return (
    <div className="h-full overflow-y-auto bg-[var(--color-bg)]" style={{ fontFamily: 'var(--font-body)', color: 'var(--color-text)' }}>
      <div className="mx-auto max-w-xl px-6 py-12">
        <AnimatePresence mode="wait">
          {step === 'intent' && (
            <StepIntent key="intent" intent={intent} onChange={setIntent} onAnalyze={handleAnalyze} onSkip={handleSkip} analyzing={analyzing} navigate={navigate} />
          )}
          {step === 'refine' && (
            <StepRefine key="refine" name={name} setName={setName} personality={personality} setPersonality={setPersonality} character={character} setCharacter={setCharacter} goal={goal} setGoal={setGoal} visualStyle={visualStyle} setVisualStyle={setVisualStyle} humanLike={humanLike} setHumanLike={setHumanLike} onNext={() => setStep('preview')} onBack={() => setStep(isEdit ? 'refine' : 'intent')} isEdit={isEdit} />
          )}
          {step === 'preview' && (
            <StepPreview key="preview" name={name} personality={personality} character={character} goal={goal} visualStyle={visualStyle} humanLike={humanLike} onBirth={handleBirth} onBack={() => setStep('refine')} isEdit={isEdit} />
          )}
          {step === 'birth' && <StepBirth key="birth" name={name} type={character ? 'expert' : 'character'} />}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════════════════════
   Step 1: Intent Discovery
   ═════════════════════════════════════════════════════════════ */
function StepIntent({ intent, onChange, onAnalyze, onSkip, analyzing, navigate: nav }: {
  intent: string; onChange: (v: string) => void; onAnalyze: () => void; onSkip: () => void;
  analyzing: boolean; navigate: ReturnType<typeof useNavigate>;
}) {
  const hints = ['一个监督我健身的教练', '懂 React 的技术导师', '陪我聊聊天的朋友', '帮我写文案的创意伙伴'];

  return (
    <motion.div {...fadeUp} className="flex flex-col items-center pt-16 text-center">
      {/* 返回 */}
      <button onClick={() => nav('/dashboard')} className="self-start flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors mb-16 cursor-pointer">
        <ArrowLeft size={15} /> 返回
      </button>

      <motion.div {...fadeUp} transition={{ delay: 0.05 }}>
        <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-glow)] flex items-center justify-center mx-auto mb-8">
          <Sparkles size={24} className="text-[var(--color-primary)]" strokeWidth={1.5} />
        </div>
      </motion.div>

      <motion.h1 {...fadeUp} transition={{ delay: 0.1 }} className="text-3xl font-bold tracking-tight mb-3">
        你想创造谁？
      </motion.h1>

      <motion.p {...fadeUp} transition={{ delay: 0.15 }} className="text-[15px] text-[var(--color-text-secondary)] leading-relaxed max-w-sm mb-10">
        用一句话描述你心中的那个人，剩下的交给我
      </motion.p>

      <motion.div {...fadeUp} transition={{ delay: 0.2 }} className="w-full mb-8">
        <textarea
          value={intent}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onAnalyze(); } }}
          placeholder="比如：一个每天监督我健身、给我打气的教练..."
          rows={3}
          className="w-full px-5 py-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[15px] leading-relaxed resize-none focus:outline-none focus:border-[var(--color-primary)]/40 focus:shadow-[0_0_0_3px_var(--color-primary-glow)] transition-all placeholder:text-[var(--color-text-tertiary)]"
          autoFocus
        />
      </motion.div>

      <motion.div {...fadeUp} transition={{ delay: 0.25 }} className="flex items-center gap-3">
        <button
          onClick={onAnalyze}
          disabled={!intent.trim() || analyzing}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-medium disabled:opacity-30 transition-opacity cursor-pointer"
        >
          {analyzing ? (
            <><span className="w-4 h-4 border-2 border-[var(--color-bg)]/30 border-t-[var(--color-bg)] rounded-full animate-spin" /> 分析中...</>
          ) : (
            <><Sparkles size={15} /> 理解我的想法</>
          )}
        </button>
        <button onClick={onSkip} className="text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors cursor-pointer">
          手动配置
        </button>
      </motion.div>

      {/* 快捷提示 */}
      <motion.div {...fadeUp} transition={{ delay: 0.3 }} className="mt-14 w-full">
        <p className="text-xs text-[var(--color-text-tertiary)] mb-3">试试这样说</p>
        <div className="flex flex-wrap justify-center gap-2">
          {hints.map((h) => (
            <button key={h} onClick={() => { onChange(h); }} className="px-3.5 py-1.5 rounded-full text-xs border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer">
              {h}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════════════════
   Step 2: Refine
   ═════════════════════════════════════════════════════════════ */
function StepRefine({ name, setName, personality, setPersonality, character, setCharacter, goal, setGoal, visualStyle, setVisualStyle, humanLike, setHumanLike, onNext, onBack, isEdit }: {
  name: string; setName: (v: string) => void;
  personality: string; setPersonality: (v: string) => void;
  character: string; setCharacter: (v: string) => void;
  goal: string; setGoal: (v: string) => void;
  visualStyle: VisualStyle; setVisualStyle: (v: VisualStyle) => void;
  humanLike: boolean; setHumanLike: (v: boolean) => void;
  onNext: () => void; onBack: () => void; isEdit: boolean;
}) {
  const canProceed = name.trim() && personality.trim();

  return (
    <motion.div {...fadeUp}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors mb-10 cursor-pointer">
        <ArrowLeft size={15} /> {isEdit ? '返回' : '上一步'}
      </button>

      <h1 className="text-2xl font-bold tracking-tight mb-1">{isEdit ? '编辑智能体' : '精调你的创造'}</h1>
      <p className="text-sm text-[var(--color-text-secondary)] mb-10">AI 已经理解了你的意图，你可以随时调整</p>

      {/* 名称 */}
      <Field label="名称" icon={Bot}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="给它起个名字" className={inputClass} />
      </Field>

      {/* 视觉风格 */}
      <Field label="视觉风格" icon={Palette}>
        <div className="flex gap-2 flex-wrap">
          {VISUAL_STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => setVisualStyle(s.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                visualStyle === s.id
                  ? 'border-[var(--color-text)] bg-[var(--color-bg-secondary)] text-[var(--color-text)]'
                  : 'border-[var(--color-border)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-tertiary)]'
              }`}
            >
              <span className="flex gap-1">{s.previewColors.map((c, i) => (<span key={i} className="w-3 h-3 rounded-full" style={{ background: c }} />))}</span>
              {s.name}
            </button>
          ))}
        </div>
      </Field>

      {/* 性格 */}
      <Field label="性格" icon={User}>
        <textarea value={personality} onChange={(e) => setPersonality(e.target.value)} rows={3} placeholder="描述它的性格、说话方式、态度..." className={inputClass + ' resize-y'} />
      </Field>

      {/* 角色 */}
      <Field label="角色定位" icon={Target}>
        <input value={character} onChange={(e) => setCharacter(e.target.value)} placeholder="比如：资深全栈工程师、温暖的生活导师" className={inputClass} />
      </Field>

      {/* 目的 */}
      <Field label="引导目的" icon={Sparkles} optional>
        <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="你们对话的目标是什么？" className={inputClass} />
      </Field>

      {/* 真人模式 */}
      <div className="mt-6 p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-4">
            <p className="text-sm font-medium text-[var(--color-text)]">完全像真人</p>
            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
              开启后，对话中不会出现任何动作描写（如 *微笑*、点点头），像微信聊天一样自然
            </p>
          </div>
          <button
            role="switch"
            aria-checked={humanLike}
            onClick={() => setHumanLike(!humanLike)}
            className={`relative inline-flex items-center h-6 w-10 rounded-full transition-colors duration-200 cursor-pointer ${humanLike ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-tertiary)]'}`}
          >
            <span className={`inline-block w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${humanLike ? 'translate-x-5' : 'translate-x-1'}`} />
          </button>
        </div>
      </div>

      <button onClick={onNext} disabled={!canProceed} className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-medium disabled:opacity-30 transition-opacity cursor-pointer">
        继续 <ArrowRight size={15} />
      </button>
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════════════════
   Step 3: Preview
   ═════════════════════════════════════════════════════════════ */
function StepPreview({ name, personality, character, goal, visualStyle, humanLike, onBirth, onBack, isEdit }: {
  name: string; personality: string; character: string; goal: string; visualStyle: VisualStyle; humanLike: boolean;
  onBirth: () => void; onBack: () => void; isEdit: boolean;
}) {
  const style = VISUAL_STYLES.find((s) => s.id === visualStyle);
  const [showPrompt, setShowPrompt] = useState(false);
  const promptText = buildSystemPrompt({ name, personality, character, goal, humanLike });

  return (
    <motion.div {...fadeUp}>
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors mb-10 cursor-pointer">
        <ArrowLeft size={15} /> 精调
      </button>

      <h1 className="text-2xl font-bold tracking-tight mb-6">预览</h1>

      {/* Profile 卡片 */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 mb-8">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold" style={{ background: `linear-gradient(135deg, ${style?.previewColors[0]}, ${style?.previewColors[1]})` }}>
            {name.charAt(0)}
          </div>
          <div>
            <h2 className="text-lg font-bold">{name}</h2>
            <p className="text-xs text-[var(--color-text-secondary)] flex items-center gap-2 mt-0.5">
              {visualStyle} {character && <><span className="text-[var(--color-border)]">|</span> {character}</>}
            </p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <Row label="性格">{personality}</Row>
          {character && <Row label="角色">{character}</Row>}
          {goal && <Row label="目的">{goal}</Row>}
          <Row label="风格">
            <span className="flex items-center gap-1.5">{style?.previewColors.map((c, i) => (<span key={i} className="w-3.5 h-3.5 rounded-full" style={{ background: c }} />))} {style?.name}</span>
          </Row>
        </div>
      </div>

      {/* System Prompt 折叠 */}
      <button onClick={() => setShowPrompt(!showPrompt)} className="flex items-center gap-2 text-xs text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors mb-8 cursor-pointer">
        <ChevronRight size={14} className={`transition-transform ${showPrompt ? 'rotate-90' : ''}`} />
        {showPrompt ? '收起' : '查看'} System Prompt
      </button>
      <AnimatePresence>
        {showPrompt && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-8">
            <pre className="p-4 rounded-xl bg-[var(--color-bg-secondary)] text-xs text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-wrap border border-[var(--color-border)]">{promptText}</pre>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Birth 按钮 */}
      <button onClick={onBirth} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--color-text)] text-[var(--color-bg)] text-[15px] font-semibold cursor-pointer hover:opacity-90 transition-opacity">
        <Sparkles size={18} />
        {isEdit ? '保存修改' : character ? 'Hire Expert' : 'Birth Character'}
      </button>
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════════════════
   Step 4: Birth Animation
   ═════════════════════════════════════════════════════════════ */
function StepBirth({ name, type }: { name: string; type: 'character' | 'expert' }) {
  return (
    <motion.div className="flex flex-col items-center justify-center pt-32 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: [0, 1.2, 1], rotate: 0 }}
        transition={{ type: 'spring', stiffness: 150, damping: 12, duration: 1.2 }}
        className="w-20 h-20 rounded-3xl bg-[var(--color-primary)] flex items-center justify-center text-white text-3xl font-bold mb-8 shadow-[0_0_60px_var(--color-primary-glow)]"
      >
        {name.charAt(0)}
      </motion.div>

      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="text-2xl font-bold tracking-tight mb-2">
        {type === 'expert' ? `${name} 已就位` : `${name} 诞生了`}
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-sm text-[var(--color-text-secondary)]">
        {type === 'expert' ? '正在准备专业知识...' : '即将进入对话...'}
      </motion.p>
    </motion.div>
  );
}

/* ═════════════════════════════════════════════════════════════
   共享组件
   ═════════════════════════════════════════════════════════════ */

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: spring };

const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-sm focus:outline-none focus:border-[var(--color-primary)]/40 focus:shadow-[0_0_0_3px_var(--color-primary-glow)] transition-all placeholder:text-[var(--color-text-tertiary)]';

function Field({ label, icon: Icon, children, optional }: { label: string; icon: typeof Bot; children: React.ReactNode; optional?: boolean }) {
  return (
    <div className="mb-5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-[var(--color-text)] mb-2">
        <Icon size={14} className="text-[var(--color-text-tertiary)]" />
        {label}
        {optional && <span className="text-[var(--color-text-tertiary)] font-normal text-xs ml-1">选填</span>}
      </label>
      {children}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="text-[var(--color-text-tertiary)] w-14 shrink-0 text-xs pt-0.5">{label}</span>
      <span className="text-[var(--color-text)] leading-relaxed">{children}</span>
    </div>
  );
}
