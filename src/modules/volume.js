import Vue from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable'; // https://github.com/mauricius/vue-draggable-resizable
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';

import Disposition from "./mixins/disposition.js";

export default {
  mixins: [Disposition],
  props: ['valeur'],
  components: {
    "vue-draggable-resizable": VueDraggableResizable
  },
  data: function () {
    return { volume: 1 }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', { volume: this.volume });
    },
  },
  template: `
    <vue-draggable-resizable :draggable="modifiable" :resizable="modifiable" :parent="true" :w="element.w" :h="element.h" :x="element.x" :y="element.y" @dragging="this.moving" :onDragStart="this.update_siblings_disposition" @resizing="this.moved">
      <h3>Volume</h3>
      <input v-model.number="volume" v-on:input="this.update" type="number" step="0.1">
    </vue-draggable-resizable>
  `
};
