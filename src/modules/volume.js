import Utils from "./_utils.js";
import Globales from "../globales.js";

import Magnet from "../images/icon-magnet.svg";
import Volume from "../images/icon-volume.svg";

export default {
  mixins: [Utils],
  data: function () {
    return { 
      volume: this.valeur.volume,
      pan: this.valeur.pan,
      aimant: false
    };
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
      let pos_init = this.pan;
      if(this.aimant) {
        pos_init = Math.round(pos_init / (1 / Globales.modules.volume.nb_division)) * (1 / Globales.modules.volume.nb_division);
      }
      return pos_init * (1 - Globales.modules.volume.largeur_controlleur);
    },
    y: function () {
      return 1 - (this.volume * (1 - Globales.modules.volume.hauteur_controlleur) + Globales.modules.volume.hauteur_controlleur);
    }
  },
  template: `
    <generique :module="$t('modules.volume')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="1" y="0" height="1"/>
        <rect v-for="i in ${Globales.modules.volume.nb_division + 1}" class="ligne" :x="((i - 1) / ${Globales.modules.volume.nb_division}) * ${(1 - Globales.modules.volume.largeur_controlleur)} + ${(Globales.modules.volume.largeur_controlleur / 2)} - ${(Globales.modules.volume.width_division / 2)}" y="0" height="1" width="${Globales.modules.volume.width_division}" />
        <image href="${Volume}" x="0.2" width="${Globales.modules.volume.cote_image}" y="${0.5 - (Globales.modules.volume.cote_image / 2)}" height="${Globales.modules.volume.cote_image}"/>
        <image href="${Volume}" x="0.8" width="${Globales.modules.volume.cote_image}" y="${0.5 - (Globales.modules.volume.cote_image / 2)}" height="${Globales.modules.volume.cote_image}"/>
        <rect class="controlleur" :x="x" width="${Globales.modules.volume.largeur_controlleur}" :y="y" height="${Globales.modules.volume.hauteur_controlleur}" rx="0.02" ref="controlleur"/>
      </svg>

      <template v-slot:footer>
        <img class="magnet" :class="{actif: aimant}" src="${Magnet}" alt="${Magnet}" @click="aimant = !aimant">
      </template>
    </generique>
  `
};
