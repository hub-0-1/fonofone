import Utils from "./_utils.js";
import Globales from "../globales.js";

import Magnet from "../images/icon-magnet.svg";
import Power from "../images/icon-power.svg";

const Vitesse = Globales.modules.vitesse;

const width_c2 = 0.02;
const width_c4 = 0.01;
const width_c8 = 0.01;

export default {
  mixins: [Utils],
  data: function () {
    return { 
      vitesse: this.valeur.vitesse,
      mode: this.valeur.mode,
      aimant: false
    }
  },
  methods: {
    drag: function (e) {
      this.vitesse = this.borner_0_1(this.get_mouse_position(e).x);
      if(this.aimant) this.vitesse = this.arrondir(this.vitesse, Vitesse.nb_divisions + 1);
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
    x: function () {
      return this.borner(this.vitesse - (Vitesse.largeur_controlleur / 2), Vitesse.border_width / 2, Vitesse.largeur_module - (Vitesse.largeur_controlleur + Vitesse.border_width / 2));
    },
    affichage_mode: function () {
      let mode = "";
      for(let i = 0; i < this.mode; ++i) mode += "I";
      return mode;
    }
  },
  template: `
    <generique :module="$t('modules.vitesse')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 0.5" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="${Vitesse.border_width / 2}" width="${Vitesse.largeur_module - Vitesse.border_width}" y="${Vitesse.border_width / 2}" height="${Vitesse.hauteur_module - Vitesse.border_width}"/>
        <rect v-for="i in ${Vitesse.nb_divisions + 1}" class="coche c8" :x="((i - 1) / ${Vitesse.nb_divisions}) * (1 - ${Vitesse.largeur_controlleur}) + ${(Vitesse.largeur_controlleur / 2) - (width_c8 / 2)}" y="0.2" height="0.1" width="${width_c8}" />
        <rect class="controlleur" :x="x" width="${Vitesse.largeur_controlleur}" y="${Vitesse.border_width / 2}" height="${Vitesse.hauteur_module - Vitesse.border_width}" rx="0.02" ref="controlleur"/>
      </svg>

      <template v-slot:footer>
        <img class="power" :class="{actif: module_actif}" src="${Power}" alt="${Power}" @click="toggle_actif">
        <div class="menu-droite">
          <span class="mode" @click="change_mode">{{ affichage_mode }}</span>
          <img class="magnet" :class="{actif: aimant}" src="${Magnet}" alt="${Magnet}" @click="aimant = !aimant">
        </div>
      </template>
    </generique>
  `
};
