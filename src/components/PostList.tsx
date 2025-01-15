'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Post } from '@/types'
import { ChevronUp, ChevronDown, Pencil, Trash } from 'lucide-react';

interface PostListProps {
    viewMode: 'all' | 'my-posts' | 'drama'
    currentUser: any | null
    refreshKey: number
    dramaSlug?: string
    onRestrictedAction?: (action: Function) => void
}

interface VoteStatus {
    [key: string]: 1 | -1 | null;
}

interface DramaColors {
    [key: string]: string;
}

export default function PostList({ viewMode, currentUser, refreshKey, dramaSlug, onRestrictedAction }: PostListProps) {
    const router = useRouter()
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [userVotes, setUserVotes] = useState<VoteStatus>({})
    const [dramaColors, setDramaColors] = useState<DramaColors>({})
    const [editingPost, setEditingPost] = useState<Post | null>(null)
    const [editTitle, setEditTitle] = useState('')
    const [editContent, setEditContent] = useState('')

    const fetchPosts = async () => {
        try {
            let url = '/api/posts'
            if (viewMode === 'my-posts' && currentUser) {
                url += `?userId=${currentUser.id}`
            } else if (viewMode === 'drama' && dramaSlug) {
                url += `?dramaSlug=${dramaSlug}`
            }

            const response = await fetch(url)
            const data = await response.json()
            const sortedPosts = data.sort((a: Post, b: Post) => b.votes - a.votes)
            setPosts(sortedPosts)

            if (viewMode === 'all' && currentUser) {
                const uniqueDramas = [...new Set(data.map((post: Post) => post.dramaSlug))]
                const colors: DramaColors = {}

                await Promise.all(
                    uniqueDramas.map(async (slug) => {
                        if (slug) {
                            const colorRes = await fetch(`/api/dramas/${slug}/membership?userId=${currentUser.id}`)
                            const { color } = await colorRes.json()
                            // @ts-ignore
                            colors[slug] = color
                        }
                    })
                )

                setDramaColors(colors)
            }

            if (currentUser) {
                const votes: VoteStatus = {};
                data.forEach((post: Post) => {
                    const userVote = post.voters?.find(voter => voter.userId === currentUser.id);
                    if (userVote) {
                        votes[post._id] = userVote.vote;
                    }
                });
                setUserVotes(votes);
            }
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [viewMode, currentUser?.id, refreshKey, dramaSlug])

    const handleEdit = (post: Post) => {
        if (onRestrictedAction) {
            onRestrictedAction(() => {
                setEditingPost(post)
                setEditTitle(post.title)
                setEditContent(post.content)
            })
        }
    }

    const handleCancelEdit = () => {
        setEditingPost(null)
        setEditTitle('')
        setEditContent('')
    }

    const handleSaveEdit = async (postId: string) => {
        if (onRestrictedAction) {
            onRestrictedAction(async () => {
                try {
                    const response = await fetch(`/api/posts/${postId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            title: editTitle,
                            content: editContent
                        }),
                    })

                    if (!response.ok) throw new Error('Failed to update post')

                    setEditingPost(null)
                    setEditTitle('')
                    setEditContent('')
                    await fetchPosts()
                } catch (error) {
                    console.error('Error updating post:', error)
                    alert('Failed to update post')
                }
            })
        }
    }

    const handleDelete = async (postId: string) => {
        if (onRestrictedAction) {
            onRestrictedAction(async () => {
                if (!confirm('Are you sure you want to delete this post?')) return

                try {
                    const response = await fetch(`/api/posts/${postId}`, {
                        method: 'DELETE',
                    })

                    if (!response.ok) throw new Error('Failed to delete post')
                    await fetchPosts()
                } catch (error) {
                    console.error('Error deleting post:', error)
                    alert('Failed to delete post')
                }
            })
        }
    }

    const handleVote = async (e: React.MouseEvent, postId: string, vote: 1 | -1) => {
        e.preventDefault()

        if (onRestrictedAction) {
            onRestrictedAction(async () => {
                try {
                    const newVote = userVotes[postId] === vote ? null : vote;

                    const response = await fetch('/api/posts/vote', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            postId,
                            userId: currentUser?.id,
                            vote: newVote
                        }),
                    })

                    if (!response.ok) {
                        throw new Error('Failed to vote')
                    }

                    await fetchPosts()
                } catch (error) {
                    console.error('Error voting:', error)
                }
            })
        }
    }

    if (loading) return (
        <div className="divide-y divide-gray-800">
            {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 animate-pulse">
                    <div className="h-6 bg-gray-800 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-800 rounded w-1/2 mt-3"></div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="divide-y divide-gray-800/50 rounded-lg overflow-hidden">
            {posts.map((post) => (
                <article
                    key={post._id}
                    className="hover:bg-gray-800/50 transition-colors"
                >
                    <div className="flex items-start p-4">
                        <div className="flex flex-col items-center mr-6">
                            <button
                                onClick={(e) => handleVote(e, post._id, 1)}
                                className={`${
                                    userVotes[post._id] === 1
                                        ? 'text-blue-400'
                                        : 'text-gray-500 hover:text-gray-400'
                                }`}
                            >
                                <ChevronUp size={20} />
                            </button>
                            <span className={`text-sm font-medium my-1 ${
                                userVotes[post._id] === 1 ? 'text-blue-400' :
                                    userVotes[post._id] === -1 ? 'text-red-400' :
                                        'text-gray-400'
                            }`}>
                                {post.votes}
                            </span>
                            <button
                                onClick={(e) => handleVote(e, post._id, -1)}
                                className={`${
                                    userVotes[post._id] === -1
                                        ? 'text-red-400'
                                        : 'text-gray-500 hover:text-gray-400'
                                }`}
                            >
                                <ChevronDown size={20} />
                            </button>
                        </div>

                        <div className="flex-1 min-w-0">
                            {editingPost?._id === post._id ? (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(e) => setEditTitle(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                    />
                                    <textarea
                                        value={editContent}
                                        onChange={(e) => setEditContent(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                                        rows={4}
                                    />
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleSaveEdit(post._id)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="px-4 py-2 bg-gray-700 text-white rounded"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div
                                        onClick={() => {
                                            if (onRestrictedAction) {
                                                onRestrictedAction(() => router.push(post.dramaSlug ? `/k/${post.dramaSlug}` : '/k/general'));
                                            }
                                        }}
                                        style={post.dramaSlug ? { color: dramaColors[post.dramaSlug] } : undefined}
                                        className={`text-sm font-medium hover:opacity-80 mb-2 inline-block cursor-pointer ${
                                            !post.dramaSlug ? 'text-gray-500' : ''
                                        }`}
                                    >
                                        k/{post.dramaTitle || 'general'}
                                    </div>
                                    <div
                                        onClick={() => {
                                            if (onRestrictedAction && router?.push) {
                                                onRestrictedAction(() => router.push(`/posts/${post._id}`));
                                            }
                                        }}
                                        className="block cursor-pointer"
                                    >
                                        <h2 className="text-lg text-white font-semibold leading-snug">
                                            {post.title}
                                        </h2>
                                        <p className="text-gray-400 mt-2">{post.content}</p>
                                    </div>
                                    <div className="flex items-center justify-between mt-3 text-sm text-gray-500">
                                        <div>
                                            Posted by u/{post.author?.username || 'Anonymous'} • {' '}
                                            {new Date(post.createdAt).toLocaleDateString()}
                                        </div>
                                        {currentUser?.id === post.author?.id && (
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => handleEdit(post)}
                                                    className="text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                                >
                                                    <Pencil size={14} />
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post._id)}
                                                    className="text-red-400 hover:text-red-300 flex items-center gap-1"
                                                >
                                                    <Trash size={14} />
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </article>
            ))}
            {posts.length === 0 && (
                <div className="text-center py-8">
                    <p className="text-gray-500">No posts yet</p>
                </div>
            )}
        </div>
    );
}