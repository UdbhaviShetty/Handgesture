import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, AlertTriangle } from 'lucide-react'

interface GesturePanelProps {
  gesture: string
  confidence: number
  predictionTime: number
  modelLoaded: boolean
}

/**
 * Displays the currently detected gesture with confidence bar
 * and prediction time. Shows a model-not-loaded warning if needed.
 */
export default function GesturePanel({ gesture, confidence, predictionTime, modelLoaded }: GesturePanelProps) {
  const pct = Math.round(confidence * 100)

  return (
    <div className="glass" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Sparkles size={16} color="#818cf8" />
        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
          Detected Gesture
        </h3>
      </div>

      {/* Model not loaded warning */}
      {!modelLoaded && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 14px',
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.25)',
          borderRadius: '8px',
          marginBottom: '14px',
        }}>
          <AlertTriangle size={15} color="#fbbf24" />
          <span style={{ fontSize: '0.8rem', color: '#fbbf24' }}>Model not loaded — using demo mode</span>
        </div>
      )}

      {/* Gesture display */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          minHeight: '90px', marginBottom: '16px',
          background: 'rgba(99,102,241,0.06)',
          border: '1px solid rgba(99,102,241,0.15)',
          borderRadius: '12px',
        }}
      >
        <AnimatePresence mode="wait">
          {gesture ? (
            <motion.div
              key={gesture}
              initial={{ scale: 0.7, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: -10 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={{ textAlign: 'center' }}
            >
              <p
                style={{
                  fontFamily: 'Space Grotesk, sans-serif',
                  fontSize: '2.8rem',
                  fontWeight: 700,
                  background: 'linear-gradient(135deg, #818cf8, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                }}
              >
                {gesture}
              </p>
            </motion.div>
          ) : (
            <motion.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ color: '#475569', fontSize: '0.875rem' }}
            >
              Show your hand to camera…
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Confidence bar */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Confidence</span>
          <span style={{ fontSize: '0.75rem', color: pct > 80 ? '#4ade80' : pct > 50 ? '#fbbf24' : '#f87171', fontWeight: 700 }}>
            {pct}%
          </span>
        </div>
        <div className="confidence-bar">
          <motion.div
            className="confidence-bar-fill"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Prediction time */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Prediction time</span>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#818cf8' }}>{predictionTime} ms</span>
      </div>
    </div>
  )
}
