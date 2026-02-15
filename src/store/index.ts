import { configureStore } from '@reduxjs/toolkit'
import journalsReducer from './slices/journalsSlice'
import articlesReducer from './slices/articlesSlice'
import analyticsReducer from './slices/analyticsSlice'
import realtimeReducer from './slices/realtimeSlice'

export const store = configureStore({
  reducer: {
    journals: journalsReducer,
    articles: articlesReducer,
    analytics: analyticsReducer,
    realtime: realtimeReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['realtime/setConnection'],
        ignoredPaths: ['realtime.socket'],
      },
    }),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: { journals: JournalsState, articles: ArticlesState, analytics: AnalyticsState, realtime: RealtimeState }
export type AppDispatch = typeof store.dispatch
