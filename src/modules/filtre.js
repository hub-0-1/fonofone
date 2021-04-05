import Utils from "./_utils.js";
import Globales from "../globales.js";

import Power from "../images/icon-power.svg";

const Filtre = Globales.modules.filtre;

// TODO Refact des x, y, debut, longueur
export default {
  mixins: [Utils],
  data: function () {
    return { 
      debut: this.valeur.debut,
      longueur: this.valeur.longueur
    }
  },
  methods: {
    update: function () {
      console.log(this.debut, this.longueur);
      this.$emit('update:valeur', { actif: this.module_actif, debut: this.debut, longueur: this.longueur });
    },
    drag: function (e) {
      let coords = this.get_mouse_position(e);

      // Calculer hauteur en premier
      this.longueur = this.borner_0_1(coords.y);

      let x = this.borner_0_1(coords.x) - (this.width / 2) - (Filtre.border_width);
      this.debut = this.borner(x, 0, Filtre.largeur_module - this.width - Filtre.border_width / 2); // TODO Valeur du x bonne?

      this.update();
    },
  },
  computed: {
    width: function () { return Math.max(this.longueur, Filtre.largeur_controlleur_minimale); },
    hauteur: function ()  { return this.borner((this.longueur - Filtre.hauteur_controlleur / 2) * (Filtre.hauteur_module - Filtre.hauteur_controlleur), Filtre.border_width / 2, Filtre.hauteur_module - Filtre.hauteur_controlleur - Filtre.border_width / 2); },
    x: function () { return (this.debut + Filtre.border_width / 2) * (Filtre.largeur_module - Filtre.border_width) }
  },
  template: `
    <generique :module="$t('modules.filtre')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 ${Filtre.largeur_module} ${Filtre.hauteur_module}" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="${Filtre.border_width / 2}" width="${Filtre.largeur_module - Filtre.border_width}" y="${Filtre.border_width / 2}" height="${Filtre.hauteur_module - Filtre.border_width}"/>
        <rect class="centre" x="0.49" width="0.02" y="${Filtre.hauteur_module - Filtre.border_width - Filtre.hauteur_centre}" height="${Filtre.hauteur_centre}"/>
        <rect class="controlleur" :x="x" :y="hauteur" :width="width" height="${Filtre.hauteur_controlleur}" ref="controlleur"/>
      </svg>

      <template v-slot:footer>
        <img class="power" :class="{actif: module_actif}" src="${Power}" alt="${Power}" @click="toggle_actif">
      </template>
    </generique>
  `
};
