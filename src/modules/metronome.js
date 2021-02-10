import Utils from "./_utils.js";

export default {
  mixins: [Utils],
  data: function () {
    return { metronome: this.valeur }
  },
  methods: {
    drag: function (e) {
      this.metronome = this.get_mouse_position(e).x;
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', this.metronome);
    }
  },
  computed: {
    x: function () {
      return Math.min(Math.max(this.metronome, 0.05), 0.85)
    }
  },
  // http://xahlee.info/js/svg_circle_arc.html
  template: `
    <generique :module="$t('modules.metronome')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <circle cx="0.5" cy="0.4" r="0.2" style="fill: orange; fill-opacity: 0.5;" />
        <circle cx="0.5" cy="0.4" r="0.15" style="fill: orange; fill-opacity: 0.5;" />
        <circle cx="0.5" cy="0.4" r="0.1" style="fill: orange; fill-opacity: 0.5;" />
        <path d ="M0.2,0.4 A 0.50 0.50 0 1 1 0.8,0.4 Z" fill="none" stroke="red" stroke-width="0.01" />
        <rect x="0.2" width="0.6" y="0.8" height="0.01" rx="0.02" style="fill: orange;" />
        <rect class="controlleur" :x="x" width="0.05" y="0.7" height="0.2" rx="0.02" style="fill: white" ref="controlleur"/>
      </svg>
    </generique>
  `
};
