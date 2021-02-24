import Utils from "./_utils.js";

const hauteur_controlleur = 0.1;
const largeur_controlleur = 0.2;

export default {
  mixins: [Utils],
  data: function () {
    return { volume: this.valeur.volume, pan: this.valeur.pan };
  },
  methods: {
    drag: function (e) {
      let coords = this.get_mouse_position(e);
      this.volume = this.borner_0_1(1 - coords.y);
      this.pan = this.borner_0_1(coords.x);
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', { volume: this.volume, pan: this.pan });
    }
  },
  computed: {
    x: function () {
      return this.pan * (1 - largeur_controlleur);
    },
    y: function () {
      return 1 - (this.volume * (1 - hauteur_controlleur) + hauteur_controlleur);
    }
  },
  template: `
    <generique :module="$t('modules.volume')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="1" y="0" height="1"/>
        <rect class="ligne" x="0.125" width="0.005" y="0" height="1"/>
        <rect class="ligne" x="0.25" width="0.005" y="0" height="1"/>
        <rect class="ligne" x="0.375" width="0.005" y="0" height="1"/>
        <rect class="centre" x="0.495" width="0.01" y="0" height="1"/>
        <rect class="ligne" x="0.625" width="0.005" y="0" height="1"/>
        <rect class="ligne" x="0.75" width="0.005" y="0" height="1"/>
        <rect class="ligne" x="0.875" width="0.005" y="0" height="1"/>
        <rect class="controlleur" :x="x" width="${largeur_controlleur}" :y="y" height="${hauteur_controlleur}" rx="0.02" ref="controlleur"/>
      </svg>
    </generique>
  `
};
