import Utils from "./_utils.js";
import Globales from "../globales.js";

import Power from "../images/icon-power.svg";

const Reverberation = Globales.modules.reverberation;
const espacement_images = (1 - Reverberation.dimension_img) / (Reverberation.sons.length - 1);

export default {
  mixins: [Utils],
  data: function () {
    return { wet: null, url: null, sons: Reverberation.sons };
  },
  methods: {
    charger_props: function () {
      this.wet = this.valeur.wet;
      this.url = this.valeur.url;
    },
    drag: function (e) {
      if(this.controlleur_actif == this.$refs.controlleur_wet) {
        this.wet = this.borner_0_1(this.get_mouse_position(e).x);
      }
      this.update();
    },
    update_son: function (son) {
      this.url = son.son;
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', { actif: this.module_actif, wet: this.wet, url: this.url });
    }
  },
  computed: {
    x_wet: function () {
      return this.wet * (1 - Reverberation.largeur_controlleur);
    }
  },
  template: `
    <generique :module="$t('modules.reverberation')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 0.4" preserveAspectRatio="none" ref="canvas">
        <text x="0" y="0.05" width="0.1">0%</text>
        <text x="0.9" y="0.05" width="0.1">100%</text>
        <rect class="centre" x="0" width="1" y="0.1" height="0.01"/>
        <rect class="controlleur-wet" :x="x_wet" width="${Reverberation.largeur_controlleur}" y="${0.15 - Reverberation.hauteur_controlleur}" height="${Reverberation.hauteur_controlleur}" rx="0.02" ref="controlleur_wet"/>
        <image v-for="son in sons" :href="son.image" height="${Reverberation.dimension_img}" width="${Reverberation.dimension_img}" :x="sons.indexOf(son) * ${espacement_images}" y="${0.3 - (Reverberation.dimension_img / 2)}" @click="update_son(son)"/>
      </svg>

      <template v-slot:footer>
        <img class="power" :class="{actif: module_actif}" src="${Power}" alt="${Power}" @click="toggle_actif">
      </template>
    </generique>
  `
};
