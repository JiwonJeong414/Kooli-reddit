'use client'

import { useEffect, useState } from 'react'
import type { Post } from '@/types'

interface PostListProps {
    viewMode: 'all' | 'my-posts'
    currentUser: any
}

export default function PostList({ viewMode, currentUser }: PostListProps) {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)

    const fetchPosts = async () => {
        try {
            const url = viewMode === 'my-posts'
                ? `/api/posts?userId=${currentUser.id}`
                : '/api/posts'
            const response = await fetch(url)
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
    }, [viewMode, currentUser.id])

    const handleVote = async (postId: string, vote: 1 | -1) => {
        try {
            const response = await fetch('/api/posts/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId,
                    userId: currentUser.id,
                    vote
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to vote')
            }

            await fetchPosts()
        } catch (error) {
            console.error('Error voting:', error)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <article key={post._id} className="bg-gray-900 p-4 rounded-lg shadow border border-gray-800">
                    <div className="flex">
                        <div className="flex flex-col items-center mr-4">
                            <button
                                onClick={() => handleVote(post._id, 1)}
                                className="text-gray-400 hover:text-blue-500"
                            >
                                ▲
                            </button>
                            <span className="text-white my-1">{post.votes}</span>
                            <button
                                onClick={() => handleVote(post._id, -1)}
                                className="text-gray-400 hover:text-red-500"
                            >
                                ▼
                            </button>
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold text-white">{post.title}</h2>
                            <p className="text-gray-300 mt-2">{post.content}</p>
                            <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
                                <div>Posted by {post.author?.username || 'Anonymous'}</div>
                                <div>{new Date(post.createdAt).toLocaleDateString()}</div>
                            </div>
                        </div>
                    </div>
                </article>
            ))}
            {posts.length === 0 && (
                <p className="text-center text-gray-400">No posts yet</p>
            )}
        </div>
    )
}