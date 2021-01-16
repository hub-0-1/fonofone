import Vue from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable'; // https://github.com/mauricius/vue-draggable-resizable
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';

export default {
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
  computed: {
    can_edit: function () {
      return this.modeEdition;
    },
    plage: function () {
      return {
        debut: 0,
        fin: 100
      };
    }
  },
  template: `
    <vue-draggable-resizable :draggable="this.can_edit" :resizable="this.can_edit" style='color: black' :parent='true'>
      <h3>Sélecteur</h3>
      Position X
      <input v-model="x" type="number">
      Position Y
      <input v-model="y" type="number">
      <p>{{ this.plage.debut }} - {{ this.plage.fin }}</p>
    </vue-draggable-resizable>
  `
};
