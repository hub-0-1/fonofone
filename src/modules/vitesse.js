import Utils from "./_utils.js";
import Magnet from "../images/icon-magnet.svg";

const largeur_vitesse = 0.1;
const nb_division = 4;

export default {
  mixins: [Utils],
  data: function () {
    return { 
      vitesse: this.valeur,
      aimant: false
    }
  },
  methods: {
    drag: function (e) {
      this.vitesse = this.borner_0_1(this.get_mouse_position(e).x);
      this.update();
    },
    update: function () {
      this.$emit('update:valeur', this.vitesse);
    }
  },
  computed: {
    x: function () {
      let pos_init = this.vitesse;
      if(this.aimant) {
        pos_init = Math.round(pos_init / (1 / nb_division)) * (1 / nb_division);
      }
      return pos_init * (1 - largeur_vitesse);
    }
  },
  template: `
    <generique :module="$t('modules.vitesse')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <rect class="bg" x="0" width="1" y="0" height="1"/>
        <rect class="centre" x="0" width="1" y="0.49" height="0.02"/>
        <rect class="controlleur" :x="x" width="${largeur_vitesse}" y="0.4" height="0.2" rx="0.02" ref="controlleur"/>
      </svg>

      <template v-slot:footer>
        <img class="magnet" src="${Magnet}" alt="${Magnet}" @click="aimant = !aimant">
      </template>
    </generique>
  `
};
