import Vue from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable'; // https://github.com/mauricius/vue-draggable-resizable
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';

import Disposition from "./mixins/disposition.js";

export default {
  props: ['module', 'collapsed'],
  mixins: [Disposition],
  data: function () {
    return {
      is_collapsed: this.collapsed
    }
  },
  components: {
    "vue-draggable-resizable": VueDraggableResizable
  },
  methods: {
    update_collapsed: function () {
      this.is_collapsed = !this.is_collapsed;
      this.$emit('update:collapsed', this.is_collapsed);
    }
  },
  template: `
    <vue-draggable-resizable :draggable="modifiable" :resizable="modifiable" :parent="true" :w="element.w" :h="element.h" :x="element.x" :y="element.y" @dragging="this.moving" :onDragStart="this.update_siblings_disposition" @resizing="this.moved">
      <header>
        <h2>{{ module }}</h2>
        <img src="#" @click="this.update_collapsed">
      </header>
        <main v-show="!collapsed">
          <slot></slot>
        </main>
      <footer></footer>
    </vue-draggable-resizable>
  `
};
