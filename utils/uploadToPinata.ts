import pinataSDK from '@pinata/sdk'
import path from 'path'
import fs from 'fs'
import "dotenv/config"

const PINATA_API_KEY = process.env.PINATA_API_KEY
const PINATA_API_SECRET = process.env.PINATA_API_SECRET
const pinata = new pinataSDK({pinataApiKey: PINATA_API_KEY, pinataSecretApiKey: PINATA_API_SECRET})

export async function storeImages(imagesFilePath: string) {
    const fullImagesPath = path.resolve(imagesFilePath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    for (const fileIndex in files) {
        const readableStreamForFile = fs.createReadStream(`${fullImagesPath}/${files[fileIndex]}`)

        try {
            const response = await pinata.pinFileToIPFS(readableStreamForFile, {
                pinataMetadata: { name: files[fileIndex] },
            })
            responses.push(response)
        } catch (error) {
            console.log(error)
        }
    }
    return { responses, files }
}

export async function storeTokenUriMetadata(metadata) {
    const options = {
        pinataMetadata: {
            name: metadata.name,
        },
    }
    try {
        const response = await pinata.pinJSONToIPFS(metadata, options)
        return response
    } catch (error) {
        console.log(error)
    }
    return null
}
