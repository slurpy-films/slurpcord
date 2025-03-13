import fs from 'fs';

export default class Attachment {
    constructor() {
        this.attachment = null;
    }

    setFile(file, filename, description = '') {
        this.attachment = { file, filename, description };
        return this;
    }

    clearFile() {
        this.attachment = null;
        return this;
    }

    async toJSON() {
        if (this.attachment) {
            const { file, filename, description } = this.attachment;
            let fileBuffer;

            if (file instanceof fs.ReadStream) {
                fileBuffer = await new Promise((resolve, reject) => {
                    let chunks = [];
                    file.on('data', chunk => chunks.push(chunk));
                    file.on('end', () => resolve(Buffer.concat(chunks)));
                    file.on('error', reject);
                });
            } else {
                fileBuffer = fs.readFileSync(file);
            }

            return {
                filename,
                description,
                file: fileBuffer
            };
        }

        return null;
    }
}
