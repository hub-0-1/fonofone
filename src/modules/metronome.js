import Utils from "./_utils.js";

import Magnet from "../images/icon-magnet.svg";
import Power from "../images/icon-power.svg";

const nb_division = 3;
const taille_arc = 270;
const centre_cercle = { x: 0.5, y: 0.4 };
const largeur_controlleur_2 = 0.05;

export default {
  mixins: [Utils],
  data: function () {
    return { 
      aleatoire: this.valeur.aleatoire,
      bpm: this.valeur.bpm,
      aimant: false
    }
  },
  methods: {
    drag: function (e) {
      let coords = this.get_mouse_position(e);

      // Potentimetre horizontal
      if(this.controlleur_actif == this.$refs.controlleur_2) {
        this.aleatoire = this.borner_0_1(coords.x);
      }
      // Potentimetre rotatif
      else {
        
        // Recentrer les coordonnees de drag
        let x = coords.x - centre_cercle.x;
        let y = coords.y - centre_cercle.y;

        // Hack, aucune idée pourquoi il faut inverser x et y et multiplier y par -1.
        // Donne les bonnes coordonnes
        let angle = cartesianToPolar(-y, x).degrees;

        // Reporter l'angle sur l'arc
        let segment_arc = angle / (taille_arc / 2);

        // Projeter sur l'interval [0..1]
        this.bpm = (segment_arc / 2) + 0.5; // TODO peut retourner des valeurs negatives ... ne devrait pas
        this.update_position_point_arc();
      }
      this.update();
    },
    // Parce que computed fonctionne pas ...
    update_position_point_arc: function () {
      // Deplacement du point : https://bl.ocks.org/mbostock/1705868
      let arc = this.$refs.arc;
      let point = arc.getPointAtLength(arc.getTotalLength() * (1 - this.bpm));
      this.$refs.controlleur_1.setAttribute('cx', point.x);
      this.$refs.controlleur_1.setAttribute('cy', point.y);
    },
    update: function () {
      this.$emit('update:valeur', { actif: this.module_actif, aleatoire: this.aleatoire, bpm: this.bpm });
    }
  },
  computed: {
    x_controlleur_2: function () {
      return this.aleatoire * (1 - largeur_controlleur_2);
    }
  },
  mounted: function () {
    this.update_position_point_arc();
  },
  template: `
    <generique :module="$t('modules.metronome')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <circle class="concentrique" cx="${centre_cercle.x}" cy="${centre_cercle.y}" r="0.2"/>
        <circle class="concentrique" cx="${centre_cercle.x}" cy="${centre_cercle.y}" r="0.15"/>
        <circle class="concentrique" cx="${centre_cercle.x}" cy="${centre_cercle.y}" r="0.1"/>
        <path d="${describeArc(0.5, 0.4, 0.3, (taille_arc / -2), (taille_arc / 2))}" class="arc" ref="arc"/>
        <circle class="controlleur-1" r="0.02" ref="controlleur_1"/>
        <rect class="ligne-2" x="0" width="1" y="0.8" height="0.01" rx="0.02"/>
        <rect class="controlleur-2" :x="x_controlleur_2" width="${largeur_controlleur_2}" y="0.7" height="0.2" rx="0.02" ref="controlleur_2"/>
      </svg>

      <template v-slot:footer>
        <img class="power" src="${Power}" alt="${Power}" @click="toggle_actif">
        <img class="magnet" :class="{actif: aimant}" src="${Magnet}" alt="${Magnet}" @click="aimant = !aimant">
      </template>
    </generique>
  `
};

// https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle#18473154
function describeArc(x, y, radius, startAngle, endAngle){
  var start = polarToCartesian(x, y, radius, endAngle);
  var end = polarToCartesian(x, y, radius, startAngle);

  var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  var d = [
    "M", start.x, start.y, 
    "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
  ].join(" ");
  return d;       
}
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees-90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

//https://stackoverflow.com/questions/32219051/how-to-convert-cartesian-coordinates-to-polar-coordinates-in-js#33043899
function cartesianToPolar(x, y){
  return { rayon: Math.sqrt(x*x + y*y), radians: Math.atan2(y,x), degrees: Math.atan2(y, x) * (180/Math.PI)};
}

function theta (x, y) {
  return Math.atan2(y, x);
}

