import Utils from "./_utils.js";
import Globales from "../globales.js";

import Power from "../images/icon-power.svg";

const espacement_images = 1 / (Globales.modules.reverberation.sons.length + 1);

export default {
  mixins: [Utils],
  data: function () {
    return { wet: this.valeur.wet, url: this.valeur.url, sons: Globales.modules.reverberation.sons };
  },
  methods: {
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
      return this.wet * (1 - Globales.modules.reverberation.largeur_reverberation);
    }
  },
  template: `
    <generique :module="$t('modules.reverberation')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="1" y="0" height="1"/>
        <rect class="centre" x="0" width="1" y="0.24" height="0.02"/>
        <rect class="controlleur-wet" :x="x_wet" width="${Globales.modules.reverberation.largeur_reverberation}" y="0.2" height="0.1" rx="0.02" ref="controlleur_wet"/>
        <image v-for="son in sons" :href="son.image" height="${Globales.modules.reverberation.dimension_img}" width="${Globales.modules.reverberation.dimension_img}" :x="(sons.indexOf(son) + 1) * ${espacement_images} - (${Globales.modules.reverberation.dimension_img} / 2)" y="${0.75 - (Globales.modules.reverberation.dimension_img / 2)}" @click="update_son(son)"/>
      </svg>

      <template v-slot:footer>
        <img class="power" :class="{actif: module_actif}" src="${Power}" alt="${Power}" @click="toggle_actif">
      </template>
    </generique>
  `
};
