export default class Role {
    constructor() {
        this.name = "";
        this.color = "data.color";
        this.hoist = false;
        this.permissions = 0;
        this.mentionable = false;
    }   
    
    setName(name) {
        this.name = name;
        return this;
    }

    setColor(color) {
        this.color = color;
        return this;
    }

    setHoist(hoist) {
        this.hoist = hoist;
        return this;
    }

    setMentionable(mentionable) {
        this.mentionable = mentionable;
        return this;
    }

    setPermissions(permissions) {
        this.permissions = permissions;
        return this;
    }

}