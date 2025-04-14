import path from 'path'
import fs from 'fs/promises'
import { CONFIG, PhotoBook, ApiResponse } from './config'

type Difference = {
    index: number;
    type: 'new' | 'changed' | 'deleted';
    left: Partial<PhotoBook> | null;
    right: Partial<PhotoBook> | null;
}

type ComparisonResult = {
    timestamp: string;
    totalDifferences: number;
    comparedProperties: (keyof PhotoBook)[];
    url1: string;
    url2: string;
    differences: Difference[];
}

// --- Konfiguration ---
const CHUNK_SIZE = CONFIG.CHUNK_SIZE // Größe der verarbeiteten Datenblöcke
const PROPS_TO_COMPARE: (keyof PhotoBook)[] = CONFIG.PROPS_TO_COMPARE // Specify the properties you want to compare

// --- Hilfsfunktionen ---
const fetchApiData = async (url: string): Promise<PhotoBook[]> => {
    try {
        console.log(`Fetching data from ${url}...`)
        const response = await fetch(url)
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json() as ApiResponse
        console.log('Raw API response structure:', Object.keys(data))
        
        const photoBooks = data.payload?.photobooks ?? []
        console.log(`Successfully fetched data. Found ${photoBooks.length} items`)
        return photoBooks
    } catch (error) {
        console.error(`Failed to fetch from ${url}:`, error)
        throw error
    }
}

const filterProperties = (
    item: PhotoBook | null, 
    props: (keyof PhotoBook)[]
): Partial<PhotoBook> | null => {
    if (!item) return null
    return props.reduce((obj: Partial<PhotoBook>, prop) => ({
        ...obj,
        [prop]: item[prop]
    }), {})
}

const getItemKey = (item: PhotoBook, props: (keyof PhotoBook)[]): string => 
    props.map(prop => item[prop]).join('|')

const hasDifferences = (
    item1: PhotoBook, 
    item2: PhotoBook, 
    props: (keyof PhotoBook)[]
): boolean => 
    props.some(prop => item1[prop] !== item2[prop])

// --- Hauptvergleich ---
const compareChunks = async (
    data1: PhotoBook[], 
    data2: PhotoBook[], 
    chunkSize: number = CONFIG.CHUNK_SIZE,
    propsToCompare: (keyof PhotoBook)[] = CONFIG.PROPS_TO_COMPARE
): Promise<Difference[]> => {
    const differences: Difference[] = []
    
    const map2 = new Map(
        data2.map((item, index) => [
            getItemKey(item, propsToCompare), 
            { item, index }
        ])
    )
    
    data1.forEach((item1, i) => {
        const key1 = getItemKey(item1, propsToCompare)
        const match = map2.get(key1)
        
        if (!match) {
            differences.push({
                index: i,
                type: 'deleted',
                left: filterProperties(item1, propsToCompare),
                right: null
            })
        } else if (hasDifferences(item1, match.item, propsToCompare)) {
            differences.push({
                index: i,
                type: 'changed',
                left: filterProperties(item1, propsToCompare),
                right: filterProperties(match.item, propsToCompare)
            })
        }
    })
    
    data2.forEach((item2, i) => {
        const key2 = getItemKey(item2, propsToCompare)
        if (!data1.some(item1 => getItemKey(item1, propsToCompare) === key2)) {
            differences.push({
                index: i,
                type: 'new',
                left: null,
                right: filterProperties(item2, propsToCompare)
            })
        }
    })
    
    return differences
}

// --- Start ---
const run = async (): Promise<void> => {
    try {
        const { URL1, URL2 } = CONFIG.URLS
        
        console.log('Fetching data from APIs...')
        const data1 = await fetchApiData(URL1)
        const data2 = await fetchApiData(URL2)

        console.log('\nStarting comparison...')
        console.time('Vergleich')
        const diffs = await compareChunks(data1, data2)
        console.timeEnd('Vergleich')

        const outputDir = 'output'
        await fs.mkdir(outputDir, { recursive: true })

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const diffsFile = path.join(outputDir, `differences_${timestamp}.json`)

        const outputData: ComparisonResult = {
            timestamp: new Date().toISOString(),
            totalDifferences: diffs.length,
            comparedProperties: CONFIG.PROPS_TO_COMPARE,
            url1: URL1,
            url2: URL2,
            differences: diffs
        }

        await fs.writeFile(diffsFile, JSON.stringify(outputData, null, 2))

        console.log('\nSummary:')
        console.log(`- Total differences: ${diffs.length}`)
        console.log(`- New items: ${diffs.filter(d => d.type === 'new').length}`)
        console.log(`- Deleted items: ${diffs.filter(d => d.type === 'deleted').length}`)
        console.log(`- Changed items: ${diffs.filter(d => d.type === 'changed').length}`)
        console.log(`\nResults written to: ${diffsFile}`)

    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error)
        process.exit(1)
    }
}

void run()
