export default class Embed {
    setTitle(title) {
        this.title = title;
    }

    setDescription(desc) {
        this.description = desc;
    }

    setColor(color) {
        this.color = color;
    }

    toJSON() {
        const data = {};
        if (this.title) data.title = this.title;
        if (this.description) data.description = this.description;
        if (this.color) data.color = this.color;
        return data;
    }
}