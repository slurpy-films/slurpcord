export default class ActionRow {
    constructor() {
      this.type = 1;
      this.components = [];
    }
  
    addButton(button) {
      this.components.push(button.toJSON());
    }
  
    toJSON() {
      return {
        type: this.type,
        components: this.components,
      };
    }
  }