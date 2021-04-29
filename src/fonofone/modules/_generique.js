import Vue from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable'; // https://github.com/mauricius/vue-draggable-resizable
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';

import Disposition from "./mixins/disposition.js";

export default {
  mixins: [Disposition],
  data: function () { return { collapsed: false } },
  components: { "vue-draggable-resizable": VueDraggableResizable },
  template: `
    <vue-draggable-resizable class="module" :class="{collapsed: collapsed}" :draggable="modifiable" :resizable="modifiable" :parent="true" :w="element.w" :h="element.h" :x="element.x" :y="element.y" @dragging="this.moving" :onDragStart="this.update_siblings_rect" @resizing="this.moved">
        <main>
          <slot></slot>
        </main>
        <footer>
          <slot name="footer"></slot>
        </footer>
    </vue-draggable-resizable>
  `
};
