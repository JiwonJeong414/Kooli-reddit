import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const userId = request.nextUrl.searchParams.get('userId')
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 400 })
        }

        const client = await clientPromise
        const db = client.db("reddit-clone")

        const membership = await db.collection("drama_members").findOne({
            dramaSlug: params.slug,
            userId: userId
        })

        return NextResponse.json({ isMember: !!membership })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to check membership' },
            { status: 500 }
        )
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    try {
        const { userId, action } = await request.json()
        const client = await clientPromise
        const db = client.db("reddit-clone")

        if (action === 'join') {
            await db.collection("drama_members").insertOne({
                dramaSlug: params.slug,
                userId,
                joinedAt: new Date()
            })

            // Increment member count
            await db.collection("dramas").updateOne(
                { slug: params.slug },
                { $inc: { memberCount: 1 } }
            )
        } else if (action === 'leave') {
            await db.collection("drama_members").deleteOne({
                dramaSlug: params.slug,
                userId
            })

            // Decrement member count
            await db.collection("dramas").updateOne(
                { slug: params.slug },
                { $inc: { memberCount: -1 } }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        return NextResponse.json(
            { error: 'Failed to update membership' },
            { status: 500 }
        )
    }
}