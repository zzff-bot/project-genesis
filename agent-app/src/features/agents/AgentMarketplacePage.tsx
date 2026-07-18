import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card, Button, Badge } from '@/shared/ui';
import { useAgent } from '../../contexts/AgentContext';

/** 预设智能体模板 */
const PRESET_AGENTS = [
  {
    name: '代码助手',
    personality: '你是一位资深的软件工程师，擅长多种编程语言。你耐心、严谨，会解释代码背后的原理。',
    character: '资深全栈工程师',
    goal: '帮助用户解决编程问题，写高质量的代码',
    visualStyle: 'modern' as const,
    icon: '💻',
  },
  {
    name: '英语老师',
    personality: '你是一位耐心的英语教师，擅长纠正语法和发音。你友好而鼓励，让学习变得有趣。',
    character: '英语母语教师',
    goal: '帮助用户提高英语水平，练习日常对话',
    visualStyle: 'modern' as const,
    icon: '📚',
  },
  {
    name: '创意作家',
    personality: '你富有想象力，文字优美。你善于用故事启发思考，用比喻传达深意。',
    character: '职业作家',
    goal: '协助用户进行创意写作，提供灵感和反馈',
    visualStyle: 'warm' as const,
    icon: '✍️',
  },
  {
    name: '生活教练',
    personality: '你充满正能量，善于倾听和引导。你帮助人们发现自己的潜力，制定可行的计划。',
    character: '认证生活教练',
    goal: '帮助用户实现个人成长目标',
    visualStyle: 'playful' as const,
    icon: '🌟',
  },
  {
    name: '产品顾问',
    personality: '你具有商业洞察力和产品思维。你善于分析用户需求，提出切实可行的产品方案。',
    character: '资深产品经理',
    goal: '帮助用户打磨产品创意，制定产品策略',
    visualStyle: 'modern' as const,
    icon: '🚀',
  },
  {
    name: '知识百科',
    personality: '你知识渊博，涉猎广泛。你对事实准确，解释深入浅出。',
    character: '百科全书式的学者',
    goal: '回答用户的各种问题，拓展知识边界',
    visualStyle: 'modern' as const,
    icon: '🎓',
  },
];

export default function AgentMarketplacePage() {
  const navigate = useNavigate();
  const { createAgent, selectAgent } = useAgent();

  const handleUseTemplate = (preset: (typeof PRESET_AGENTS)[number]) => {
    const agent = createAgent({
      name: preset.name,
      visualStyle: preset.visualStyle,
      personality: preset.personality,
      character: preset.character,
      goal: preset.goal,
    });
    selectAgent(agent.id);
    navigate(`/chat/${agent.id}`);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto px-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-light tracking-tight" style={{ color: 'var(--color-text)' }}>
            探索智能体
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            选择一个模板，开始你的 AI 对话之旅
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {PRESET_AGENTS.map((preset, i) => (
            <motion.div
              key={preset.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, type: 'spring', stiffness: 400, damping: 28 }}
            >
              <Card
                padding="lg"
                className="h-full flex flex-col group"
              >
                {/* Emoji 图标 */}
                <div className="text-4xl mb-5 select-none">{preset.icon}</div>

                {/* 名称 */}
                <h3 className="text-base font-medium mb-2" style={{ color: 'var(--color-text)' }}>
                  {preset.name}
                </h3>

                {/* 描述 */}
                <p className="text-xs leading-relaxed mb-5 line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
                  {preset.personality.slice(0, 80)}
                </p>

                {/* 标签 */}
                <div className="flex gap-1.5 mb-5">
                  <Badge size="sm">{preset.visualStyle}</Badge>
                  <Badge size="sm" variant="outline">{preset.character}</Badge>
                </div>

                {/* 按钮 */}
                <div className="mt-auto">
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => handleUseTemplate(preset)}
                  >
                    开始对话
                    <ArrowRight size={14} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
