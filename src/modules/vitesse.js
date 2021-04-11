import Utils from "./_utils.js";
import Globales from "../globales.js";

import Magnet from "../images/icon-magnet.svg";
import MagnetActif from "../images/icon-magnet-actif.svg";
import Power from "../images/icon-power.svg";
import PowerActif from "../images/icon-power-actif.svg";

const Vitesse = Globales.modules.vitesse;
const min_x = Vitesse.border_width / 2;
const max_x = Vitesse.largeur_module - Vitesse.largeur_controlleur - Vitesse.border_width / 2;

const width_c2 = 0.02;
const width_c4 = 0.01;
const width_c8 = 0.01;

export default {
  mixins: [Utils],
  data: function () {
    return { vitesse: null, mode: null, aimant: false, x: 0 };
  },
  methods: {
    charger_props: function () {
      this.vitesse = this.valeur.vitesse;
      this.mode = this.valeur.mode;

      this.x = (this.vitesse * (max_x - min_x)) + min_x;
    },
    drag: function (e) {
      let coords = this.get_mouse_position(e);

      let x = (this.aimant ? this.arrondir(coords.x, (Vitesse.nb_divisions * this.mode) + 2) : coords.x) - (Vitesse.largeur_controlleur / 2);
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
    }
  },
  computed: {
    affichage_mode: function () {
      let mode = "";
      for(let i = 0; i < this.mode; ++i) mode += "I";
      return mode;
    }
  },
  template: `
    <generique :module="$t('modules.vitesse')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 ${Vitesse.largeur_module} ${Vitesse.hauteur_module}" preserveAspectRatio="none" ref="canvas">
        <rect class="bg controlleur" x="${Vitesse.border_width / 2}" width="${Vitesse.largeur_module - Vitesse.border_width}" y="${Vitesse.border_width / 2}" height="${Vitesse.hauteur_module - Vitesse.border_width}" ref="controlleur"/>
        <rect v-for="i in (${Vitesse.nb_divisions} * mode)" class="coche c8" :x="((i / (${Vitesse.nb_divisions} * mode + 1)) * ${Vitesse.largeur_module}) - ${Vitesse.width_division / 2}" y="${Vitesse.hauteur_module / 3}" height="${Vitesse.hauteur_module / 3}" :width="${Vitesse.width_division}" />
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
