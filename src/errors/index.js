export default class SlurpcordError extends Error {
    constructor(message) {
        super(message);
        this.name = this.constructor.name;
    }
}
