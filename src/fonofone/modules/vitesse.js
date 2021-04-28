import Utils from "./_utils.js";
import Globales from "../globales.js";

import Magnet from "../../images/icon-magnet.svg";
import MagnetActif from "../../images/icon-magnet-actif.svg";
import Power from "../../images/icon-power.svg";
import PowerActif from "../../images/icon-power-actif.svg";

const Vitesse = Globales.modules.vitesse;
const min_x = Vitesse.border_width;
const max_x = Vitesse.largeur_module - Vitesse.largeur_controlleur - Vitesse.border_width;
const min_x_coche = Vitesse.border_width;
const max_x_coche = Vitesse.largeur_module - Vitesse.border_width;

export default {
  mixins: [Utils],
  data: function () {
    return { vitesse: null, mode: 1, aimant: false, x: 0 };
  },
  methods: {
    charger_props: function () {
      this.vitesse = this.valeur.vitesse;
      this.mode = this.valeur.mode;

      this.x = (this.vitesse * (max_x - min_x)) + min_x;
    },
    drag: function (e) {
      let coords = this.get_mouse_position(e);

      let x = (this.aimant ? this.arrondir(coords.x, this.nb_divisions + 2) : coords.x) - (Vitesse.largeur_controlleur / 2);
      this.x = this.borner(x, min_x, max_x);
      this.vitesse = (this.x - min_x) / (max_x - min_x);
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', {actif: this.module_actif, vitesse: this.vitesse, mode: this.mode});
    },
    change_mode: function () {
      this.mode = (this.mode % 3) + 1;
      this.update();
    },
    hauteur_coche: function (i) {
      if(i % 12 == 0) return 1;
      else if([4, 7, 10].includes(i % 12)) return 0.6;
      else if([2, 5, 9, 11].includes(i % 12)) return 0.30;
      else return 0.15;
    },
    largeur_coche: function (i) {
      return i == ((this.nb_divisions - 1) / 2) + 1 ? Vitesse.width_division * 3 : Vitesse.width_division;
    },
    coche_blanche: function (i) {
      return [2,4,5,7,9,11].includes(this.i_affichage(i) % 12)
    },
    i_affichage: function (i) { // Pas certain de comprendre ...
      return i + ((this.nb_divisions - 1) / 2) - 1;
    }
  },
  computed: {
    affichage_mode: function () {
      switch (this.mode) {
        case 1: return "I";
        case 2: return "II";
        case 3: return "IIII";
      }
    },
    nb_divisions: function () { return Vitesse.modes[this.mode - 1].nb_divisions; }
  },
  template: `
    <generique :module="$t('modules.vitesse')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 ${Vitesse.largeur_module} ${Vitesse.hauteur_module}" preserveAspectRatio="none" ref="canvas">
        <rect class="bg controlleur" x="${Vitesse.border_width / 2}" width="${Vitesse.largeur_module - Vitesse.border_width}" y="${Vitesse.border_width / 2}" height="${Vitesse.hauteur_module - Vitesse.border_width}" ref="controlleur"/>
        <rect v-for="i in nb_divisions" 
          class="coche" :class="{blanc: coche_blanche(i), cachee: !aimant && (i_affichage(i)%12 != 0)}" 
          :x="((i / (nb_divisions + 1)) * ${Vitesse.largeur_module * (max_x_coche - min_x_coche)}) + ${min_x_coche} - largeur_coche(i) / 2" 
          :width="largeur_coche(i)"
          :y="${Vitesse.hauteur_module} * (1 - hauteur_coche(i_affichage(i))) / 2" 
          :height="${Vitesse.hauteur_module} * hauteur_coche(i_affichage(i))" 
        />
        <rect class="curseur controlleur" :x="x" width="${Vitesse.largeur_controlleur}" y="${Vitesse.border_width / 2}" height="${Vitesse.hauteur_module - Vitesse.border_width}" rx="0.02" ref="controlleur_curseur"/>
      </svg>

      <template v-slot:footer>
        <img class="power" :src="module_actif ? '${PowerActif}' : '${Power}'" alt="${Power}" @click="toggle_actif">
        <div class="menu-droite">
          <span class="mode" @click="change_mode">{{ affichage_mode }}</span>
          <img class="magnet" :src="aimant ? '${MagnetActif}' : '${Magnet}'" alt="${Magnet}" @click="aimant = !aimant">
        </div>
      </template>
    </generique>
  `
};
