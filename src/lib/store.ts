import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './features/counter/counterSlice'
import toastReducer from './features/toast/toastSlice'
import authReducer from './features/auth/authSlice'
import { pokemonApi } from './services/pokemon'

export const makeStore = () => {
  return configureStore({
    reducer: {
      counter: counterReducer,
      toast: toastReducer,
      auth: authReducer,
      [pokemonApi.reducerPath]: pokemonApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(pokemonApi.middleware),
  })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
