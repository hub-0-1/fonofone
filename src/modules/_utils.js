/*
 * Reference pour le drag n drop : https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
 *
 * Pour tous les modules, il faut mettre un ref pour le controlleur, l'element mobile et un ref pour le canvas, celui qui contient l'interaction
 *
 */

import Generique from "./_generique.js";

export default {
  props: ['valeur', 'disposition', 'modifiable'],
  components: { "generique": Generique },
  data: function () {
    return { is_dragging: false, controlleur_actif: null };
  },
  methods: {
    update_disposition: function (e) { 
      this.$emit('update:disposition', e); 
    },
    start_drag: function (e) {
      this.controlleur_actif = e.target;
      this.$refs.canvas.addEventListener('mousemove', this.drag);
      this.is_dragging = true;
    },
    // TODO si on est a l'exterieur du svg, quoi faire
    // https://stackoverflow.com/questions/10298658/mouse-position-inside-autoscaled-svg et soustraire le translate de clientX et clientY
    get_mouse_position: function (evt) {
      var pt = this.$refs.canvas.createSVGPoint();
      pt.x = evt.clientX;
      pt.y = evt.clientY;

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
      this.$refs.canvas.removeEventListener('mousemove', this.drag);
      this.controlleur_actif = null;
      this.is_dragging = false;
    }
  },
  mounted: function () {
    // Ajouter un listener a tous les controlleurs
    _.each(this.$refs, (ref) => {
      if(ref.className.baseVal.match(/controlleur/)) { 
        ref.addEventListener('mousedown', this.start_drag);
      }
    });

    // Ajouter des listeners pour la fin du drag
    this.$refs.canvas.addEventListener('mouseup', this.end_drag);
    this.$refs.canvas.addEventListener('mouseleave', this.end_drag);
    //document.body.addEventListener('mouseup', this.end_drag);
  }
}
