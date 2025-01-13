import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import clientPromise from '@/lib/mongodb'

function createSlug(title: string): string {
    return title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
}

interface Drama {
    title: string;
    slug: string;
    imageUrl: string;
    link: string;
    memberCount: number;
    createdAt: Date;
}


export async function GET() {
    try {
        const client = await clientPromise
        const db = client.db("reddit-clone")

        // First try to get dramas from MongoDB
        const cachedDramas = await db.collection("dramas")
            .find({})
            .sort({ memberCount: -1 })
            .toArray()

        if (cachedDramas.length > 0) {
            return NextResponse.json(cachedDramas)
        }

        // If no cached dramas, scrape and store them
        const response = await fetch('https://www.ondemandkorea.com/category/drama')
        const html = await response.text()
        const $ = cheerio.load(html)

        const dramas: Drama[] = []

        $('.ThumbnailLink').each((_, element) => {
            const link = $(element).find('a').attr('href') || ''
            const rawTitle = link.split('/').pop() || ''
            const title = rawTitle.replace(/-/g, ' ').replace(/^\w|\s\w/g, letter => letter.toUpperCase())
            const imageUrl = $(element).find('.Thumbnail img').attr('src') || ''
            const slug = createSlug(title)

            dramas.push({
                title,
                slug,
                imageUrl,
                link,
                memberCount: 0,
                createdAt: new Date()
            })
        })

        // Store dramas in MongoDB
        if (dramas.length > 0) {
            await db.collection("dramas").insertMany(dramas)
        }

        return NextResponse.json(dramas)
    } catch (error) {
        console.error('Scraping failed:', error)
        return NextResponse.json(
            { error: 'Failed to scrape dramas' },
            { status: 500 }
        )
    }
}