import fs from 'fs';
import SlurpcordError from '../errors/index.js';

export default class Attachment {
    constructor() {
        this.attachment = null;
    }

    setFile(path, filename, description = '') {
        if (!path) {
            throw new SlurpcordError('Path is required');
        }

        if (typeof path !== 'string') {
            throw new SlurpcordError('Path must be a string');
        }

        if (typeof filename !== 'string') {
            throw new SlurpcordError('Filename must be a string');
        }

        if (typeof description !== 'string') {
            throw new SlurpcordError('Description must be a string');
        }

        if (!fs.existsSync(path)) {
            throw new SlurpcordError('File does not exist');
        }

        if (!filename) {
            filename = path.split('/').pop();
        }

        this.attachment = { file: fs.createReadStream(path), filename, description };
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
