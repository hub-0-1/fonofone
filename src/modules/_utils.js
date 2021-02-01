import Generique from "./_generique.js";
// TODO Fusionner avec Generique

export default {
  props: ['valeur', 'disposition', 'modifiable'],
  components: { "generique": Generique },
  methods: {
    update_disposition: function (e) { 
      this.$emit('update:disposition', e); 
    },
    start_drag: function (e) {
      let controlleur = this.$refs.controlleur;
      controlleur.addEventListener('mousemove', this.drag);

      this.offset = this.get_mouse_position(e);
      this.offset.x -= parseFloat(controlleur.getAttributeNS(null, "x"));
      this.offset.y -= parseFloat(controlleur.getAttributeNS(null, "y"));
    },
    get_mouse_position: function getMousePosition(evt) {
      var CTM = this.$refs.svg.getScreenCTM();
      return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
      };
    },
    end_drag: function (e) {
      this.$refs.controlleur.removeEventListener('mousemove', this.drag);
    }
  },
  mounted: function () {
    if(!this.$refs.controlleur) throw "Controlleur non-implemente";

    let controlleur = this.$refs.controlleur;
    controlleur.addEventListener('mousedown', this.start_drag);

    // TODO ameliorer dragging
    this.$refs.svg.addEventListener('mouseup', this.end_drag);
    this.$refs.svg.addEventListener('mouseleave', this.end_drag);
  }
}
