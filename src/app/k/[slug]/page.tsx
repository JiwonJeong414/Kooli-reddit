'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PostForm from '@/components/PostForm'
import PostList from '@/components/PostList'
import type { Drama } from '@/types'

export default function DramaCommunity({ params }: { params: { slug: string } }) {
    // Fix the params warning by using React.use()
    // @ts-ignore
    const { slug } = React.use(params)

    const [drama, setDrama] = useState<Drama | null>(null)
    const [user, setUser] = useState<any>(null)
    const [isMember, setIsMember] = useState(false)
    const [memberCount, setMemberCount] = useState(0)
    const router = useRouter()

    useEffect(() => {
        // Load user data
        const userData = sessionStorage.getItem('user')
        if (userData) {
            setUser(JSON.parse(userData))
        }

        // Fetch drama details and member status
        const fetchDramaDetails = async () => {
            try {
                const [dramaRes, membershipRes] = await Promise.all([
                    fetch(`/api/dramas/${slug}`),
                    userData ? fetch(`/api/dramas/${slug}/membership?userId=${JSON.parse(userData).id}`) : null
                ])

                const dramaData = await dramaRes.json()
                setDrama(dramaData)
                setMemberCount(dramaData.memberCount || 0)

                if (membershipRes) {
                    const { isMember } = await membershipRes.json()
                    setIsMember(isMember)
                }
            } catch (error) {
                console.error('Error:', error)
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

    if (!drama) return <div>Loading...</div>

    return (
        <div className="min-h-screen bg-black py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Community Header */}
                <div className="bg-gray-900 rounded-lg p-6 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <img
                                src={drama.imageUrl}
                                alt={drama.title}
                                className="w-16 h-16 rounded-full object-cover"
                            />
                            <div>
                                <h1 className="text-2xl font-bold text-white">k/{drama.title}</h1>
                                <p className="text-gray-400">{memberCount.toLocaleString()} members</p>
                            </div>
                        </div>
                        {user && (
                            <button
                                onClick={handleJoinLeave}
                                className={`px-4 py-2 rounded-full ${
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

                {/* Post Form - Only show for members */}
                {user && isMember && (
                    <PostForm
                        user={user}
                        dramaId={drama._id}
                        dramaSlug={drama.slug}
                        dramaTitle={drama.title}
                        onPostCreated={() => {}}
                    />
                )}

                {/* Posts */}
                {user ? (
                    <PostList
                        viewMode="drama"
                        currentUser={user}
                        refreshKey={0}
                        dramaSlug={slug}
                    />
                ) : (
                    <div className="text-center text-gray-400 py-8">
                        Please login to view and interact with posts
                    </div>
                )}
            </div>
        </div>
    )
}