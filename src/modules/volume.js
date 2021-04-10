import Utils from "./_utils.js";
import Globales from "../globales.js";

import Magnet from "../images/icon-magnet.svg";
import MagnetActif from "../images/icon-magnet-actif.svg";
import VolumeGauche from "../images/icon-volume.png";
import VolumeDroite from "../images/icon-volume_droite.png";

const Volume = Globales.modules.volume;
const min_x = Volume.border_width / 2;
const max_x = Volume.largeur_module - Volume.largeur_controlleur - Volume.border_width / 2;
const min_y = Volume.border_width / 2;
const max_y = Volume.hauteur_module - Volume.hauteur_controlleur - Volume.border_width / 2;

export default {
  mixins: [Utils],
  data: function () {
    return { volume: null, pan: null, aimant: false, x: 0, y: 0 };
  },
  methods: {
    charger_props: function () {
      this.pan = this.valeur.pan;
      this.volume = this.valeur.volume;

      this.x = (this.pan * (max_x - min_x)) + min_x;
      this.y = ((1 - this.volume) * (max_y - min_y)) + min_y;
    },
    drag: function (e) {
      let coords = this.get_mouse_position(e);

      let y = coords.y - (Volume.hauteur_controlleur / 2);
      this.y = this.borner(y, min_y, max_y);
      this.volume = 1 - ((this.y - min_y) / (max_y - min_y));

      let x = (this.aimant ? this.arrondir(coords.x, Volume.nb_divisions + 2) : coords.x) - (Volume.largeur_controlleur / 2);
      this.x = this.borner(x, min_x, max_x);
      this.pan = (this.x - min_x) / (max_x - min_x);

      this.update();
    },
    update: function () {
      this.$emit('update:valeur', { volume: this.volume, pan: this.pan });
    }
  },
  template: `
    <generique :module="$t('modules.volume')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 ${Volume.largeur_module} ${Volume.hauteur_module}" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="${Volume.largeur_module}" y="0" height="${Volume.hauteur_module}"/>
        <rect v-for="i in ${Volume.nb_divisions}" class="ligne" :x="((i / ${Volume.nb_divisions + 1}) * ${Volume.largeur_module}) - ${Volume.width_division / 2}" y="0" height="${Volume.hauteur_module}" :width="i == Math.round(${Volume.nb_divisions} / 2) ? ${Volume.width_division} * 5 : ${Volume.width_division}" />
        <image href="${VolumeGauche}" x="${(Volume.largeur_module * Volume.x_relatif_img_gauche) - (Volume.cote_image / 2)}" width="${Volume.cote_image}" y="${(Volume.hauteur_module / 2) - (Volume.cote_image / 2)}" height="${Volume.cote_image}"/>
        <image href="${VolumeDroite}" x="${(Volume.largeur_module * Volume.x_relatif_img_droite) - (Volume.cote_image / 2)}" width="${Volume.cote_image}" y="${(Volume.hauteur_module / 2) - (Volume.cote_image / 2)}" height="${Volume.cote_image}"/>
        <rect class="controlleur" :x="x" width="${Volume.largeur_controlleur}" :y="y" height="${Volume.hauteur_controlleur}" rx="0.02" ref="controlleur"/>
      </svg>

      <template v-slot:footer>
        <img class="magnet" :src="aimant ? '${MagnetActif}' : '${Magnet}'" alt="${Magnet}" @click="aimant = !aimant">
      </template>
    </generique>
  `
};
