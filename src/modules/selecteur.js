import Generique from "./_generique.js";

export default {
  props: ['valeur', 'disposition', 'modifiable'],
  components: {
    "generique": Generique
  },
  data: function () {
    return { x: 0, y: 0 }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', { x: this.x, y: this.y });
    },
    update_disposition: function (e) { this.$emit('update:disposition', e); }
  },
  template: `
    <generique :disposition="disposition" :modifiable="modifiable" @redispose="this.update_disposition">
      <h3>Sélecteur</h3>
      Debut
      <input v-model.number="x" v-on:input="this.update" type="number">
      Fin
      <input v-model.number="y" v-on:input="this.update" type="number">
    </generique>
  `
};
