export default {
  props: ['disposition', 'modifiable'],
  data: function () {
    return { 
      overlap: false,
      siblings: [],
      element: { x: 0, y: 0, w: 1, h: 1 }
    };
  },
  methods: {
    extraire_coordonnees: function (el) {
      let coordonnees_translate = el.style.transform.match(/(\d+)/g);
      let coords = { 
        left: parseFloat(coordonnees_translate[0]), 
        top: coordonnees_translate[1] ? parseFloat(coordonnees_translate[1]) : 0
      };
      coords.bottom = coords.top + el.offsetHeight;
      coords.right = coords.left + el.offsetWidth;
      return coords;
    },
    update_siblings_rect: function () { // On drag start
      _.each(this.siblings, (sibling) => {
        sibling.rect = this.extraire_coordonnees(sibling.element);
      })
    },
    moving: function (left, top) {
      let moving_rect = this.extraire_coordonnees(this.$el);
      _.each(this.siblings, (sibling) => {

        // S'il n'y a pas d'overlap on passe
        if(!overlap(moving_rect, sibling.rect)) return;

        // Si overlap, regarder le cote qui overlap le moins et ajuster
        let deltas = _.sortBy([
          ["left", sibling.rect.left - moving_rect.right], // trop a gauche
          ["left", sibling.rect.right - moving_rect.left], // trop a droite
          ["top", sibling.rect.top - moving_rect.bottom], // trop a haut
          ["top", sibling.rect.bottom - moving_rect.top] // trop a bas
        ], x => Math.abs(x[1]));

        let ajustement = _.first(deltas);
        console.log(ajustement);

        // TODO ajuster la top et left en fonction
        console.log(moving_rect[ajustement[0]]);
        let translate = this.$el.style.transform.match(/(\d+)/g);
        console.log(translate[1] + ajustement[1]);
        
      });
      this.moved();
    },
    moved: function () {
      this.$emit('redispose', this.calculer_disposition());
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
        if (sibling.nodeType === 1 && sibling !== this.$el) { this.siblings.push({ element: sibling, rect: null }); }
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

function overlap (rect1, rect2) {
  return !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom);
}
