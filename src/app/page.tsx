import { Suspense } from 'react'
import PostList from '@/components/PostList'

export default function Home() {
  return (
      <div className="max-w-5xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Latest Posts</h1>
        <Suspense fallback={<div>Loading posts...</div>}>
          <PostList />
        </Suspense>
      </div>
  )
}