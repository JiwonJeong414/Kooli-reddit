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
    // Generate consistent colors with good saturation and brightness
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`; // More vibrant colors
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
            // Add to user's joinedDramas array
            await db.collection("users").updateOne(
                { _id: new ObjectId(userId) },
                {
                    $addToSet: {
                        joinedDramas: {
                            slug: params.slug,
                            joinedAt: new Date(),
                            color: generateDramaColor(params.slug)
                        }
                    }
                }
            )

            // Update drama member count
            await db.collection("dramas").updateOne(
                { slug: params.slug },
                { $inc: { memberCount: 1 } }
            )
        } else if (action === 'leave') {
            // Remove from user's joinedDramas array
            await db.collection("users").updateOne(
                { _id: new ObjectId(userId) },
                {
                // @ts-ignore
                    $pull: {
                        joinedDramas: { slug: params.slug }
                    }
                }
            );

            // Update drama member count
            await db.collection("dramas").updateOne(
                { slug: params.slug },
                { $inc: { memberCount: -1 } }
            )
        }

        const color = generateDramaColor(params.slug)
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
        // Extract the slug from the request URL
        const slug = request.nextUrl.pathname.split('/').slice(-3)[0]; // Adjust based on the route structure
        const userId = request.nextUrl.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID required' },
                { status: 400 }
            );
        }

        const client = await clientPromise;
        const db = client.db("reddit-clone");

        // Check if drama exists in user's joinedDramas array
        const user = await db.collection("users").findOne({
            _id: new ObjectId(userId),
            'joinedDramas.slug': slug
        });

        // Generate color for this drama
        const color = generateDramaColor(slug);

        return NextResponse.json({
            isMember: !!user,
            color
        });
    } catch (error) {
        console.error('Error checking membership:', error);
        return NextResponse.json(
            { error: 'Failed to check membership' },
            { status: 500 }
        );
    }
}
