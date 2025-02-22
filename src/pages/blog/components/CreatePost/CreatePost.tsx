import classNames from 'classnames'
import { useAddPostMutation, useGetPostByIdQuery, useUpdatePostMutation } from 'pages/blog/blog.services'
import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from 'store'
import { Post } from 'types/blog.type'
import { isEntityError } from 'utils/helpers'

const initialState: Omit<Post, 'id'> = {
    description: '',
    featuredImage: '',
    publishDate: '',
    published: false,
    title: ''
}

type FormError =
    | {
          [key in keyof typeof initialState]: string
      }
    | null

export default function CreatePost() {
    const [formData, setFormData] = useState<Omit<Post, 'id'> | Post>(initialState)
    const [addPost, addPostResult] = useAddPostMutation()
    const [updatePost, updatePostResult] = useUpdatePostMutation()
    const { postId } = useSelector((state: RootState) => state.blog)
    const { data: post } = useGetPostByIdQuery(postId, { skip: !postId })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        try {
            if (postId) {
                await updatePost(formData as Post).unwrap()
            } else {
                await addPost(formData as Omit<Post, 'id'>).unwrap()
            }
            setFormData(initialState)
        } catch (error) {
            console.log(error)
        }
    }

    const errorForm: FormError = useMemo(() => {
        const errorResult = postId ? updatePostResult.error : addPostResult.error
        // Vì errorResult có thể là FetchBaseQueryError | SerializedError | undefined, mỗi kiểu lại có cấu trúc khác nhau
        // nên chúng ta cần kiểm tra để hiển thị cho đúng
        /**
         * Bởi vì error Result đang có kiểu là FetchBaseQueryError | SerializedError | undefined vậy nên chúng ta cần kiểm tra
         * để lấy được kiểu dữ liệu chính xác. Có vài cách,
         * C1. Dùng as để ép kiểu, có cách dùng instanceof để kiểm tra. VD:
         * const errorTypeFetchBaseQueryError = errorResult as FetchBaseQueryError
         * if (errorTypeFetchBaseQueryError) {}
         *
         * C2. Dùng "type predicate" để kiểm tra và thu hẹp kiểu của biến có khai báo trong utils
         */
        if (isEntityError(errorResult)) {
            return errorResult.data.error as FormError
        }
        return null
    }, [postId, addPostResult.error, updatePostResult.error])

    useEffect(() => {
        if (post) {
            setFormData(post)
        }
    }, [post])

    return (
        <form onSubmit={handleSubmit}>
            <div className='mb-6'>
                <label htmlFor='title' className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300'>
                    Title
                </label>
                <input
                    type='text'
                    id='title'
                    name='title'
                    className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500'
                    placeholder='Title'
                    required
                    value={formData.title}
                    onChange={handleChange}
                />
            </div>
            <div className='mb-6'>
                <label
                    htmlFor='featuredImage'
                    className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300'
                >
                    Featured Image
                </label>
                <input
                    type='text'
                    id='featuredImage'
                    name='featuredImage'
                    className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500'
                    placeholder='Url image'
                    required
                    value={formData.featuredImage}
                    onChange={handleChange}
                />
            </div>
            <div className='mb-6'>
                <div>
                    <label
                        htmlFor='description'
                        className='mb-2 block text-sm font-medium text-gray-900 dark:text-gray-400'
                    >
                        Description
                    </label>
                    <textarea
                        id='description'
                        rows={3}
                        name='description'
                        className='block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-blue-500'
                        placeholder='Your description...'
                        required
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>
            </div>
            <div className='mb-6'>
                <label
                    htmlFor='publishDate'
                    className={classNames('mb-2 block text-sm font-medium', {
                        'text-red-500': Boolean(errorForm?.publishDate),
                        'text-gray-900 dark:text-gray-300': !Boolean(errorForm?.publishDate)
                    })}
                >
                    Publish Date
                </label>
                <input
                    type='datetime-local'
                    id='publishDate'
                    className={classNames('block w-56 rounded-lg border  p-2.5 text-sm  focus:outline-none ', {
                        'border-red-500 bg-red-50 text-red-900 placeholder-red-700 focus:border-red-500 focus:ring-blue-500':
                            Boolean(errorForm?.publishDate),
                        'border-gray-300 bg-gray-50 text-gray-900 focus:border-blue-500 focus:ring-blue-500': Boolean(
                            errorForm?.publishDate
                        )
                    })}
                    required
                    value={formData.publishDate}
                    onChange={(event) => setFormData((prev) => ({ ...prev, publishDate: event.target.value }))}
                />
                {errorForm?.publishDate && (
                    <p className='mt-2 text-sm text-red-600'>
                        <span className='font-medium'>Lỗi! </span>
                        {errorForm.publishDate}
                    </p>
                )}
            </div>
            <div className='mb-6 flex items-center'>
                <input
                    id='published'
                    name='published'
                    type='checkbox'
                    className='h-4 w-4 focus:ring-2 focus:ring-blue-500'
                    checked={formData.published}
                    onChange={(e) => setFormData((prev) => ({ ...prev, published: e.target.checked }))}
                />
                <label htmlFor='published' className='ml-2 text-sm font-medium text-gray-900'>
                    Publish
                </label>
            </div>
            <div>
                {Boolean(postId) ? (
                    <>
                        <button
                            type='submit'
                            className='group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-teal-300 to-lime-300 p-0.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-lime-200 group-hover:from-teal-300 group-hover:to-lime-300 dark:text-white dark:hover:text-gray-900 dark:focus:ring-lime-800'
                        >
                            <span className='relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900'>
                                Update Post
                            </span>
                        </button>
                        <button
                            type='reset'
                            className='group relative mb-2 mr-2 inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-red-200 via-red-300 to-yellow-200 p-0.5 text-sm font-medium text-gray-900 focus:outline-none focus:ring-4 focus:ring-red-100 group-hover:from-red-200 group-hover:via-red-300 group-hover:to-yellow-200 dark:text-white dark:hover:text-gray-900 dark:focus:ring-red-400'
                        >
                            <span className='relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900'>
                                Cancel
                            </span>
                        </button>
                    </>
                ) : (
                    <button
                        className='group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 p-0.5 text-sm font-medium text-gray-900 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 group-hover:from-purple-600 group-hover:to-blue-500 dark:text-white dark:focus:ring-blue-800'
                        type='submit'
                    >
                        <span className='relative rounded-md bg-white px-5 py-2.5 transition-all duration-75 ease-in group-hover:bg-opacity-0 dark:bg-gray-900'>
                            Publish Post
                        </span>
                    </button>
                )}
            </div>
        </form>
    )
}
