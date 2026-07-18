// ===== 视觉风格类型 =====
export type VisualStyle = 'modern' | 'warm' | 'playful';

// ===== 视觉风格元数据 =====
export interface VisualStyleMeta {
  id: VisualStyle;
  name: string;
  description: string;
  icon: string;
  previewColors: string[];
}

// ===== 预设数据 =====
export const VISUAL_STYLES: VisualStyleMeta[] = [
  {
    id: 'modern',
    name: '现代风格',
    description: '清爽蓝紫渐变，圆润边角，适合专业场景',
    icon: 'sparkles',
    previewColors: ['#6366f1', '#818cf8', '#4f46e5'],
  },
  {
    id: 'warm',
    name: '温暖风格',
    description: '琥珀暖色调，柔和阴影，给人亲切感',
    icon: 'sun',
    previewColors: ['#d97706', '#f59e0b', '#b45309'],
  },
  {
    id: 'playful',
    name: '活泼风格',
    description: '粉紫多彩，大圆角，充满趣味和活力',
    icon: 'party-popper',
    previewColors: ['#ec4899', '#8b5cf6', '#f472b6'],
  },
];
