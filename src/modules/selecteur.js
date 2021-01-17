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
  methods: {
    update: function () {
      this.$emit('update', this.plage);
    },
    moved: function () {
      this.$emit('moved', this.position());
    },
    position: function () {
      let parent_box = this.$el.parentNode.getBoundingClientRect();
      let box = this.$el.getBoundingClientRect();

      return {
        top: (box.y - parent_box.y) / parent_box.height,
        height: box.height / parent_box.height,
        left: (box.x - parent_box.x) / parent_box.width,
        width: box.width / parent_box.width,
      };
    },
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
