import { useGetPostsQuery } from 'pages/blog/blog.services'
import PostItem from '../PostItem'
import { Fragment } from 'react'
import SkeletonPost from '../SkeletonPost'
import { useAppDispatch } from 'store'
import { startEditPost } from 'pages/blog/blog.slice'
import { useDeletePostMutation } from 'pages/blog/blog.services'

export default function PostList() {
    const { data, isLoading, isFetching } = useGetPostsQuery()
    const dispatch = useAppDispatch()
    const [deletePost, deletePostResult] = useDeletePostMutation()

    const handleStartEditPost = (postId: string) => {
        dispatch(startEditPost(postId))
    }

    const handleDeletePost = async (postId: string) => {
        await deletePost(postId).unwrap()
    }

    return (
        <div className='bg-white py-6 sm:py-8 lg:py-12'>
            <div className='mx-auto max-w-screen-xl px-4 md:px-8'>
                <div className='mb-10 md:mb-16'>
                    <h2 className='mb-4 text-center text-2xl font-bold text-gray-800 md:mb-6 lg:text-3xl'>
                        Được Dev Blog
                    </h2>
                    <p className='mx-auto max-w-screen-md text-center text-gray-500 md:text-lg'>
                        Đừng bao giờ từ bỏ. Hôm nay khó khăn, ngày mai sẽ trở nên tồi tệ. Nhưng ngày mốt sẽ có nắng
                    </p>
                </div>
                <div className='grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-2 xl:grid-cols-2 xl:gap-8'>
                    {isFetching && (
                        <Fragment>
                            <SkeletonPost />
                            <SkeletonPost />
                            <SkeletonPost />
                            <SkeletonPost />
                        </Fragment>
                    )}
                    {!isFetching &&
                        data &&
                        data.map((post) => (
                            <PostItem
                                key={post.id}
                                post={post}
                                onStartEdit={handleStartEditPost}
                                onDelete={handleDeletePost}
                            />
                        ))}
                </div>
            </div>
        </div>
    )
}
