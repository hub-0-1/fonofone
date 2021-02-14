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

      // Pour centrer le drag a la souris
      this.offset = this.get_mouse_position(e);
      this.offset.x -= parseFloat(this.controlleur_actif.getAttributeNS(null, "x"));
      this.offset.y -= parseFloat(this.controlleur_actif.getAttributeNS(null, "y"));
    },
    // TODO si on est a l'exterieur du svg, quoi faire
    // Erreur en mode grille : ne fonctionne qui si top = 0 et left = 0;
    // Solution ici : https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement
    // https://stackoverflow.com/questions/10298658/mouse-position-inside-autoscaled-svg
    // Essayer de soustraire la translation a e.clentX
    get_mouse_position: function getMousePosition(evt) {
      let canvas = this.$refs.canvas;
      var pt = canvas.createSVGPoint();
      function cursorPoint(evt){
        pt.x = evt.clientX; pt.y = evt.clientY;
        return pt.matrixTransform(canvas.getScreenCTM().inverse());
      }
      console.log(cursorPoint(evt));
      //console.log(canvas.getBBox(), canvas.getCTM(), canvas.getScreenCTM());
      var CTM = this.$refs.canvas.getScreenCTM();
      return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
      };
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
