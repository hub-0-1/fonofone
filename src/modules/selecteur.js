import Vue from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable'; // https://github.com/mauricius/vue-draggable-resizable
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';

import positionnement from "./mixins/positionnement.js";

export default {
  mixins: [positionnement],
  props: ['modeEdition', 'positionInitiale'],
  components: {
    "vue-draggable-resizable": VueDraggableResizable
  },
  data: function () {
    return {
      h: 1,
      w: 1,
      x: 0,
      y: 0,
      debut: null,
      fin: null
    }
  }, 
  methods: {
    update: function () {
      this.$emit('update', this.plage);
    },
    reposition: function () {
      let box = this.$el.parentNode.getBoundingClientRect();
      this.w = this.positionInitiale.width * box.width; 
      this.h = this.positionInitiale.height * box.height; 
      this.x = this.positionInitiale.left * box.width; 
      this.y = this.positionInitiale.top * box.height; 
    }
  },
  computed: {
    can_edit: function () {
      return this.modeEdition;
    },
    plage: function () { // TODO faire le calcul
      return {
        debut: this.debut, 
        fin: this.fin
      };
    }
  },
  mounted: function () {
    window.setTimeout(this.reposition, 0); // Hack, pourquoi?
  },
  template: `
    <vue-draggable-resizable :draggable="can_edit" :resizable="can_edit" :parent="true" :w="w" :h="h" :x="x" :y="y" @dragging="this.moved" @resizing="this.moved">
      <h3>Sélecteur</h3>
      Position X
      <input v-model.number="debut" v-on:input="this.update" type="number">
      Position Y
      <input v-model.number="fin" v-on:input="this.update" type="number">
    </vue-draggable-resizable>
  `
};
