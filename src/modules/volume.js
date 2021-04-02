import Utils from "./_utils.js";
import Globales from "../globales.js";

import Magnet from "../images/icon-magnet.svg";
import Volume from "../images/icon-volume.png";
import VolumeDroite from "../images/icon-volume_droite.png";

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
      this.volume = this.borner(0.5 - coords.y, 0, 0.5) * 2;
      this.pan = this.borner_0_1(coords.x);
      if(this.aimant) this.pan = this.arrondir(this.pan, Globales.modules.volume.nb_division + 1);
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', { volume: this.volume, pan: this.pan });
    }
  },
  computed: {
    x: function () {
      return this.pan * (1 - Globales.modules.volume.largeur_controlleur);
    },
    y: function () {
      return (0.5 - (this.volume * (0.5 - Globales.modules.volume.hauteur_controlleur) + Globales.modules.volume.hauteur_controlleur));
    }
  },
  template: `
    <generique :module="$t('modules.volume')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 0.5" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="1" y="0" height="0.5"/>
        <rect v-for="i in ${Globales.modules.volume.nb_division + 1}" class="ligne" :x="((i - 1) / ${Globales.modules.volume.nb_division}) * ${(1 - Globales.modules.volume.largeur_controlleur)} + ${(Globales.modules.volume.largeur_controlleur / 2)} - ${(Globales.modules.volume.width_division / 2)}" y="0" height="0.5" width="${Globales.modules.volume.width_division}" />
        <image href="${Volume}" x="${0.1 - Globales.modules.volume.cote_image / 2}" width="${Globales.modules.volume.cote_image / 2}" y="${0.25 - (Globales.modules.volume.cote_image / 2)}" height="${Globales.modules.volume.cote_image}"/>
        <image href="${VolumeDroite}" x="0.9" width="${Globales.modules.volume.cote_image / 2}" y="${0.25 - (Globales.modules.volume.cote_image / 2)}" height="${Globales.modules.volume.cote_image}"/>
        <rect class="controlleur" :x="x" width="${Globales.modules.volume.largeur_controlleur}" :y="y" height="${Globales.modules.volume.hauteur_controlleur}" rx="0.02" ref="controlleur"/>
      </svg>

      <template v-slot:footer>
        <img class="magnet" :class="{actif: aimant}" src="${Magnet}" alt="${Magnet}" @click="aimant = !aimant">
      </template>
    </generique>
  `
};
