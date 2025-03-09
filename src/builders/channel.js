export default class Channel {
    constructor() {
        this.type = 0;
        this.name = "";
        this.parentId = null;
        this.permissionOverwrites = [];
    }

    setName(name) {
        this.name = name;
    }

    setType(type) {
        this.type = type;
    }

    setParentId(id) {
        this.parentId = id;
    }

    addPermissionOverwrite(overwrite) {
        this.permissionOverwrites.push(overwrite);
    }

    removePermissionOverwrite(id) {
        this.permissionOverwrites = this.permissionOverwrites.filter(overwrite => overwrite.id !== id);
    }
}