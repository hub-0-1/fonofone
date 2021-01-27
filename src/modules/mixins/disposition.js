export default {
  props: ['disposition', 'modifiable'],
  data: function () {
    return { 
      overlap: false,
      siblings: [],
      siblings_disposition: [],
      element: { x: 0, y: 0, w: 1, h: 1 }
    };
  },
  methods: {
    extraire_coordonnees: function (el) {
      let coordonnees_translate = el.style.transform.match(/(\d+)/g);
      return { 
        left: parseFloat(coordonnees_translate[0]), 
        top: coordonnees_translate[1] ? parseFloat(coordonnees_translate[1]) : 0
      };
    },
    update_siblings_disposition: function () {
      this.siblings_disposition = _.map(this.siblings, (sibling) => {
        let rect = sibling.getBoundingClientRect()
        let coordonnees = this.extraire_coordonnees(sibling);
        coordonnees.bottom = coordonnees.top + rect.height;
        coordonnees.right = coordonnees.left + rect.width;
        return coordonnees;
      });
    },
    moving: function (left, top) {
      // TODO Encore beaucoup de travail ici pour empecher l'overlap ...
      let moving_el = this.extraire_coordonnees(this.$el);
      _.each(this.siblings_disposition, (sibling) => {
        if(sibling.right > moving_el.left) console.log("trop a gauche");
        //if(sibling.left > moving_el.right) console.log("trop a droite");
        //if(sibling.top < moving_el.bottom) console.log("trop a bas");
        //if(sibling.bottom > moving_el.top) console.log("trop a haut");
      });
      this.moved();
    },
    moved: function () {
      this.$emit('update:disposition', this.calculer_disposition());
    },
    calculer_disposition: function () {
      let parent_box = this.$el.parentNode.getBoundingClientRect();
      let box = this.$el.getBoundingClientRect();

      return {
        top: (box.y - parent_box.y) / parent_box.height,
        height: box.height / parent_box.height,
        left: (box.x - parent_box.x) / parent_box.width,
        width: box.width / parent_box.width,
      };
    },
    redisposer: function () {
      let box = this.$el.parentNode.getBoundingClientRect();
      this.element.w = this.disposition.width * box.width; 
      this.element.h = this.disposition.height * box.height; 
      this.element.x = this.disposition.left * box.width; 
      this.element.y = this.disposition.top * box.height; 
    },
    getSiblings: function () {
      let sibling  = this.$el.parentNode.firstChild;
      while (sibling) {
        if (sibling.nodeType === 1 && sibling !== this.$el) { this.siblings.push(sibling); }
        sibling = sibling.nextSibling;
      }
    }
  },
  watch: {
    disposition: function () { this.redisposer(); }    
  },
  mounted: function () {
    this.getSiblings();
    window.setTimeout(this.redisposer, 0); 
  }
};
