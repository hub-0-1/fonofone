import Vue from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable'; // https://github.com/mauricius/vue-draggable-resizable
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';

import Disposition from "./mixins/disposition.js";

export default {
  mixins: [Disposition],
  components: {
    "vue-draggable-resizable": VueDraggableResizable
  },
  template: `
    <vue-draggable-resizable :draggable="modifiable" :resizable="modifiable" :parent="true" :w="element.w" :h="element.h" :x="element.x" :y="element.y" @dragging="this.moving" :onDragStart="this.update_siblings_disposition" @resizing="this.moved">
      <slot></slot>
    </vue-draggable-resizable>
  `
};
