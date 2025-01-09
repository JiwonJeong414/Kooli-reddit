'use client'

import { useEffect, useState } from 'react'
import type { Post } from '@/types'

export default function PostList() {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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

        fetchPosts()
    }, [])

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <article key={post._id} className="bg-white p-4 rounded-lg shadow">
                    <h2 className="text-xl font-semibold">{post.title}</h2>
                    <p className="text-gray-600 mt-2">{post.content}</p>
                    <div className="flex items-center mt-4 text-sm text-gray-500">
                        <span>Posted by {post.author?.username || 'Anonymous'}</span>
                        <span className="mx-2">•</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                </article>
            ))}
            {posts.length === 0 && (
                <p className="text-center text-gray-500">No posts yet</p>
            )}
        </div>
    )
}