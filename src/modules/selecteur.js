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
    return { x: 0, y: 0 }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', { x: this.x, y: this.y });
    },
  },
  template: `
    <vue-draggable-resizable :draggable="modifiable" :resizable="modifiable" :parent="true" :w="element.w" :h="element.h" :x="element.x" :y="element.y" @dragging="this.moved" @resizing="this.moved">
      <h3>Sélecteur</h3>
      Position X
      <input v-model.number="x" v-on:input="this.update" type="number">
      Position Y
      <input v-model.number="y" v-on:input="this.update" type="number">
    </vue-draggable-resizable>
  `
};
