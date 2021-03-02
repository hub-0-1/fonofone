/*
 * Utils
 * Fonctions utilitaires pour la manipulation des modules
 *
 * Pour tous les modules, il faut mettre un ref pour le controlleur, l'element mobile et un ref pour le canvas, celui qui contient l'interaction
 */

import Generique from "./_generique.js";

export default {
  props: ['valeur', 'disposition', 'modifiable'],
  components: { "generique": Generique },
  data: function () {
    return { is_dragging: false, controlleur_actif: null, module_actif: ((this.valeur.actif === true) || true) };
  },
  methods: {
    borner_0_1: function (valeur) {
      return Math.min(Math.max(valeur, 0), 1);
    },
    update_disposition: function (e) { 
      this.$emit('update:disposition', e); 
    },
    start_drag: function (e) {
      this.controlleur_actif = e.target;
      this.$el.addEventListener('mousemove', this.drag);
      this.$el.addEventListener('touchmove', this.drag, { passive: true });
      this.is_dragging = true;
    },
    // https://stackoverflow.com/questions/10298658/mouse-position-inside-autoscaled-svg et soustraire le translate de clientX et clientY
    // Reference pour le drag n drop : https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
    get_mouse_position: function (evt) {
      var pt = this.$refs.canvas.createSVGPoint();

      if(evt.type == "mousemove") {
        pt.x = evt.clientX;
        pt.y = evt.clientY;
      }
      // evt.type == "touchmove"
      else {
        pt.x = evt.touches[0].clientX;
        pt.y = evt.touches[0].clientY;
      }

      let transform = this.$el.style.transform;
      let translate = transform.match(/(\d+)/g);

      // Translate ne s'applique en mode colonne. Pourquoi? Je ne le sais pas
      if(translate && !this.$el.parentElement.classList.contains("colonne")) {
        pt.x -= translate[0];
        pt.y -= (translate[1] || 0);
      }

      return pt.matrixTransform(this.$refs.canvas.getScreenCTM().inverse());
    },
    end_drag: function (e) {
      this.$el.removeEventListener('mousemove', this.drag);
      this.$el.removeEventListener('touchmove', this.drag);
      this.controlleur_actif = null;
      this.is_dragging = false;
    },
    toggle_actif: function () {
      this.module_actif = !this.module_actif;
      this.update();
    }
  },
  mounted: function () {
    // Ajouter un listener a tous les controlleurs
    _.each(this.$refs, (ref) => {
      if(ref.className.baseVal.match(/controlleur/)) { 
        ref.addEventListener('mousedown', this.start_drag);
        ref.addEventListener('touchstart', this.start_drag, { passive: true }); // Optimisation pour le scrolling
      }
    });

    // Ajouter des listeners pour la fin du drag
    // On peut dragger dans tout le module
    this.$el.addEventListener('mouseup', this.end_drag);
    this.$el.addEventListener('mouseleave', this.end_drag);
    this.$el.addEventListener('touchend', this.end_drag);
  }
}

