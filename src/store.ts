import { configureStore } from '@reduxjs/toolkit'
import blogReducer from './pages/blog/blog.slice'
import { blogApi } from './pages/blog/blog.services'
import { setupListeners } from '@reduxjs/toolkit/dist/query'
import { useDispatch, useSelector } from 'react-redux'
import { rtkQueryErrorLogger } from './middleware'
export const store = configureStore({
    reducer: {
        blog: blogReducer,
        [blogApi.reducerPath]: blogApi.reducer // Thêm reducer được tạo từ api slice
    },
    // Thêm api middleware để enable các tính năng như caching, invalidation, polling của RTK query
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(blogApi.middleware, rtkQueryErrorLogger)
})

// Optional, nhưng bát buộc nếu dùng tính năng như refetchOnFocus/refreshOnReconnect
setupListeners(store.dispatch)

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector = () => useSelector<RootState>((state: RootState) => state)
