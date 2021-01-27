import Utils from "./_utils.js";

export default {
  mixins: [Utils],
  data: function () {
    return { volume: 1 }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', this.volume);
    }
  },
  template: `
    <generique :disposition="disposition" :modifiable="modifiable" @redispose="this.update_disposition">
      <h3>Volume</h3>
      <input v-model.number="volume" @input="this.update" type="number" step="0.1">
    </generique>
  `
};
