import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Post } from 'types/blog.type'
import { CustomError } from 'utils/helpers'

// Nếu bên slice chúng ta dùng createSlice để tạo slice thì bên RTK query dùng createApi
// Với createApi chúng ta gọi là slice api
// Chúng ta sẽ khai báo baseUrl và các endpoints

// baseQuery được dùng cho mỗi endpoint để fetch api

// fetchBaseQuery là một function nhỏ được xây dựng trên fetch API
// Nó không thay thế hoàn toàn được Axios nhưng sẽ giải quyết được hầu hết các vấn đề của bạn
// Chúng ta có thể dùng axios thay thế cũng được, nhưng để sau nhé

// endPoints là tập hợp những method giúp get, post, put, delete... tương tác với server
// Khi khai báo endPoints nó sẽ sinh ra cho chúng ta các hook tương ứng để dùng trong component
// endpoints có 2 kiểu là query và mutation.
// Query: Thường dùng cho GET
// Mutation: Thường dùng cho các trường hợp thay đổi dữ liệu trên server như POST, PUT, DELETE

// Có thể ban đầu mọi người thấy nó phức tạp và khó hiểu
// Không sao, mình cũng thể, các bạn chỉ cần hiểu là đây là cách setup mà RTK query yêu cầu
// Chúng ta chỉ cần làm theo hướng dẫn là được

/**
 * Mô hình sync dữ liệu danh sách bài post dưới local sau khi thêm 1 bài post
 * Thường sẽ có 2 cách tiếp cận
 * Cách 1: Đây là cách những video trước đây mình dùng
 * 1. Sau khi thêm 1 bài post thì server sẽ trả về data của bài post đó
 * 2. Chúng ta sẽ tiến hành lấy data đó thêm vào state redux
 * 3. Lúc này UI chúng ta sẽ được sync
 *
 * ====> Rủi ro cách này là nếu khi gọi request add post mà server trả về data không đủ các field để
 * chúng ta hiển thị thì sẽ gặp lỗi. Nếu có nhiều người cùng add post thì data sẽ sync thiếu,
 * Chưa kể chúng ta phải quản lý việc cập nhật state nữa, hơi mệt!
 *
 *
 * Cách 2: Đây là cách thường dùng với RTK query
 * 1. Sau khi thêm 1 bài post thì server sẽ trả về data của bài post đó
 * 2. Chúng ta sẽ tiến hành fetch lại API get posts để cập nhật state redux
 * 3. Lúc này UI chúng ta sẽ được sync
 *
 * =====> Cách này giúp data dưới local sẽ luôn mới nhất, luôn đồng bộ với server
 * =====> Khuyết điểm là chúng ta sẽ tốn thêm một lần gọi API. Thực ra thì điều này có thể chấp nhận được
 */

export const blogApi = createApi({
    reducerPath: 'blogApi', // Tên filed trong Redux store
    tagTypes: ['Posts'], // Tên tag để quản lý các request
    baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:4000/' }), // vì đang chạy trên Local bằng JSON Server nên sẽ là localhost
    endpoints: (builder) => ({
        // Generic type theo thứ tự là kiểu response trả về và argument của query
        getPosts: builder.query<Post[], void>({
            query: () => 'posts', // method không có argument
            providesTags(result) {
                /**
                 * Cái callback này sẽ được chạy mỗi khi getPosts được gọi
                 * Mong muốn là sẽ return về một mảng kiểu
                 * ```ts
                 * interface Tags: {
                 *      type: 'Post',
                 *      id: string
                 * }[]
                 * ```
                 * vì thế phải thêm as const vào để báo hiệu type là Read only, không thể mutate
                 */
                if (result) { // result là data trả về từ server
                    const final = [
                        ...result.map(({ id }) => ({ type: 'Posts' as const, id })),
                        { type: 'Posts' as const, id: 'LIST' }
                    ]
                    return final
                }
                return [{ type: 'Posts', id: 'LIST' }]
            }
        }),
        /**
         * Chúng ta dùng mutation đối với các trường hợp cần thay đổi dữ liệu trên server
         * Ví dụ: POST, PUT, DELETE
         * Post là response trả về Omit<Post, 'id'> là body gửi lên
         */
        addPost: builder.mutation<Post, Omit<Post, 'id'>>({
            query: (body) => {
                try {
                    // throw Error('hehehehe')
                    // let a: any = null
                    // a.b = 1
                    return {
                        url: 'posts',
                        method: 'POST',
                        body
                    }
                } catch (error: any) {
                    throw new CustomError(error.message)
                }
            },
            /** 
             * - invalidatesTags cung cấp các tag để báo hiệu cho những methods nào có providesTags match
             * với nó sẽ bị gọi lại. Trong trường hợp getPosts sẽ chạy lại
             * - invalidatesTags là callback được gọi khi mutation được thực hiện
             * Nó sẽ invalidate (xóa) các tag tương ứng với các request đang chạy
             * Ví dụ: khi thêm 1 bài post thì sẽ invalidate tag 'Posts'
             * Sau đó khi gọi getPosts sẽ fetch lại dữ liệu mới nhất từ server
             */
            invalidatesTags: (result, error, body) => { // result là data trả về từ server, error là lỗi nếu có, body là body gửi lên ở argument hàm query
                return error ? [] : [{ type: 'Posts', id: 'LIST' }]
            }
        }),
        updatePost: builder.mutation<Post, Post>({
            query: ({ id, ...rest }) => ({
                url: `posts/${id}`,
                method: 'PUT',
                body: { ...rest }
            }),
            invalidatesTags: (result, error, body) => {
                return error ? [] : [{ type: 'Posts', id: body.id }]
            }
        }),
        getPostById: builder.query<Post, string>({
            query: (postId) => `posts/${postId}`,
        }),
        deletePost: builder.mutation<Post, string>({
            query: (postId) => ({
                url: `posts/${postId}`,
                method: 'DELETE'
            }),
            invalidatesTags: (result, error, postId) => {
                return [{ type: 'Posts', id: postId }]
            }
        })
    })
})

export const {
    useGetPostsQuery,
    useAddPostMutation,
    useGetPostByIdQuery,
    useUpdatePostMutation,
    useDeletePostMutation
} = blogApi
