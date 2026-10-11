import React, { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react'

// =====================================================
// TYPES
// =====================================================

export interface GestureRecord {
  id: string
  gesture: string
  confidence: number
  timestamp: string
  sentence?: string
}

export interface AppState {
  /** Currently detected gesture label */
  currentGesture: string
  /** Confidence score 0-1 */
  confidence: number
  /** Time taken for last prediction (ms) */
  predictionTime: number
  /** Accumulated text sentence */
  sentence: string
  /** Prediction history */
  history: GestureRecord[]
  /** Camera active state */
  isCameraActive: boolean
  /** Mute voice output */
  isMuted: boolean
  /** Speaking state */
  isSpeaking: boolean
  /** Current FPS */
  fps: number
  /** Error message */
  error: string | null
  /** Model loaded state */
  modelLoaded: boolean
  /** Total predictions count */
  totalPredictions: number
}

type Action =
  | { type: 'SET_GESTURE'; gesture: string; confidence: number; predictionTime: number }
  | { type: 'APPEND_SENTENCE'; text: string }
  | { type: 'DELETE_LAST_CHAR' }
  | { type: 'CLEAR_SENTENCE' }
  | { type: 'ADD_HISTORY'; record: GestureRecord }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'SET_CAMERA_ACTIVE'; active: boolean }
  | { type: 'SET_MUTED'; muted: boolean }
  | { type: 'SET_SPEAKING'; speaking: boolean }
  | { type: 'SET_FPS'; fps: number }
  | { type: 'SET_ERROR'; error: string | null }
  | { type: 'SET_MODEL_LOADED'; loaded: boolean }

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: AppState = {
  currentGesture: '',
  confidence: 0,
  predictionTime: 0,
  sentence: '',
  history: [],
  isCameraActive: false,
  isMuted: false,
  isSpeaking: false,
  fps: 0,
  error: null,
  modelLoaded: false,
  totalPredictions: 0,
}

// =====================================================
// REDUCER
// =====================================================

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_GESTURE':
      return {
        ...state,
        currentGesture: action.gesture,
        confidence: action.confidence,
        predictionTime: action.predictionTime,
        totalPredictions: state.totalPredictions + 1,
      }
    case 'APPEND_SENTENCE':
      return { ...state, sentence: state.sentence + action.text }
    case 'DELETE_LAST_CHAR':
      return { ...state, sentence: state.sentence.slice(0, -1) }
    case 'CLEAR_SENTENCE':
      return { ...state, sentence: '' }
    case 'ADD_HISTORY':
      return { ...state, history: [action.record, ...state.history].slice(0, 100) }
    case 'CLEAR_HISTORY':
      return { ...state, history: [] }
    case 'SET_CAMERA_ACTIVE':
      return { ...state, isCameraActive: action.active }
    case 'SET_MUTED':
      return { ...state, isMuted: action.muted }
    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.speaking }
    case 'SET_FPS':
      return { ...state, fps: action.fps }
    case 'SET_ERROR':
      return { ...state, error: action.error }
    case 'SET_MODEL_LOADED':
      return { ...state, modelLoaded: action.loaded }
    default:
      return state
  }
}

// =====================================================
// CONTEXT
// =====================================================

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<Action>
  setGesture: (gesture: string, confidence: number, predictionTime: number) => void
  appendToSentence: (text: string) => void
  addSpace: () => void
  deleteLastChar: () => void
  clearSentence: () => void
  addHistory: (record: Omit<GestureRecord, 'id'>) => void
  clearHistory: () => void
  setError: (error: string | null) => void
}

const AppContext = createContext<AppContextValue | null>(null)

// =====================================================
// PROVIDER
// =====================================================

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState)

  const setGesture = useCallback((gesture: string, confidence: number, predictionTime: number) => {
    dispatch({ type: 'SET_GESTURE', gesture, confidence, predictionTime })
  }, [])

  const appendToSentence = useCallback((text: string) => {
    dispatch({ type: 'APPEND_SENTENCE', text })
  }, [])

  const addSpace = useCallback(() => {
    dispatch({ type: 'APPEND_SENTENCE', text: ' ' })
  }, [])

  const deleteLastChar = useCallback(() => {
    dispatch({ type: 'DELETE_LAST_CHAR' })
  }, [])

  const clearSentence = useCallback(() => {
    dispatch({ type: 'CLEAR_SENTENCE' })
  }, [])

  const addHistory = useCallback((record: Omit<GestureRecord, 'id'>) => {
    const fullRecord: GestureRecord = {
      ...record,
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    }
    dispatch({ type: 'ADD_HISTORY', record: fullRecord })
  }, [])

  const clearHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_HISTORY' })
  }, [])

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', error })
  }, [])

  return (
    <AppContext.Provider
      value={{
        state,
        dispatch,
        setGesture,
        appendToSentence,
        addSpace,
        deleteLastChar,
        clearSentence,
        addHistory,
        clearHistory,
        setError,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// =====================================================
// HOOK
// =====================================================

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}
