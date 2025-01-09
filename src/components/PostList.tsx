'use client'

import { useEffect, useState } from 'react'
import type { Post } from '@/types'

export default function PostList() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = async () => {
        try {
            const response = await fetch('/api/posts')
            const data = await response.json()
            setPosts(data)
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
        // Poll for new posts every 5 seconds
        const interval = setInterval(fetchPosts, 5000)
        return () => clearInterval(interval)
    }, [])

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <article key={post._id} className="bg-gray-900 p-4 rounded-lg shadow border border-gray-800">
                    <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                    <p className="text-gray-300 mt-2">{post.content}</p>
                    <div className="text-sm text-gray-400 mt-4">
                        {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                </article>
            ))}
            {posts.length === 0 && (
                <p className="text-center text-gray-400">No posts yet</p>
            )}
        </div>
    )
}