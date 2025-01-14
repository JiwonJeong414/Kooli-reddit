'use client'

import React from 'react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, Send } from 'lucide-react'
import type { Post, Comment } from '@/types'

// Custom scrollbar style
const customScrollbarStyle = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgb(31, 41, 55);
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgb(55, 65, 81);
    border-radius: 8px;
  }
`

export default function PostDetail({ params }: { params: { id: string } }) {
    const [post, setPost] = useState<Post | null>(null)
    const [comments, setComments] = useState<Comment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [user, setUser] = useState<any>(null)
    const router = useRouter()
    // @ts-ignore
    const postId = React.use(params).id

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
        if (!newComment.trim() || isSubmitting) return

        setIsSubmitting(true)
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
            setComments(prev => [comment, ...prev])
            setNewComment('')
        } catch (error) {
            console.error('Error posting comment:', error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!post) return (
        <div className="min-h-screen bg-gray-900 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="animate-pulse space-y-4">
                    <div className="h-8 bg-gray-800 w-24 rounded"></div>
                    <div className="h-48 bg-gray-800 rounded-xl"></div>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gray-900">
            <style>{customScrollbarStyle}</style>

            {/* Enhanced Header */}
            <div className="border-b border-gray-800">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <button
                        onClick={goBack}
                        className="flex items-center text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back to Posts
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-6">
                {/* Enhanced Post Detail */}
                <article className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden mb-8">
                    <div className="p-6">
                        <h1 className="text-2xl font-bold text-white mb-4">{post.title}</h1>
                        <p className="text-gray-300 text-lg mb-6 leading-relaxed">{post.content}</p>
                        <div className="flex items-center justify-between text-gray-400 text-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                        {post.author?.username[0].toUpperCase()}
                                    </div>
                                    <span className="ml-2">{post.author?.username}</span>
                                </div>
                                <span>•</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </article>

                {/* Enhanced Comment Section */}
                <div className="space-y-6">
                    {/* Comment Form */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-700">
                            <h2 className="text-lg font-semibold text-white">Write a Comment</h2>
                        </div>
                        <form onSubmit={handleSubmitComment} className="p-4">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="What are your thoughts?"
                                className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none custom-scrollbar"
                                rows={3}
                            />
                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !newComment.trim()}
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                    Post Comment
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Comments List */}
                    <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                        <div className="p-4 border-b border-gray-700">
                            <div className="flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-blue-400" />
                                <h2 className="text-lg font-semibold text-white">
                                    Comments ({comments.length})
                                </h2>
                            </div>
                        </div>

                        <div className="divide-y divide-gray-700">
                            {comments.map((comment) => (
                                <div key={comment._id} className="p-6 hover:bg-gray-700/50 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                                            {comment.author.username[0].toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-medium text-white">
                                                    {comment.author.username}
                                                </span>
                                                <span className="text-gray-400 text-sm">•</span>
                                                <span className="text-gray-400 text-sm">
                                                    {new Date(comment.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <p className="text-gray-300">{comment.content}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {comments.length === 0 && (
                                <div className="p-8 text-center text-gray-400">
                                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                    <p className="text-lg">No comments yet</p>
                                    <p className="text-sm">Be the first to share your thoughts!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}