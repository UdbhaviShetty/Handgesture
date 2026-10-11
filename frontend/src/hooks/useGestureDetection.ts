import { useRef, useCallback, useEffect } from 'react'
import { detectGesture } from '@/services/api'
import { useAppContext } from '@/contexts/AppContext'

const DETECTION_INTERVAL_MS = 80 // ~12.5 FPS for snappy response
const CONFIDENCE_THRESHOLD = 0.5

const WINDOW_SIZE = 7
const MIN_STABILITY_VOTES = 4 // Require 4 of last 7 frames to match for stable recognition
const EMA_ALPHA = 0.75 // Landmark EMA smoothing factor (0.75 responsive, 0.25 smooth)

/**
 * Polls the backend /detect endpoint with EMA-smoothed MediaPipe landmarks.
 * Updates global gesture state with 4-of-7 temporal majority voting to eliminate single-frame flicker.
 */
export function useGestureDetection(
  getFlatLandmarks: () => number[] | null,
  isActive: boolean,
) {
  const { setGesture, dispatch, appendToSentence, addSpace, deleteLastChar } = useAppContext()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const frameCountRef = useRef(0)
  const lastFpsTimeRef = useRef(Date.now())

  // Sliding window queue for prediction smoothing (7 frames)
  const frameHistoryRef = useRef<string[]>([])
  const lastAcceptedGestureRef = useRef<string>('')
  const prevLandmarksRef = useRef<number[] | null>(null)

  const getFlatLandmarksRef = useRef(getFlatLandmarks)
  useEffect(() => {
    getFlatLandmarksRef.current = getFlatLandmarks
  }, [getFlatLandmarks])

  const detect = useCallback(async () => {
    const rawLandmarks = getFlatLandmarksRef.current()
    if (!rawLandmarks) {
      // Hand lost -> reset frame history and EMA state
      frameHistoryRef.current = []
      lastAcceptedGestureRef.current = ''
      prevLandmarksRef.current = null
      return
    }

    // Apply Exponential Moving Average (EMA) smoothing to landmarks
    let landmarks = rawLandmarks
    if (prevLandmarksRef.current && prevLandmarksRef.current.length === rawLandmarks.length) {
      landmarks = rawLandmarks.map(
        (val, i) => EMA_ALPHA * val + (1 - EMA_ALPHA) * prevLandmarksRef.current![i]
      )
    }
    prevLandmarksRef.current = landmarks

    // FPS tracking
    frameCountRef.current++
    const now = Date.now()
    const elapsed = now - lastFpsTimeRef.current
    if (elapsed >= 1000) {
      const fps = Math.round((frameCountRef.current * 1000) / elapsed)
      dispatch({ type: 'SET_FPS', fps })
      frameCountRef.current = 0
      lastFpsTimeRef.current = now
    }

    try {
      const t0 = performance.now()
      const { data } = await detectGesture({ landmarks })
      const predTime = Math.round(performance.now() - t0)

      if (!data.model_loaded) {
        dispatch({ type: 'SET_MODEL_LOADED', loaded: false })
        return
      }
      dispatch({ type: 'SET_MODEL_LOADED', loaded: true })

      if (data.confidence >= CONFIDENCE_THRESHOLD) {
        // Push raw prediction to 7-frame sliding window
        const history = frameHistoryRef.current
        history.push(data.gesture)
        if (history.length > WINDOW_SIZE) {
          history.shift()
        }

        // Count frequency of each gesture in the sliding window
        const counts: Record<string, number> = {}
        let maxGesture = ''
        let maxCount = 0

        for (const g of history) {
          counts[g] = (counts[g] || 0) + 1
          if (counts[g] > maxCount) {
            maxCount = counts[g]
            maxGesture = g
          }
        }

        // Only accept and display prediction if it appears in AT LEAST MIN_STABILITY_VOTES frames
        if (maxCount >= MIN_STABILITY_VOTES && maxGesture) {
          setGesture(maxGesture, data.confidence, data.prediction_time_ms || predTime)

          // Auto-append gesture to text sentence when stabilized
          if (maxGesture !== lastAcceptedGestureRef.current) {
            lastAcceptedGestureRef.current = maxGesture

            if (maxGesture === 'space') {
              addSpace()
            } else if (maxGesture === 'delete') {
              deleteLastChar()
            } else if (maxGesture !== 'nothing') {
              appendToSentence(maxGesture)
            }
          }
        }
      } else {
        // Low confidence frame -> drop oldest frame
        if (frameHistoryRef.current.length > 0) {
          frameHistoryRef.current.shift()
        }
      }
    } catch {
      // Silently fail on network errors during detection loop
    }
  }, [setGesture, dispatch, appendToSentence, addSpace, deleteLastChar])

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(detect, DETECTION_INTERVAL_MS)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, detect])
}

