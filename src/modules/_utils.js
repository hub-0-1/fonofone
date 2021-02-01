import Generique from "./_generique.js";

export default {
  props: ['valeur', 'disposition', 'modifiable'],
  components: {
    "generique": Generique
  },
  methods: {
    update_disposition: function (e) { 
      this.$emit('update:disposition', e); 
    },
    drag_start: function (e) {
      // TODO garder en memoire x y initial
    },
    drag: function (e) {
      // TODO comparer, faire bouger controlleur et mettre a jour valeurs
    }
  },
  mounted: function () {
    if(!this.$refs.controlleur) throw "Controlleur non-implemente";

    let controlleur = this.$refs.controlleur;
    //dragstart (mouse et touch)
    //drag (mouse et touch)
  }
}
