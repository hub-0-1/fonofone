import Utils from "./_utils.js";
import Globales from "../globales.js";

import Power from "../../images/icon-power.svg";
import PowerActif from "../../images/icon-power-actif.svg";
import ReverbPetit from "../../images/reverb-petit.png";
import ReverbGrand from "../../images/reverb-grand.png";

const Reverberation = Globales.modules.reverberation;
const min_x = Reverberation.border_width / 2;
const max_x = Reverberation.largeur_module - Reverberation.largeur_controlleur - Reverberation.border_width / 2;
const espacement_images = (Reverberation.largeur_module - Reverberation.dimension_relative_img) / (Reverberation.sons.length - 1);

export default {
  mixins: [Utils],
  data: function () {
    return { wet: null, url: null, x: 0 };
  },
  methods: {
    charger_props: function () {
      this.wet = this.valeur.wet;
      this.url = this.valeur.url;

      this.x = (this.wet * (max_x - min_x)) + min_x;
    },
    drag: function (e) {
      let coords = this.get_mouse_position(e);

      let x = coords.x - (Reverberation.largeur_controlleur / 2);
      this.x = this.borner(x, min_x, max_x);
      this.wet = (this.x - min_x) / (max_x - min_x);
      this.update();
    },
    update_son: function (son) {
      this.url = son;
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', { actif: this.module_actif, wet: this.wet, url: this.url });
    }
  },
  template: `
    <generique :module="$t('modules.reverberation')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 ${Reverberation.largeur_module} ${Reverberation.hauteur_module}" preserveAspectRatio="none" ref="canvas">
        <text x="0" y="0.075" width="0.15">0%</text>
        <text x="0.85" y="0.075" width="0.15">100%</text>
        <rect class="centre" x="0" width="${Reverberation.largeur_module}" y="${Reverberation.hauteur_module * Reverberation.y_relatif_centre_controlleur - Reverberation.hauteur_centre_controlleur / 2}" height="${Reverberation.hauteur_centre_controlleur}"/>
        <rect class="hidden controlleur" x="0" width="${Reverberation.largeur_module}" y="${Reverberation.hauteur_module * Reverberation.y_relatif_centre_controlleur - Reverberation.hauteur_controlleur / 2}" height="${Reverberation.hauteur_controlleur}" ref="controlleur"/>
        <rect class="curseur controlleur" :x="x" width="${Reverberation.largeur_controlleur}" y="${Reverberation.hauteur_module * Reverberation.y_relatif_centre_controlleur - Reverberation.hauteur_controlleur / 2}" height="${Reverberation.hauteur_controlleur}" rx="0.02" ref="controlleur_curseur"/>

        <rect class="bordure-images" x="${Reverberation.largeur_module / 2 - Reverberation.largeur_image}" width="${Reverberation.largeur_image * 2}" y="0.3" height="${Reverberation.hauteur_image}" rx="0.02" />
        <rect class="image-bg" :class="{actif: url == '${Reverberation.sons[0]}'}" 
          x="${Reverberation.largeur_module / 2 - Reverberation.largeur_image + Reverberation.border_width / 2}" 
          width="${Reverberation.largeur_image - Reverberation.border_width}" 
          y="${0.3 + Reverberation.border_width / 2}" 
          height="${Reverberation.hauteur_image - Reverberation.border_width}" 
        />
        <image preserveAspectRatio="none" href="${ReverbPetit}" class="image" :class="{actif: url == '${Reverberation.sons[0]}'}" @click="update_son('${Reverberation.sons[0]}')"
          x="${Reverberation.largeur_module / 2 - Reverberation.largeur_image + Reverberation.border_width / 2}" 
          width="${Reverberation.largeur_image - Reverberation.border_width}" 
          y="${0.3 + Reverberation.border_width / 2}" 
          height="${Reverberation.hauteur_image - Reverberation.border_width}" 
        />
        <rect class="image-bg" :class="{actif: url == '${Reverberation.sons[1]}'}" 
          x="${Reverberation.largeur_module / 2 + Reverberation.border_width / 2}" 
          width="${Reverberation.largeur_image - Reverberation.border_width}" 
          y="${0.3 + Reverberation.border_width / 2}" 
          height="${Reverberation.hauteur_image - Reverberation.border_width}" 
        />
        <image preserveAspectRatio="none" href="${ReverbGrand}" class="image" :class="{actif: url == '${Reverberation.sons[1]}'}" @click="update_son('${Reverberation.sons[1]}')"
          x="${Reverberation.largeur_module / 2 + Reverberation.border_width / 2}" 
          width="${Reverberation.largeur_image - Reverberation.border_width}" 
          y="${0.3 + Reverberation.border_width / 2}" 
          height="${Reverberation.hauteur_image - Reverberation.border_width}"
        />
        <rect class="milieu-images" x="${Reverberation.largeur_module / 2 - Reverberation.border_width / 4}" width="${Reverberation.border_width / 2}" y="0.3" height="${Reverberation.hauteur_image}" />
      </svg>

      <template v-slot:footer>
        <img class="power" :src="module_actif ? '${PowerActif}' : '${Power}'" alt="${Power}" @click="toggle_actif">
      </template>
    </generique>
  `
};
