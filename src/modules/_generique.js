import Vue from 'vue';
import VueDraggableResizable from 'vue-draggable-resizable'; // https://github.com/mauricius/vue-draggable-resizable
import 'vue-draggable-resizable/dist/VueDraggableResizable.css';

import Disposition from "./mixins/disposition.js";
import Up from "../images/icons/up.png";
import Power from "../images/icon-power.svg";

export default {
  props: ['module'],
  mixins: [Disposition],
  data: function () { return { collapsed: false } },
  components: { "vue-draggable-resizable": VueDraggableResizable },
  template: `
    <vue-draggable-resizable class="module" :class="{collapsed: collapsed}" :draggable="modifiable" :resizable="modifiable" :parent="true" :w="element.w" :h="element.h" :x="element.x" :y="element.y" @dragging="this.moving" :onDragStart="this.update_siblings_rect" @resizing="this.moved">
        <header>
          <h2>{{ module }}</h2>
          <img src="${Up}" @click="collapsed = !collapsed">
        </header>
        <main>
          <slot></slot>
        </main>
        <footer>
          <img class="power" src="${Power}" alt="${Power}">
          <div class="menu-droite">
            <slot name="footer"></slot>
          </div>
        </footer>
    </vue-draggable-resizable>
  `
};
