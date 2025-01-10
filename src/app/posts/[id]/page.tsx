'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Post, Comment } from '@/types'

export default function PostDetail({ params }: { params: { id: string } }) {
    const [post, setPost] = useState<Post | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    // @ts-ignore
    const postId = React.use(params).id  // Fix for the params warning

    const goBack = () => {
        router.back()
    }

    useEffect(() => {
        const userData = sessionStorage.getItem('user')
        if (!userData) {
            router.push('/login')
        } else {
            setUser(JSON.parse(userData))
        }

        // Fetch post and comments
        const fetchData = async () => {
            try {
                const [postRes, commentsRes] = await Promise.all([
                    fetch(`/api/posts/${postId}`),
                    fetch(`/api/comments?postId=${postId}`)
                ])

                if (!postRes.ok || !commentsRes.ok) throw new Error('Failed to fetch')

                const postData = await postRes.json()
                const commentsData = await commentsRes.json()

                setPost(postData)
                setComments(commentsData)
            } catch (error) {
                console.error('Error:', error)
            }
        }

        fetchData()
    }, [postId, router])

    const handleSubmitComment = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim()) return

        try {
            const response = await fetch('/api/comments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content: newComment,
                    postId: postId,
                    author: {
                        id: user.id,
                        username: user.username
                    }
                }),
            })

            if (!response.ok) throw new Error('Failed to post comment')

            const comment = await response.json()
            setComments(prev => [...prev, comment])
            setNewComment('')
        } catch (error) {
            console.error('Error posting comment:', error)
        }
    }

    if (!post) return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-black py-8">
            <div className="max-w-4xl mx-auto px-4">
                <button
                    onClick={goBack}
                    className="text-blue-400 hover:text-blue-300 mb-4 flex items-center"
                >
                    <span className="mr-2">←</span> Back
                </button>

                {/* Post Detail */}
                <article className="bg-gray-900 p-6 rounded-lg shadow border border-gray-800 mb-8">
                    <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>
                    <p className="text-gray-300 text-lg mb-4">{post.content}</p>
                    <div className="text-gray-400 text-sm">
                        Posted by {post.author?.username} • {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                </article>

                {/* Comment Form */}
                <form onSubmit={handleSubmitComment} className="mb-8">
          <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-4 bg-gray-900 border border-gray-800 rounded-lg text-white mb-2"
              rows={3}
          />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Post Comment
                    </button>
                </form>

                {/* Comments List */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-white mb-4">Comments ({comments.length})</h2>
                    {comments.map((comment) => (
                        <div key={comment._id} className="bg-gray-900 p-4 rounded-lg border border-gray-800">
                            <p className="text-gray-300">{comment.content}</p>
                            <div className="text-gray-400 text-sm mt-2">
                                {comment.author.username} • {new Date(comment.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-gray-400 text-center">No comments yet</p>
                    )}
                </div>
            </div>
        </div>
    )
}