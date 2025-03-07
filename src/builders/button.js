export default class Button {
    constructor(label, customId, style = 1, url = null) {
      this.type = 2;
      this.label = label || '';
      this.custom_id = customId || '';
      this.style = style || 1;
      this.url = url || null;
      
      if (this.url) {
        this.style = 5;
        this.custom_id = undefined;
      }
    }
  
    setLabel(label) {
      this.label = label;
    }
  
    setCustomId(customId) {
      this.custom_id = customId;
    }
  
    setStyle(style) {
      this.style = style;
    }
  
    setUrl(url) {
      this.url = url;
      this.style = 5;
      this.custom_id = undefined;
    }
  
    toJSON() {
      const button = {
        type: this.type,
        style: this.style,
        label: this.label,
      };
  
      if (this.custom_id) {
        button.custom_id = this.custom_id;
      }
  
      if (this.url) {
        button.url = this.url;
      }
  
      return button;
    }
  }