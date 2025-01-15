import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import clientPromise from '@/lib/mongodb'
import { ObjectId } from 'mongodb'

// Function to generate consistent color based on drama slug
function generateDramaColor(slug: string): string {
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = slug.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
}

export async function POST(request: NextRequest) {
    try {
        const { userId, action } = await request.json()
        // Get slug from URL pattern
        const slug = request.nextUrl.pathname.split('/')[3] // Assuming path is /api/dramas/[slug]/membership

        const client = await clientPromise
        const db = client.db("reddit-clone")

        if (action === 'join') {
            await db.collection("users").updateOne(
                { _id: new ObjectId(userId) },
                {
                    $addToSet: {
                        joinedDramas: {
                            slug,
                            joinedAt: new Date(),
                            color: generateDramaColor(slug)
                        }
                    }
                }
            )

            await db.collection("dramas").updateOne(
                { slug },
                { $inc: { memberCount: 1 } }
            )
        } else if (action === 'leave') {
            await db.collection("users").updateOne(
                { _id: new ObjectId(userId) },
                {
                    $pull: {
                        joinedDramas: { slug } as any
                    }
                }
            );

            await db.collection("dramas").updateOne(
                { slug },
                { $inc: { memberCount: -1 } }
            )
        }

        const color = generateDramaColor(slug)
        return NextResponse.json({ success: true, color })
    } catch (error) {
        console.error('Membership error:', error)
        return NextResponse.json(
            { error: 'Failed to update membership' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        // Get slug from URL pattern
        const slug = request.nextUrl.pathname.split('/')[3] // Assuming path is /api/dramas/[slug]/membership

        const userId = request.nextUrl.searchParams.get('userId')
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 400 }
            )
        }

        const client = await clientPromise
        const db = client.db("reddit-clone")

        const user = await db.collection("users").findOne({
            _id: new ObjectId(userId),
            'joinedDramas.slug': slug
        })

        const color = generateDramaColor(slug)

        return NextResponse.json({
            isMember: !!user,
            color
        })
    } catch (error) {
        console.error('Error checking membership:', error)
        return NextResponse.json(
            { error: 'Failed to check membership' },
            { status: 500 }
        )
    }
}

export const dynamic = 'force-dynamic'