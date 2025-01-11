'use client'

import { useState, useEffect } from 'react'

interface DramaInfo {
    title: string
    imageUrl: string
    link: string
}

export default function DramaList() {
    const [dramas, setDramas] = useState<DramaInfo[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

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

    if (loading) return <div>Loading...</div>
    if (error) return <div>Error: {error}</div>

    return (
        <main className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Korean Dramas</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {dramas.map((drama, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden shadow-lg">
                        <img
                            src={drama.imageUrl}
                            alt={drama.title}
                            className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                            <h2 className="font-semibold text-lg capitalize">{drama.title}</h2>
                            <a
                                href={`https://www.ondemandkorea.com${drama.link}`}
                                className="text-blue-500 hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View Details
                            </a>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    )
}