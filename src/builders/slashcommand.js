export default class SlashCommand {
    constructor() {
        this.name = '';
        this.description = '';
        this.options = [];
        this.defaultPermission = true;
        this.type = 1;
    }

    setName(name) {
        this.name = name;
        return this;
    }

    setDescription(desc) {
        this.description = desc;
        return this;
    }

    setDefaultPermission(value) {
        this.defaultPermission = value;
        return this;
    }

    addOption(builder) {
        const option = new SlashCommandOption();
        builder(option);
        this.options.push(option.toJSON());
        return this;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    toJSON() {
        return {
            name: this.name,
            description: this.description,
            options: this.options,
            default_permission: this.defaultPermission,
            type: this.type
        };
    }
} 

class SlashCommandOption {
    constructor() {
        this.name = '';
        this.description = '';
        this.type = 3; // Default STRING
        this.required = false;
        this.choices = [];
    }

    setName(name) {
        this.name = name;
        return this;
    }

    setDescription(desc) {
        this.description = desc;
        return this;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    setRequired(value) {
        this.required = value;
        return this;
    }

    addChoice(name, value) {
        this.choices.push({ name, value });
        return this;
    }

    toJSON() {
        return {
            name: this.name,
            description: this.description,
            type: this.type,
            required: this.required,
            choices: this.choices
        };
    }
}
