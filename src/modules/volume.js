import Generique from "./_generique.js";

export default {
  props: ['valeur', 'disposition', 'modifiable'],
  components: {
    "generique": Generique
  },
  data: function () {
    return { volume: 1 }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', this.volume);
    },
    update_disposition: function (e) { this.$emit('update:disposition', e); }
  },
  template: `
    <generique :disposition="disposition" :modifiable="modifiable" @redispose="this.update_disposition">
      <h3>Volume</h3>
      <input v-model.number="volume" @input="this.update" type="number" step="0.1">
    </generique>
  `
};
