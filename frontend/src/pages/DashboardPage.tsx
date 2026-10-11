import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Camera, CameraOff, BarChart3 } from 'lucide-react'
import { useWebcam } from '@/hooks/useWebcam'
import { useMediaPipe } from '@/hooks/useMediaPipe'
import { useGestureDetection } from '@/hooks/useGestureDetection'
import { useAppContext } from '@/contexts/AppContext'
import { checkHealth } from '@/services/api'
import WebcamView from '@/components/WebcamView'
import GesturePanel from '@/components/GesturePanel'
import TextOutput from '@/components/TextOutput'
import VoiceControls from '@/components/VoiceControls'
import StatsPanel from '@/components/StatsPanel'
import HistoryCard from '@/components/HistoryCard'
import ErrorBanner from '@/components/ErrorBanner'

/**
 * Live Detection Dashboard — main application screen.
 * Left: webcam + landmarks | Right: gesture, text, voice, stats, history
 */
export default function DashboardPage() {
  const { state, dispatch, setError, addHistory } = useAppContext()
  const [isDetecting, setIsDetecting] = useState(false)
  const webcam = useWebcam()

  // Callback when MediaPipe detects a hand result
  const handleMediaPipeResult = useCallback(() => {
    // Results drive useGestureDetection automatically
  }, [])

  const mediapipe = useMediaPipe(webcam.videoRef, handleMediaPipeResult)

  // Poll backend for gesture recognition when detection is active
  useGestureDetection(mediapipe.getFlatLandmarks, isDetecting && state.isCameraActive)

  // Check backend health on mount
  useEffect(() => {
    checkHealth()
      .then(({ data }) => {
        dispatch({ type: 'SET_MODEL_LOADED', loaded: data.model_loaded })
      })
      .catch(() => {
        dispatch({ type: 'SET_MODEL_LOADED', loaded: false })
      })
  }, [dispatch])

  // Auto-add to history when a new gesture is detected
  useEffect(() => {
    if (state.currentGesture && state.confidence > 0.6) {
      addHistory({
        gesture: state.currentGesture,
        confidence: state.confidence,
        timestamp: new Date().toISOString(),
        sentence: state.sentence || undefined,
      })
    }
    // Only when gesture changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.currentGesture])

  const handleStartCamera = async () => {
    await webcam.startCamera()
    setIsDetecting(true)
  }

  const handleStopCamera = () => {
    webcam.stopCamera()
    setIsDetecting(false)
    dispatch({ type: 'SET_FPS', fps: 0 })
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}
      >
        <div>
          <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.6rem', fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>
            Live Detection Dashboard
          </h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Real-time sign language recognition powered by MediaPipe & AI
          </p>
        </div>

        {/* Camera toggle */}
        <div style={{ display: 'flex', gap: '10px' }}>
          {!state.isCameraActive ? (
            <motion.button
              id="dashboard-start-camera"
              whileTap={{ scale: 0.95 }}
              className="btn-primary"
              onClick={handleStartCamera}
              disabled={webcam.isLoading}
            >
              <Camera size={16} />
              {webcam.isLoading ? 'Starting…' : 'Start Camera'}
            </motion.button>
          ) : (
            <motion.button
              id="dashboard-stop-camera"
              whileTap={{ scale: 0.95 }}
              className="btn-secondary"
              onClick={handleStopCamera}
            >
              <CameraOff size={16} />
              Stop Camera
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Error banner */}
      <ErrorBanner message={state.error} onDismiss={() => setError(null)} />

      {/* Main grid */}
      <div className="dashboard-grid">
        {/* ===== LEFT — Webcam ===== */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          <WebcamView
            webcam={webcam}
            canvasRef={mediapipe.canvasRef}
            fps={state.fps}
            isActive={state.isCameraActive}
            confidence={state.confidence}
          />

          {/* Stats below webcam */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <BarChart3 size={14} color="#818cf8" />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Session Stats
              </span>
            </div>
            <StatsPanel />
          </div>
        </motion.div>

        {/* ===== RIGHT — Panels ===== */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
          {/* Gesture */}
          <GesturePanel
            gesture={state.currentGesture}
            confidence={state.confidence}
            predictionTime={state.predictionTime}
            modelLoaded={state.modelLoaded}
          />

          {/* Text output */}
          <TextOutput />

          {/* Voice */}
          <VoiceControls />

          {/* Prediction History */}
          <div className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <h3 style={{ fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#94a3b8' }}>
                Prediction History
              </h3>
              <span className="badge badge-blue">{state.history.length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }} className="no-scrollbar">
              {state.history.length === 0 ? (
                <p style={{ color: '#475569', fontSize: '0.8rem', textAlign: 'center', padding: '20px 0' }}>
                  No predictions yet
                </p>
              ) : (
                state.history.slice(0, 20).map((record, i) => (
                  <HistoryCard key={record.id} record={record} index={i} />
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
