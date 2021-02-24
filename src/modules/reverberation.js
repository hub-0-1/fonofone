import Utils from "./_utils.js";

const largeur_reverberation = 0.1;

export default {
  mixins: [Utils],
  data: function () {
    return { dry: this.valeur.dry, url: this.valeur.url } // TODO nommer valeurs
  },
  methods: {
    drag: function (e) {
      if(this.controlleur_actif == this.$refs.controlleur_dry) {
        this.dry = this.borner_0_1(this.get_mouse_position(e).x);
      }
      else { }
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', { dry: this.dry, url: this.url });
    }
  },
  computed: {
    x_dry: function () {
      return this.dry * (1 - largeur_reverberation);
    }
  },
  template: `
    <generique :module="$t('modules.reverberation')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="1" y="0" height="1"/>
        <rect class="centre" x="0" width="1" y="0.24" height="0.02"/>
        <rect class="controlleur-dry" :x="x_dry" width="${largeur_reverberation}" y="0.2" height="0.1" rx="0.02" ref="controlleur_dry"/>
      </svg>
    </generique>
  `
};
