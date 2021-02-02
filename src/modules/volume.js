import Utils from "./_utils.js";

export default {
  mixins: [Utils],
  data: function () {
    return { volume: this.valeur }
  },
  methods: {
    drag: function (e) {
      let coord = this.get_mouse_position(e);

      this.volume = 1 - coord.y;
      this.set_controlleur(coord.y);

      this.update();
    },
    set_controlleur: function (hauteur) {
      this.$refs.controlleur.setAttributeNS(null, "y", Math.min(Math.max(hauteur, 0.05), 0.85));
    },
    update: function () {
      this.$emit('update:valeur', this.volume);
    }
  },
  template: `
    <generique class="generique" :module="$t('modules.volume')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect x="0" width="1" y="0" height="1" style="fill:green; fill-opacity:0.5;"/>
        <rect x="0.49" width="0.02" y="0" height="1" style="fill:green;"/>
        <rect class="controlleur" x="0.4" width="0.2" y="0.45" height="0.1" rx="0.02" style="fill:green; stroke:white; stroke-width: 0.02; fill-opacity:0.5;" ref="controlleur"/>
      </svg>
    </generique>
  `
};
