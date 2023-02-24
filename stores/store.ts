import { configureStore } from "@reduxjs/toolkit"
import { authReducer } from './auth/authSlice'

export const store = configureStore({
    reducer: {
        auth: authReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActionPaths: ['payload.meta.arg.cb', 'meta.arg', 'payload'],
                ignoredActions: ["refreshAccessToken/fulfilled"]
            },
        }),
})

export type ApplicationState = ReturnType<typeof store.getState>;

export type ApplicationDispatch = typeof store.dispatch;