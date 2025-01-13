'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostForm from '@/components/PostForm'
import PostList from '@/components/PostList'
import Link from 'next/link'
import type { Drama } from '@/types'

export default function DramaCommunity({ params }: { params: { slug: string } }) {
    // @ts-ignore
    const { slug } = React.use(params)

    const [drama, setDrama] = useState<Drama | null>(null)
    const [user, setUser] = useState<any>(null)
    const [isMember, setIsMember] = useState(false)
    const [memberCount, setMemberCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const router = useRouter()

    // Function to refresh posts
    const handlePostCreated = () => {
        setRefreshKey(prev => prev + 1)
    }

    useEffect(() => {
        // Load user data
        const userData = sessionStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }

        // Fetch drama details and member status
        const fetchDramaDetails = async () => {
            try {
                if (!userData) {
                    setIsLoading(false)
                    return
                }

                const userObj = JSON.parse(userData)
                const [dramaRes, membershipRes] = await Promise.all([
                    fetch(`/api/dramas/${slug}`),
                    fetch(`/api/dramas/${slug}/membership?userId=${userObj.id}`)
                ])

                const dramaData = await dramaRes.json()
                const membershipData = await membershipRes.json()

                setDrama(dramaData)
                setMemberCount(dramaData.memberCount || 0)
                setIsMember(membershipData.isMember)
                setIsLoading(false)
            } catch (error) {
                console.error('Error:', error)
                setIsLoading(false)
            }
        }

        fetchDramaDetails()
    }, [slug])

    const handleJoinLeave = async () => {
        if (!user) {
            router.push('/login')
            return
        }

        try {
            const response = await fetch(`/api/dramas/${slug}/membership`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userId: user.id,
                    action: isMember ? 'leave' : 'join'
                })
            })

            if (response.ok) {
                setIsMember(!isMember)
                setMemberCount(prev => isMember ? prev - 1 : prev + 1)
            }
        } catch (error) {
            console.error('Error:', error)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-48 bg-gray-800 rounded-lg"></div>
                        <div className="h-8 bg-gray-800 w-1/3 rounded"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!drama) return <div>Drama not found</div>

    return (
        <div className="min-h-screen bg-black py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Community Header */}
                <div className="bg-gray-900 rounded-lg overflow-hidden mb-8">
                    {/* Banner Image */}
                    <div className="h-48 w-full relative">
                        <img
                            src={drama.imageUrl}
                            alt={drama.title}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900"></div>
                    </div>

                    {/* Community Info */}
                    <div className="p-6 -mt-16 relative">
                        <div className="flex items-center justify-between">
                            <div className="flex items-end space-x-4">
                                <img
                                    src={drama.imageUrl}
                                    alt={drama.title}
                                    className="w-24 h-24 rounded-lg border-4 border-gray-900 object-cover"
                                />
                                <div>
                                    <h1 className="text-3xl font-bold text-white">k/{drama.title}</h1>
                                    <p className="text-gray-400">{memberCount.toLocaleString()} members</p>
                                </div>
                            </div>
                            {user && (
                                <button
                                    onClick={handleJoinLeave}
                                    className={`px-6 py-2 rounded-full transition-colors ${
                                        isMember
                                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                                            : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                                >
                                    {isMember ? 'Joined' : 'Join'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Post Form - Only show for members */}
                {user && isMember && (
                    <PostForm
                        user={user}
                        dramaId={drama._id}
                        dramaSlug={drama.slug}
                        dramaTitle={drama.title}
                        onPostCreated={handlePostCreated}
                    />
                )}

                {/* Posts */}
                {user ? (
                    <div className="space-y-4">
                        <PostList
                            viewMode="drama"
                            currentUser={user}
                            refreshKey={refreshKey}
                            dramaSlug={slug}
                        />
                    </div>
                ) : (
                    <div className="text-center bg-gray-900 rounded-lg p-8 mt-8">
                        <h3 className="text-xl font-semibold text-white mb-4">Join the Conversation!</h3>
                        <p className="text-gray-400 mb-6">Sign in to participate in this community</p>
                        <Link
                            href="/login"
                            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-full hover:bg-blue-700 transition-colors"
                        >
                            Log In
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}