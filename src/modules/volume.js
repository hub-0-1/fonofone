import Utils from "./_utils.js";

export default {
  mixins: [Utils],
  data: function () {
    return { 
      collapsed: false,
      volume: 1
    }
  },
  methods: {
    update: function () {
      this.$emit('update:valeur', this.volume);
    }
  },
  template: `
    <generique class="generique" :class="{collapsed: collapsed}" :module="$t('modules.volume')" :disposition="disposition" :modifiable="modifiable" @redispose="this.update_disposition" :collapsed.sync="collapsed">
      <input v-model.number="volume" @input="this.update" type="number" step="0.1">
    </generique>
  `
};
