import Vue from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable'; // https://github.com/mauricius/vue-draggable-resizable
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';

import positionnement from "./mixins/positionnement.js";

export default {
  mixins: [positionnement],
  props: ['modeEdition'],
  components: {
    "vue-draggable-resizable": VueDraggableResizable
  },
  data: function () {
    return {
      x: null,
      y: null
    }
  }, 
  methods: {
    update: function () {
      this.$emit('update', this.plage);
    }
  },
  computed: {
    can_edit: function () {
      return this.modeEdition;
    },
    plage: function () { // TODO faire le calcul
      return {
        debut: this.x, 
        fin: this.y
      };
    }
  },
  template: `
    <vue-draggable-resizable :draggable="this.can_edit" :resizable="this.can_edit" :parent='true' @dragging="this.moved" @resizing="this.moved">
      <h3>Sélecteur</h3>
      Position X
      <input v-model.number="x" v-on:input="this.update" type="number">
      Position Y
      <input v-model.number="y" v-on:input="this.update" type="number">
    </vue-draggable-resizable>
  `
};
