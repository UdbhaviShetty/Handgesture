import { motion } from 'framer-motion'
import { Volume2, VolumeX, Square, Mic } from 'lucide-react'
import { useSpeech } from '@/hooks/useSpeech'
import { useAppContext } from '@/contexts/AppContext'

/**
 * Voice output controls — Speak, Stop, Mute toggle.
 */
export default function VoiceControls() {
  const { speak, stop, toggleMute, isMuted, isSpeaking } = useSpeech()
  const { state } = useAppContext()
  const hasText = state.sentence.trim().length > 0

  return (
    <div className="glass" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <Volume2 size={16} color="#818cf8" />
        <h3 style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
          Voice Output
        </h3>
        {isSpeaking && (
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="badge badge-green"
            style={{ marginLeft: 'auto' }}
          >
            Speaking…
          </motion.span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px' }}>
        {/* Speak button */}
        <motion.button
          id="voice-speak-btn"
          whileTap={{ scale: 0.95 }}
          className="btn-primary"
          style={{ flex: 1, padding: '11px', fontSize: '0.875rem', justifyContent: 'center' }}
          onClick={() => speak()}
          disabled={!hasText || isMuted}
        >
          <Mic size={16} />
          {isSpeaking ? 'Speaking…' : 'Speak'}
        </motion.button>

        {/* Stop button */}
        <motion.button
          id="voice-stop-btn"
          whileTap={{ scale: 0.95 }}
          className="btn-secondary"
          style={{ padding: '11px 16px', fontSize: '0.875rem' }}
          onClick={stop}
          disabled={!isSpeaking}
          title="Stop speaking"
        >
          <Square size={16} />
        </motion.button>

        {/* Mute toggle */}
        <motion.button
          id="voice-mute-btn"
          whileTap={{ scale: 0.95 }}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '44px', height: '44px',
            background: isMuted ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.05)',
            border: isMuted ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px', color: isMuted ? '#f87171' : '#94a3b8',
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={17} /> : <Volume2 size={17} />}
        </motion.button>
      </div>

      {isMuted && (
        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '10px', textAlign: 'center' }}>
          Voice output is muted
        </p>
      )}
    </div>
  )
}
