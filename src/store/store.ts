import { configureStore } from '@reduxjs/toolkit'
import cartReducer from './features/CartSlice'
import branchReducer from './features/BranchSlice'
import { publicApi } from './api/publicApi'

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    branch: branchReducer,
    [publicApi.reducerPath]: publicApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(publicApi.middleware),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
