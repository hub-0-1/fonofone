import Vue from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable';

//Vue.component('vue-draggable-resizable', VueDraggableResizable)

export default {
  extends: VueDraggableResizable,
  data: function () {
    return {
      width: 0,
      height: 0,
      x: 0,
      y: 0
    }
  },
  methods: {
    onResize: function (x, y, width, height) {
      this.x = x
      this.y = y
      this.width = width
      this.height = height

    },
    onDrag: function (x, y) {
      this.x = x
      this.y = y
    }
  },
  template: `
    <vue-draggable-resizable :w="100" :h="100" @dragging="onDrag" @resizing="onResize" :parent="true">
      <p>Hello! I'm a flexible component. You can drag me around and you can resize me.</p>
    </vue-draggable-resizable>`
};
