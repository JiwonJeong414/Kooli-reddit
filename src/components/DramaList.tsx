'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Users, Star, TrendingUp } from 'lucide-react'

interface DramaInfo {
    title: string
    imageUrl: string
    link: string
    memberCount?: number
    rating?: number
}

export default function DramaList() {
    const [dramas, setDramas] = useState<DramaInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [hoveredDrama, setHoveredDrama] = useState<number | null>(null)

    useEffect(() => {
        const fetchDramas = async () => {
            try {
                const response = await fetch('/api/dramas')
                if (!response.ok) throw new Error('Failed to fetch')
                const data = await response.json()
                setDramas(data)
            } catch (err) {
                setError('Failed to fetch dramas')
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchDramas()
    }, [])

    if (error) return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <div className="text-center space-y-4">
                <div className="text-red-400 text-xl">Error: {error}</div>
                <button
                    onClick={() => window.location.reload()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                    Try Again
                </button>
            </div>
        </div>
    )

    const categories = ['all', 'trending', 'new releases', 'classics']

    return (
        <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black">
            {/* Hero Section */}
            <div className="relative h-96 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900" />
                <img
                    src={dramas[0]?.imageUrl || '/api/placeholder/1920/1080'}
                    alt="Featured Drama"
                    className="w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="text-4xl font-bold text-white mb-4">
                            Discover K-Dramas
                        </h1>
                        <p className="text-xl text-gray-200 mb-6">
                            Explore the latest and greatest in Korean television
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Category Navigation */}
                <div className="flex items-center space-x-4 mb-8 overflow-x-auto pb-4">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-6 py-2 rounded-full capitalize whitespace-nowrap transition-all ${
                                selectedCategory === category
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                            }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Drama Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {[1, 2, 3, 4, 5, 6, 8].map((i) => (
                            <div key={i} className="animate-pulse">
                                <div className="aspect-[2/3] bg-gray-800 rounded-lg mb-4" />
                                <div className="h-4 bg-gray-800 rounded w-3/4 mb-2" />
                                <div className="h-4 bg-gray-800 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {dramas.map((drama, index) => (
                            <div
                                key={index}
                                className="group relative bg-gray-800 rounded-lg overflow-hidden shadow-lg transition-transform hover:-translate-y-1"
                                onMouseEnter={() => setHoveredDrama(index)}
                                onMouseLeave={() => setHoveredDrama(null)}
                            >
                                <div className="aspect-[2/3] relative overflow-hidden">
                                    <img
                                        src={drama.imageUrl}
                                        alt={drama.title}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                    {/* Hover Content */}
                                    <div className={`absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
                                        <a
                                            href={`https://www.ondemandkorea.com${drama.link}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-2"
                                        >
                                            <span>View Details</span>
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                </div>

                                <div className="p-4">
                                    <h2 className="font-semibold text-lg text-white capitalize mb-2">
                                        {drama.title}
                                    </h2>
                                    <div className="flex items-center justify-between text-sm text-gray-400">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 mr-1" />
                                            <span>{drama.memberCount?.toLocaleString() || '0'} members</span>
                                        </div>
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 mr-1 text-yellow-500" />
                                            <span>{drama.rating || '4.5'}</span>
                                        </div>
                                    </div>
                                    {hoveredDrama === index && (
                                        <div className="mt-4 pt-4 border-t border-gray-700">
                                            <div className="flex items-center text-green-400">
                                                <TrendingUp className="w-4 h-4 mr-1" />
                                                <span className="text-sm">Trending Now</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    )
}