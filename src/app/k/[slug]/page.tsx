'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostForm from '@/components/PostForm'
import PostList from '@/components/PostList'
import Link from 'next/link'
import { ArrowLeft, Users, MessageCircle, Share2 } from 'lucide-react'
import type { Drama } from '@/types'

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

interface PageProps {
    params: Promise<{ slug: string }>
}

export default function DramaCommunity({ params }: PageProps) {
    const [slug, setSlug] = useState<string>('')
    const [drama, setDrama] = useState<Drama | null>(null)
    const [user, setUser] = useState<any>(null)
    const [isMember, setIsMember] = useState(false)
    const [memberCount, setMemberCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true)
    const [refreshKey, setRefreshKey] = useState(0)
    const router = useRouter()

    const handlePostCreated = () => {
        setRefreshKey(prev => prev + 1)
    }

    useEffect(() => {
        // Resolve the slug from params
        params.then(resolvedParams => {
            setSlug(resolvedParams.slug)
        })
    }, [params])

    useEffect(() => {
        if (!slug) return // Don't fetch if slug isn't available yet

        const userData = sessionStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }

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
            <div className="min-h-screen bg-gray-900">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="animate-pulse space-y-4">
                        <div className="h-64 bg-gray-800 rounded-xl"></div>
                        <div className="h-8 bg-gray-800 w-1/3 rounded-lg"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!drama) return <div>Drama not found</div>

    return (
        <div className="min-h-screen bg-gray-900">
            <style>{customScrollbarStyle}</style>

            {/* Enhanced Header */}
            <div className="relative">
                {/* Banner Image with Better Gradient */}
                <div className="h-64 w-full relative overflow-hidden">
                    <img
                        src={drama.imageUrl}
                        alt={drama.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-gray-900"></div>
                </div>

                {/* Back Button - Absolute positioned on banner */}
                <Link
                    href="/"
                    className="absolute top-4 left-4 flex items-center text-white hover:text-blue-400 transition-colors z-10 bg-black/30 px-4 py-2 rounded-lg"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back
                </Link>

                {/* Community Info - Overlapping banner */}
                <div className="max-w-4xl mx-auto px-4">
                    <div className="relative -mt-32 pb-4">
                        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
                            <div className="flex items-end justify-between">
                                <div className="flex items-end gap-6">
                                    <img
                                        src={drama.imageUrl}
                                        alt={drama.title}
                                        className="w-32 h-32 rounded-xl border-4 border-gray-800 object-cover shadow-lg"
                                    />
                                    <div className="mb-2">
                                        <h1 className="text-3xl font-bold text-white mb-2">
                                            k/{drama.title}
                                        </h1>
                                        <div className="flex items-center gap-4 text-gray-400">
                                            <div className="flex items-center">
                                                <Users className="w-4 h-4 mr-2" />
                                                {memberCount.toLocaleString()} members
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {user && (
                                    <button
                                        onClick={handleJoinLeave}
                                        className={`px-6 py-2 rounded-lg transition-all ${
                                            isMember
                                                ? 'bg-gray-700 text-white hover:bg-gray-600'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        {isMember ? 'Joined' : 'Join Community'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="space-y-6">
                    {/* Post Form for Members */}
                    {user && isMember && (
                        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-xl overflow-hidden">
                            <div className="p-4 border-b border-gray-700">
                                <h2 className="text-lg font-semibold text-white">Create Post</h2>
                            </div>
                            <div className="p-4">
                                <PostForm
                                    user={user}
                                    dramaId={drama._id}
                                    dramaSlug={drama.slug}
                                    dramaTitle={drama.title}
                                    onPostCreated={handlePostCreated}
                                />
                            </div>
                        </div>
                    )}

                    {/* Posts or Login Prompt */}
                    {user ? (
                        <div className="space-y-4 custom-scrollbar">
                            <PostList
                                viewMode="drama"
                                currentUser={user}
                                refreshKey={refreshKey}
                                dramaSlug={slug}
                            />
                        </div>
                    ) : (
                        <div className="bg-gray-800 rounded-xl p-8 text-center border border-gray-700 shadow-xl">
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Join the Discussion
                            </h3>
                            <p className="text-gray-400 mb-6 max-w-md mx-auto">
                                Sign in to participate in this community, share your thoughts, and connect with other fans.
                            </p>
                            <Link
                                href="/login"
                                className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Log In to Participate
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}