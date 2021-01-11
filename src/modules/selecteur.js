import Vue from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable';
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';

export default {
  components: {
    "vue-draggable-resizable": VueDraggableResizable
  },
  template: `
    <vue-draggable-resizable style='color: black' :parent='true'>
      <p>Allo</p>
      <p>Hello! I'm a flexible component. You can drag me around and you can resize me.</p>
    </vue-draggable-resizable>
  `
};
