import Utils from "./_utils.js";

const largeur_reverberation = 0.1;

export default {
  mixins: [Utils],
  data: function () {
    return { reverberation: this.valeur } // TODO nommer valeurs
  },
  methods: {
    drag: function (e) {
      this.reverberation = this.borner_0_1(this.get_mouse_position(e).x);
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', this.reverberation);
    }
  },
  computed: {
    x: function () {
      return this.reverberation - (largeur_reverberation / 2);
    }
  },
  template: `
    <generique :module="$t('modules.reverberation')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="1" y="0" height="1"/>
        <rect class="centre" x="0" width="1" y="0.24" height="0.02"/>
        <rect class="controlleur-pct" :x="x" width="${largeur_reverberation}" y="0.25" height="0.2" rx="0.02" ref="controlleur_pct"/>
        <rect class="centre" x="0" width="1" y="0.74" height="0.02"/>
        <rect class="controlleur-traine" :x="x" width="${largeur_reverberation}" y="0.25" height="0.2" rx="0.02" ref="controlleur_traine"/>
      </svg>
    </generique>
  `
};
