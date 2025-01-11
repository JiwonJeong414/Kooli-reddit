import { NextResponse } from 'next/server'
import * as cheerio from 'cheerio'

interface DramaInfo {
    title: string
    imageUrl: string
    link: string
}

export async function GET() {
    try {
        const response = await fetch('https://www.ondemandkorea.com/category/drama')
        const html = await response.text()

        const $ = cheerio.load(html)
        const dramas: DramaInfo[] = []

        $('.ThumbnailLink').each((_, element) => {
            const link = $(element).find('a').attr('href') || ''
            const title = link.split('/').pop()?.replace(/-/g, ' ') || ''
            const imageUrl = $(element).find('.Thumbnail img').attr('src') || ''

            dramas.push({
                title,
                imageUrl,
                link,
            })
        })

        return NextResponse.json(dramas)
    } catch (error) {
        console.error('Scraping failed:', error)
        return NextResponse.json(
            { error: 'Failed to scrape dramas' },
            { status: 500 }
        )
    }
}