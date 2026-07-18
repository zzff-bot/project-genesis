import { useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [pos, setPos] = useState({ x: -999, y: -999 });
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = useCallback((e: React.MouseEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setVisible(true);
  }, []);

  const handleLeave = () => setVisible(false);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative w-full h-screen overflow-hidden select-none bg-black"
      style={{ cursor: 'none' }}
    >
      {/* ── 第一张图片（底层，全屏铺满） ── */}
      <img
        src="/hero-1.png"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* ── 第二张图片（顶层，圆形 mask 跟随鼠标） ── */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/hero-2.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: visible
            ? `radial-gradient(circle 200px at ${pos.x}px ${pos.y}px, black 40%, transparent 68%)`
            : 'none',
          WebkitMaskImage: visible
            ? `radial-gradient(circle 200px at ${pos.x}px ${pos.y}px, black 40%, transparent 68%)`
            : 'none',
        }}
      />

      {/* ── 自定义光标 ── */}
      {visible && (
        <div
          className="pointer-events-none fixed z-50"
          style={{
            left: pos.x + (containerRef.current?.getBoundingClientRect().left ?? 0) - 14,
            top: pos.y + (containerRef.current?.getBoundingClientRect().top ?? 0) - 14,
          }}
        >
          <div className="w-7 h-7 rounded-full border-2 border-black/70 shadow-[0_0_20px_rgba(0,0,0,0.3)]" />
        </div>
      )}

      {/* ── 创造生命（左侧适中位置） ── */}
      <div className="absolute z-10 left-[12%]" style={{ top: '50%', transform: 'translateY(-50%)' }}>
        <motion.button
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 180, damping: 20 }}
          onClick={() => navigate('/dashboard')}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="glow-btn-dark flex items-center gap-2.5"
        >
          <Sparkles size={17} />
          创造生命
        </motion.button>
      </div>

      {/* ── 敬请期待（右侧适中位置） ── */}
      <div className="absolute z-10 right-[12%]" style={{ top: '50%', transform: 'translateY(-50%)' }}>
        <motion.button
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.55, type: 'spring', stiffness: 180, damping: 20 }}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.96 }}
          className="glow-btn-dark-subtle"
        >
          敬请期待
        </motion.button>
      </div>
    </div>
  );
}
