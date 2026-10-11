import { motion } from 'framer-motion'
import { Type, Space, Delete, Trash2, ChevronRight } from 'lucide-react'
import { useAppContext } from '@/contexts/AppContext'

/**
 * Displays the accumulated text sentence with Space, Delete, Clear, and Append controls.
 */
export default function TextOutput() {
  const { state, appendToSentence, addSpace, deleteLastChar, clearSentence } = useAppContext()
  const { sentence, currentGesture } = state

  return (
    <div className="glass" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Type size={16} color="#818cf8" />
        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
          Recognized Text
        </h3>
      </div>

      {/* Text area */}
      <div
        style={{
          minHeight: '80px',
          padding: '16px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '10px',
          marginBottom: '14px',
          position: 'relative',
        }}
      >
        {sentence ? (
          <motion.p
            className="text-output"
            layout
            style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.4rem', fontWeight: 600, color: '#f1f5f9', wordBreak: 'break-word' }}
          >
            {sentence}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.7, repeat: Infinity, repeatType: 'reverse' }}
              style={{ display: 'inline-block', width: '2px', height: '1.2em', background: '#6366f1', marginLeft: '2px', verticalAlign: 'text-bottom' }}
            />
          </motion.p>
        ) : (
          <p style={{ color: '#475569', fontSize: '0.9rem', paddingTop: '4px' }}>
            Detected letters will appear here…
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {/* Append current gesture */}
        <motion.button
          id="text-append-gesture"
          whileTap={{ scale: 0.95 }}
          className="btn-secondary"
          style={{ padding: '9px 14px', fontSize: '0.8rem', flex: 1 }}
          onClick={() => currentGesture && appendToSentence(currentGesture)}
          disabled={!currentGesture}
          title="Append current gesture to sentence"
        >
          <ChevronRight size={14} />
          Append
        </motion.button>

        {/* Space */}
        <motion.button
          id="text-add-space"
          whileTap={{ scale: 0.95 }}
          className="btn-secondary"
          style={{ padding: '9px 14px', fontSize: '0.8rem', flex: 1 }}
          onClick={addSpace}
          title="Add space"
        >
          <Space size={14} />
          Space
        </motion.button>

        {/* Delete */}
        <motion.button
          id="text-delete-char"
          whileTap={{ scale: 0.95 }}
          className="btn-secondary"
          style={{ padding: '9px 14px', fontSize: '0.8rem', flex: 1 }}
          onClick={deleteLastChar}
          title="Delete last character"
        >
          <Delete size={14} />
          Delete
        </motion.button>

        {/* Clear */}
        <motion.button
          id="text-clear"
          whileTap={{ scale: 0.95 }}
          onClick={clearSentence}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '9px 14px', fontSize: '0.8rem', flex: 1,
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: '10px', color: '#f87171',
            cursor: 'pointer', fontWeight: 600,
          }}
          title="Clear all text"
        >
          <Trash2 size={14} />
          Clear
        </motion.button>
      </div>
    </div>
  )
}
