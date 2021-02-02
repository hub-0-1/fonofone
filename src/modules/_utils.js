import Generique from "./_generique.js";

export default {
  props: ['valeur', 'disposition', 'modifiable'],
  components: { "generique": Generique },
  methods: {
    update_disposition: function (e) { 
      this.$emit('update:disposition', e); 
    },
    start_drag: function (e) {
      this.$refs.canvas.addEventListener('mousemove', this.drag);

      // Pour centrer le drag a la souris
      this.offset = this.get_mouse_position(e);
      this.offset.x -= parseFloat(this.$refs.controlleur.getAttributeNS(null, "x"));
      this.offset.y -= parseFloat(this.$refs.controlleur.getAttributeNS(null, "y"));
    },
    get_mouse_position: function getMousePosition(evt) {
      var CTM = this.$refs.canvas.getScreenCTM();
      return {
        x: (evt.clientX - CTM.e) / CTM.a,
        y: (evt.clientY - CTM.f) / CTM.d
      };
    },
    end_drag: function (e) {
      this.$refs.canvas.removeEventListener('mousemove', this.drag);
    }
  },
  mounted: function () {
    this.$refs.controlleur.addEventListener('mousedown', this.start_drag);
    this.$refs.canvas.addEventListener('mouseup', this.end_drag);
    this.$refs.canvas.addEventListener('mouseleave', this.end_drag);
  }
}
