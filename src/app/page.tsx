import PostForm from '@/components/PostForm'
import PostList from '@/components/PostList'

export default function Home() {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Reddit Clone</h1>
            <PostForm />
            <PostList />
        </div>
    )
}