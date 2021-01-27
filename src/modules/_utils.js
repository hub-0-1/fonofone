import Generique from "./_generique.js";

export default {
  props: ['valeur', 'disposition', 'modifiable'],
  components: {
    "generique": Generique
  },
  methods: {
    update_disposition: function (e) { this.$emit('update:disposition', e); }
  }
}
