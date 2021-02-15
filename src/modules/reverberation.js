import Utils from "./_utils.js";

const largeur_reverberation = 0.1;

export default {
  mixins: [Utils],
  data: function () {
    return { pct: this.valeur.pct, traine: this.valeur.traine } // TODO nommer valeurs
  },
  methods: {
    drag: function (e) {
      if(this.controlleur_actif == this.$refs.controlleur_pct) {
        this.pct = this.borner_0_1(this.get_mouse_position(e).x);
      }
      else {
        this.traine = this.borner_0_1(this.get_mouse_position(e).x);
      }
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', { pct: this.pct, traine: this.traine });
    }
  },
  computed: {
    x_pct: function () {
      return this.pct - (largeur_reverberation / 2);
    },
    x_traine: function () {
      return this.traine - (largeur_reverberation / 2);
    }
  },
  template: `
    <generique :module="$t('modules.reverberation')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="1" y="0" height="1"/>
        <rect class="centre" x="0" width="1" y="0.24" height="0.02"/>
        <rect class="controlleur-pct" :x="x_pct" width="${largeur_reverberation}" y="0.2" height="0.1" rx="0.02" ref="controlleur_pct"/>
        <rect class="centre" x="0" width="1" y="0.74" height="0.02"/>
        <rect class="controlleur-traine" :x="x_traine" width="${largeur_reverberation}" y="0.7" height="0.1" rx="0.02" ref="controlleur_traine"/>
      </svg>
    </generique>
  `
};
