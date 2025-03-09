export default class Channel {
    constructor() {
        this.type = 0;
        this.name = "";
        this.parentId = null;
        this.permissionOverwrites = [];
    }

    setName(name) {
        this.name = name;
        return this;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    setParentId(id) {
        this.parentId = id;
        return this;
    }

    addPermissionOverwrite(overwrite) {
        this.permissionOverwrites.push(overwrite);
        return this;
    }

    removePermissionOverwrite(id) {
        this.permissionOverwrites = this.permissionOverwrites.filter(overwrite => overwrite.id !== id);
        return this;
    }
}