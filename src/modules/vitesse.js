import Utils from "./_utils.js";

import Magnet from "../images/icon-magnet.svg";
import Power from "../images/icon-power.svg";

const largeur_vitesse = 0.1;
const nb_division = 7;
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
      let pos_init = this.vitesse;
      if(this.aimant) {
        pos_init = Math.round(pos_init / (1 / nb_division)) * (1 / nb_division);
      }
      return pos_init * (1 - largeur_vitesse);
    },
    affichage_mode: function () {
      let mode = "";
      for(let i = 0; i < this.mode; ++i) mode += "I";
      return mode;
    }
  },
  template: `
    <generique :module="$t('modules.vitesse')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="1" y="0" height="1"/>
        <rect class="coche c8" x="${(0 / nb_division) * (1 - largeur_vitesse) + (largeur_vitesse / 2) - (width_c8 / 2)}" y="0.4" height="0.2" width="${width_c8}" />
        <rect class="coche c8" x="${(1 / nb_division) * (1 - largeur_vitesse) + (largeur_vitesse / 2) - (width_c8 / 2)}" y="0.4" height="0.2" width="${width_c8}" />
        <rect class="coche c8" x="${(2 / nb_division) * (1 - largeur_vitesse) + (largeur_vitesse / 2) - (width_c8 / 2)}" y="0.4" height="0.2" width="${width_c8}" />
        <rect class="coche c8" x="${(3 / nb_division) * (1 - largeur_vitesse) + (largeur_vitesse / 2) - (width_c8 / 2)}" y="0.4" height="0.2" width="${width_c8}" />
        <rect class="coche c8" x="${(4 / nb_division) * (1 - largeur_vitesse) + (largeur_vitesse / 2) - (width_c8 / 2)}" y="0.4" height="0.2" width="${width_c8}" />
        <rect class="coche c8" x="${(5 / nb_division) * (1 - largeur_vitesse) + (largeur_vitesse / 2) - (width_c8 / 2)}" y="0.4" height="0.2" width="${width_c8}" />
        <rect class="coche c8" x="${(6 / nb_division) * (1 - largeur_vitesse) + (largeur_vitesse / 2) - (width_c8 / 2)}" y="0.4" height="0.2" width="${width_c8}" />
        <rect class="coche c8" x="${(7 / nb_division) * (1 - largeur_vitesse) + (largeur_vitesse / 2) - (width_c8 / 2)}" y="0.4" height="0.2" width="${width_c8}" />
        <rect class="controlleur" :x="x" width="${largeur_vitesse}" y="0" height="1" rx="0.02" ref="controlleur"/>
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
