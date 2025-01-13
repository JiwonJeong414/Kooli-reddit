import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { slug } = params
        const client = await clientPromise
        const db = client.db("reddit-clone")

        const drama = await db.collection("dramas").findOne({ slug })

        if (!drama) {
            return NextResponse.json(
                { error: 'Drama not found' },
                { status: 404 }
            )
        }

        // Get posts for this drama
        const posts = await db.collection("posts")
            .find({ dramaSlug: slug })
            .sort({ votes: -1, createdAt: -1 })
            .toArray()

        return NextResponse.json({
            drama,
            posts
        })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to fetch drama' },
            { status: 500 }
        )
    }
}