export default class Embed {
    constructor() {
        this.title = null;
        this.description = null;
        this.color = null;
        this.footer = null;
        this.timestamp = null;
        this.image = null;
        this.thumbnail = null;
        this.author = null;
    }

    setTitle(title) {
        this.title = title;
        return this;
    }

    setDescription(desc) {
        this.description = desc;
        return this;
    }

    setColor(color) {
        this.color = color;
        return this;
    }

    setFooter(text, iconUrl) {
        this.footer = { text, icon_url: iconUrl };
        return this;
    }

    setTimestamp(timestamp = new Date()) {
        this.timestamp = timestamp;
        return this;
    }

    setImage(url) {
        this.image = { url };
        return this;
    }

    setThumbnail(url) {
        this.thumbnail = { url };
        return this;
    }

    setAuthor(name, iconUrl, url) {
        this.author = { name, icon_url: iconUrl, url };
        return this;
    }

    toJSON() {
        const data = {};
        if (this.title) data.title = this.title;
        if (this.description) data.description = this.description;
        if (this.color) data.color = this.color;
        if (this.footer) data.footer = this.footer;
        if (this.timestamp) data.timestamp = this.timestamp;
        if (this.image) data.image = this.image;
        if (this.thumbnail) data.thumbnail = this.thumbnail;
        if (this.author) data.author = this.author;
        return data;
    }
}
