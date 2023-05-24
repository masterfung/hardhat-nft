import pinataSDK from '@pinata/sdk'
import path from 'path'
import fs from 'fs'

export async function storeImages(imageFilePath: string) {
    const fullImagesPath = path.resolve(imageFilePath)
    const files = fs.readdirSync(fullImagesPath)
    console.log('The files are...', files)
}
