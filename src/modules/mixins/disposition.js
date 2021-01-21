export default {
  props: ['disposition'],
  data: function () {
    return { 
      element: { x: 0, y: 0, w: 1, h: 1 }
    };
  },
  methods: {
    moved: function () {
      this.$emit('update:disposition', this.calculer_disposition());
    },
    calculer_disposition: function () {
      let parent_box = this.$el.parentNode.getBoundingClientRect();
      let box = this.$el.getBoundingClientRect();

      return {
        top: (box.y - parent_box.y) / parent_box.height,
        height: box.height / parent_box.height,
        left: (box.x - parent_box.x) / parent_box.width,
        width: box.width / parent_box.width,
      };
    },
    redisposer: function () {
      let box = this.$el.parentNode.getBoundingClientRect();
      this.element.w = this.disposition.width * box.width; 
      this.element.h = this.disposition.height * box.height; 
      this.element.x = this.disposition.left * box.width; 
      this.element.y = this.disposition.top * box.height; 
    }
  },
  watch: {
    disposition: function () { this.redisposer(); }    
  },
  mounted: function () { window.setTimeout(this.redisposer, 0); }
};
