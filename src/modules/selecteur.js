import Utils from "./_utils.js";

export default {
  mixins: [Utils],
  data: function () {
    return { x: 0, y: 0 }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', { x: this.x, y: this.y });
    },
  },
  template: `
    <generique class="generique" :module="$t('modules.selecteur')" :disposition="disposition" :modifiable="modifiable" @redispose="this.update_disposition">
      <div>
        Debut <input v-model.number="x" v-on:input="this.update" type="number">
        Fin <input v-model.number="y" v-on:input="this.update" type="number">
      </div>
    </generique>
  `
};
