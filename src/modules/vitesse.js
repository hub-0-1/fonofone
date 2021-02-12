import Utils from "./_utils.js";

export default {
  mixins: [Utils],
  data: function () {
    return { vitesse: this.valeur }
  },
  methods: {
    drag: function (e) {
      this.vitesse = this.get_mouse_position(e).x;
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', this.vitesse);
    }
  },
  computed: {
    x: function () {
      return Math.min(Math.max(this.vitesse, 0.05), 0.85)
    }
  },
  template: `
    <generique :module="$t('modules.vitesse')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect x="0" width="1" y="0" height="1"/>
        <rect x="0" width="1" y="0.49" height="0.02"/>
        <rect class="controlleur" :x="x" width="0.1" y="0.4" height="0.2" rx="0.02" ref="controlleur"/>
      </svg>
    </generique>
  `
};
