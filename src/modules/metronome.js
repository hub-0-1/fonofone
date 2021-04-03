import Utils from "./_utils.js";
import Globales from "../globales.js";

import Magnet from "../images/icon-magnet.svg";
import Power from "../images/icon-power.svg";

export default {
  mixins: [Utils],
  data: function () {
    return { 
      aleatoire: this.valeur.aleatoire,
      bpm: this.valeur.bpm,
      syncope: this.valeur.syncope,
      aimant: false
    }
  },
  methods: {
    drag: function (e) {
      let coords = this.get_mouse_position(e);

      if(this.controlleur_actif == this.$refs.controlleur_aleatoire) { // Aleatoire
        this.aleatoire = this.borner_0_1(coords.x);
      }
      else if(this.controlleur_actif == this.$refs.controlleur_syncope) { // Syncope
        this.syncope = this.borner_0_1(coords.x);
        if(this.aimant) {
          this.syncope = this.arrondir(this.syncope, 3);
        }
      } else { // BPM

        // Recentrer les coordonnees de drag
        let x = coords.x - Globales.modules.metronome.centre_cercle.x;
        let y = coords.y - Globales.modules.metronome.centre_cercle.y;

        // Hack, aucune idée pourquoi il faut inverser x et y et multiplier y par -1.
        // Donne les bonnes coordonnes
        let angle = cartesianToPolar(-y, x).degrees;

        // Reporter l'angle sur l'arc
        let segment_arc = angle / (Globales.modules.metronome.taille_arc / 2);

        // Projeter sur l'interval [0..1]
        this.bpm = this.borner_0_1((segment_arc / 2) + 0.5); // TODO peut retourner des valeurs negatives ... ne devrait pas
        this.update_position_point_arc();
      }
      this.update();
    },
    // Parce que computed fonctionne pas ...
    update_position_point_arc: function () {
      // Deplacement du point : https://bl.ocks.org/mbostock/1705868
      let arc = this.$refs.arc;
      let point = arc.getPointAtLength(arc.getTotalLength() * (1 - this.bpm));
      this.$refs.controlleur_bpm.setAttribute('cx', point.x);
      this.$refs.controlleur_bpm.setAttribute('cy', point.y);
    },
    update: function () {
      this.$emit('update:valeur', { actif: this.module_actif, syncope: this.syncope, aleatoire: this.aleatoire, bpm: this.bpm });
    },
    update_bpm_manuel: function (e) {
      if(isInt(e.target.value)) {
        let val = parseInt(e.target.value);
        this.bpm = this.borner_0_1(Math.pow((val - Globales.modules.metronome.min_bpm) / (Globales.modules.metronome.max_bpm - Globales.modules.metronome.min_bpm), 1/2) || 0);
      }
      else if (e.target.value == "") {
        this.bpm = 0;
      }

      e.target.value = this.text_bpm;
      this.update_position_point_arc();
      this.update();
    }
  },
  computed: {
    x_controlleur_aleatoire: function () {
      return this.aleatoire * (1 - Globales.modules.metronome.largeur_controlleur_aleatoire);
    },
    x_controlleur_syncope: function () {
      return this.syncope * (1 - Globales.modules.metronome.largeur_controlleur_syncope);
    },
    text_bpm: function () {
      return Math.round(Math.pow(this.bpm, 2) * (Globales.modules.metronome.max_bpm - Globales.modules.metronome.min_bpm) + Globales.modules.metronome.min_bpm);
    }
  },
  mounted: function () {
    this.update_position_point_arc();
  },
  // Voir contenteditable pour svg text
  template: `
    <generique :module="$t('modules.metronome')" :disposition="disposition" :modifiable="modifiable && !is_dragging" @redispose="this.update_disposition">
      <svg viewBox="0 0 1 1" preserveAspectRatio="none" ref="canvas">
        <circle class="concentrique" cx="${Globales.modules.metronome.centre_cercle.x}" cy="${Globales.modules.metronome.centre_cercle.y}" r="0.2"/>
        <circle class="concentrique" cx="${Globales.modules.metronome.centre_cercle.x}" cy="${Globales.modules.metronome.centre_cercle.y}" r="0.15"/>
        <circle class="concentrique" cx="${Globales.modules.metronome.centre_cercle.x}" cy="${Globales.modules.metronome.centre_cercle.y}" r="0.1"/>

        <path d="${describeArc(0.5, 0.4, 0.3, (Globales.modules.metronome.taille_arc / -2), (Globales.modules.metronome.taille_arc / 2))}" class="arc" ref="arc"/>
        <circle class="controlleur-bpm" r="0.04" ref="controlleur_bpm"/>
        <rect class="ligne-syncope" x="0" width="1" y="0.75" height="0.01" rx="0.02"/>
        <rect class="controlleur-syncope" :x="x_controlleur_syncope" width="${Globales.modules.metronome.largeur_controlleur_syncope}" y="0.70" height="0.1" rx="0.02" ref="controlleur_syncope"/>

        <rect class="ligne-aleatoire" x="0" width="1" y="0.9" height="0.01" rx="0.02"/>
        <rect class="controlleur-aleatoire" :x="x_controlleur_aleatoire" width="${Globales.modules.metronome.largeur_controlleur_aleatoire}" y="0.85" height="0.1" rx="0.02" ref="controlleur_aleatoire"/>
      </svg>
      <input class="affichage_bpm" type="text" :value="text_bpm" @input="update_bpm_manuel"/>

      <template v-slot:footer>
        <img class="power" :class="{actif: module_actif}" src="${Power}" alt="${Power}" @click="toggle_actif">
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

function isInt (val) {
  return /^[-+]?(\d+|Infinity)$/.test(val);
}
