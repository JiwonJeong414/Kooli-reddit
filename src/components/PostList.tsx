'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Post } from '@/types'

interface PostListProps {
    viewMode: 'all' | 'my-posts' | 'drama'  // Added 'drama' mode
    currentUser: any
    refreshKey: number
    dramaSlug?: string  // Optional prop for drama-specific posts
}

interface VoteStatus {
    [key: string]: 1 | -1 | null;
}

export default function PostList({ viewMode, currentUser, refreshKey, dramaSlug }: PostListProps) {
    const [posts, setPosts] = useState<Post[]>([])
    const [loading, setLoading] = useState(true)
    const [userVotes, setUserVotes] = useState<VoteStatus>({})

    const fetchPosts = async () => {
        try {
            let url = '/api/posts'

            // Determine the URL based on viewMode and dramaSlug
            if (viewMode === 'my-posts') {
                url += `?userId=${currentUser.id}`
            } else if (viewMode === 'drama' && dramaSlug) {
                url += `?dramaSlug=${dramaSlug}`
            }

            const response = await fetch(url)
            const data = await response.json()
            setPosts(data)

            // Create a map of user's votes
            const votes: VoteStatus = {};
            data.forEach((post: Post) => {
                const userVote = post.voters?.find(voter => voter.userId === currentUser.id);
                if (userVote) {
                    votes[post._id] = userVote.vote;
                }
            });
            setUserVotes(votes);
        } catch (error) {
            console.error('Error fetching posts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchPosts()
    }, [viewMode, currentUser.id, refreshKey, dramaSlug])

    const handleVote = async (e: React.MouseEvent, postId: string, vote: 1 | -1) => {
        e.preventDefault()

        try {
            // If clicking the same vote button, we're removing the vote
            const newVote = userVotes[postId] === vote ? null : vote;

            const response = await fetch('/api/posts/vote', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    postId,
                    userId: currentUser.id,
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
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="space-y-4">
            {posts.map((post) => (
                <article key={post._id} className="bg-gray-900 p-4 rounded-lg shadow border border-gray-800 hover:border-gray-700 transition-colors">
                    <div className="flex">
                        <div className="flex flex-col items-center mr-4">
                            <button
                                onClick={(e) => handleVote(e, post._id, 1)}
                                className={`transition-colors ${
                                    userVotes[post._id] === 1
                                        ? 'text-blue-500'
                                        : 'text-gray-400 hover:text-blue-500'
                                }`}
                            >
                                ▲
                            </button>
                            <span className={`my-1 font-bold ${
                                userVotes[post._id] === 1 ? 'text-blue-500' :
                                    userVotes[post._id] === -1 ? 'text-red-500' :
                                        'text-white'
                            }`}>
                                {post.votes}
                            </span>
                            <button
                                onClick={(e) => handleVote(e, post._id, -1)}
                                className={`transition-colors ${
                                    userVotes[post._id] === -1
                                        ? 'text-red-500'
                                        : 'text-gray-400 hover:text-red-500'
                                }`}
                            >
                                ▼
                            </button>
                        </div>
                        <Link href={`/posts/${post._id}`} className="flex-1 cursor-pointer">
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-white hover:text-blue-400">
                                    {post.title}
                                </h2>
                                {/* Show drama info if we're not in drama-specific view */}
                                {viewMode !== 'drama' && post.dramaTitle && (
                                    <Link
                                        href={`/k/${post.dramaSlug}`}
                                        className="text-sm text-blue-400 hover:text-blue-300 mt-1 block"
                                    >
                                        in k/{post.dramaTitle}
                                    </Link>
                                )}
                                <p className="text-gray-300 mt-2">{post.content}</p>
                                <div className="flex items-center justify-between text-sm text-gray-400 mt-4">
                                    <div>Posted by {post.author?.username || 'Anonymous'}</div>
                                    <div>{new Date(post.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        </Link>
                    </div>
                </article>
            ))}
            {posts.length === 0 && (
                <p className="text-center text-gray-400">
                    {viewMode === 'drama'
                        ? 'No posts in this drama yet. Be the first to post!'
                        : viewMode === 'my-posts'
                            ? 'You haven\'t created any posts yet'
                            : 'No posts yet'}
                </p>
            )}
        </div>
    )
}