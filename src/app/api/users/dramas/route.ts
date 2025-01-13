import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
    try {
        const userId = request.nextUrl.searchParams.get('userId')
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db("reddit-clone")

        // Get user with their joined dramas
        const user = await db.collection("users").findOne(
            { _id: new ObjectId(userId) },
            { projection: { joinedDramas: 1 } }
        )

        if (!user || !user.joinedDramas) {
            return NextResponse.json([])
        }

        // Get full drama details for each joined drama
        const dramas = await Promise.all(
            user.joinedDramas.map(async (membership: any) => {
                const drama = await db.collection("dramas").findOne({ slug: membership.slug })
                if (drama) {
                    return {
                        ...drama,
                        joinedAt: membership.joinedAt
                    }
                }
                return null
            })
        )

        return NextResponse.json(dramas.filter(Boolean))
    } catch (error) {
        console.error('Error fetching joined dramas:', error)
        return NextResponse.json(
            { error: 'Failed to fetch joined dramas' },
            { status: 500 }
        )
    }
}