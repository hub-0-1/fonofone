(self["webpackChunkfonofone"] = self["webpackChunkfonofone"] || []).push([["src_modules_selecteur_js"],{

/***/ "./src/images/icons/up.png":
/*!*********************************!*
  !*** ./src/images/icons/up.png ***!
  \*********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

"use strict";
module.exports = __webpack_require__.p + "74e59b8b65c16ca8eba8.png";

/***/ }),

/***/ "./src/modules/_generique.js":
/*!***********************************!*
  !*** ./src/modules/_generique.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var vue_draggable_resizable__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! vue-draggable-resizable */ "./node_modules/vue-draggable-resizable/dist/VueDraggableResizable.umd.min.js");
/* harmony import */ var vue_draggable_resizable__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(vue_draggable_resizable__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var vue_draggable_resizable_dist_VueDraggableResizable_css__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! vue-draggable-resizable/dist/VueDraggableResizable.css */ "./node_modules/vue-draggable-resizable/dist/VueDraggableResizable.css");
/* harmony import */ var _mixins_disposition_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./mixins/disposition.js */ "./src/modules/mixins/disposition.js");
/* harmony import */ var _images_icons_up_png__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../images/icons/up.png */ "./src/images/icons/up.png");

 // https://github.com/mauricius/vue-draggable-resizable





/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  props: ['module'],
  mixins: [_mixins_disposition_js__WEBPACK_IMPORTED_MODULE_2__.default],
  data: function () { return { collapsed: false } },
  components: { "vue-draggable-resizable": (vue_draggable_resizable__WEBPACK_IMPORTED_MODULE_0___default()) },
  template: `
    <vue-draggable-resizable class="module" :class="{collapsed: collapsed}" :draggable="modifiable" :resizable="modifiable" :parent="true" :w="element.w" :h="element.h" :x="element.x" :y="element.y" @dragging="this.moving" :onDragStart="this.update_siblings_disposition" @resizing="this.moved">
        <header>
          <h2>{{ module }}</h2>
          <img src="${_images_icons_up_png__WEBPACK_IMPORTED_MODULE_3__}" @click="collapsed = !collapsed">
        </header>
          <main>
            <slot></slot>
          </main>
        <footer></footer>
    </vue-draggable-resizable>
  `
});


/***/ }),

/***/ "./src/modules/_utils.js":
/*!*******************************!*
  !*** ./src/modules/_utils.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _generique_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_generique.js */ "./src/modules/_generique.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  props: ['valeur', 'disposition', 'modifiable'],
  components: {
    "generique": _generique_js__WEBPACK_IMPORTED_MODULE_0__.default
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
});


/***/ }),

/***/ "./src/modules/mixins/disposition.js":
/*!*******************************************!*
  !*** ./src/modules/mixins/disposition.js ***!
  \*******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
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
});


/***/ }),

/***/ "./src/modules/selecteur.js":
/*!**********************************!*
  !*** ./src/modules/selecteur.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => __WEBPACK_DEFAULT_EXPORT__
/* harmony export */ });
/* harmony import */ var _utils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./_utils.js */ "./src/modules/_utils.js");


/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = ({
  mixins: [_utils_js__WEBPACK_IMPORTED_MODULE_0__.default],
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
});


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mb25vZm9uZS8uL3NyYy9tb2R1bGVzL19nZW5lcmlxdWUuanMiLCJ3ZWJwYWNrOi8vZm9ub2ZvbmUvLi9zcmMvbW9kdWxlcy9fdXRpbHMuanMiLCJ3ZWJwYWNrOi8vZm9ub2ZvbmUvLi9zcmMvbW9kdWxlcy9taXhpbnMvZGlzcG9zaXRpb24uanMiLCJ3ZWJwYWNrOi8vZm9ub2ZvbmUvLi9zcmMvbW9kdWxlcy9zZWxlY3RldXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBc0I7QUFDc0M7QUFDSTs7QUFFZDtBQUNWOztBQUV4QyxpRUFBZTtBQUNmO0FBQ0EsV0FBVywyREFBVztBQUN0QixxQkFBcUIsU0FBUyxtQkFBbUIsRUFBRTtBQUNuRCxlQUFlLDRCQUE0QixnRUFBcUIsRUFBRTtBQUNsRTtBQUNBLHFEQUFxRCxxQkFBcUI7QUFDMUU7QUFDQSxnQkFBZ0IsVUFBVTtBQUMxQixzQkFBc0IsaURBQUUsQ0FBQztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4QnNDOztBQUV4QyxpRUFBZTtBQUNmO0FBQ0E7QUFDQSxpQkFBaUIsa0RBQVM7QUFDMUIsR0FBRztBQUNIO0FBQ0Esc0M7QUFDQSwwQztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ3pCRCxpRUFBZTtBQUNmO0FBQ0E7QUFDQSxZO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLGM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSwwRDtBQUNBLDREO0FBQ0EseUQ7QUFDQSx5RDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSw2REFBNkQsNkJBQTZCO0FBQzFGO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLDhCQUE4QixtQkFBbUIsRTtBQUNqRCxHQUFHO0FBQ0g7QUFDQTtBQUNBLDBDO0FBQ0E7QUFDQSxDQUFDLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUU4Qjs7QUFFaEMsaUVBQWU7QUFDZixXQUFXLDhDQUFLO0FBQ2hCO0FBQ0EsWUFBWTtBQUNaLEdBQUc7QUFDSDtBQUNBO0FBQ0EsbUNBQW1DLHVCQUF1QjtBQUMxRCxLQUFLO0FBQ0wsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDLEVBQUMiLCJmaWxlIjoic3JjX21vZHVsZXNfc2VsZWN0ZXVyX2pzLmZvbm9mb25lLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFZ1ZSBmcm9tICd2dWUnO1xuaW1wb3J0IFZ1ZURyYWdnYWJsZVJlc2l6YWJsZSBmcm9tICd2dWUtZHJhZ2dhYmxlLXJlc2l6YWJsZSc7IC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXVyaWNpdXMvdnVlLWRyYWdnYWJsZS1yZXNpemFibGVcbmltcG9ydCAndnVlLWRyYWdnYWJsZS1yZXNpemFibGUvZGlzdC9WdWVEcmFnZ2FibGVSZXNpemFibGUuY3NzJztcblxuaW1wb3J0IERpc3Bvc2l0aW9uIGZyb20gXCIuL21peGlucy9kaXNwb3NpdGlvbi5qc1wiO1xuaW1wb3J0IFVwIGZyb20gXCIuLi9pbWFnZXMvaWNvbnMvdXAucG5nXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgcHJvcHM6IFsnbW9kdWxlJ10sXG4gIG1peGluczogW0Rpc3Bvc2l0aW9uXSxcbiAgZGF0YTogZnVuY3Rpb24gKCkgeyByZXR1cm4geyBjb2xsYXBzZWQ6IGZhbHNlIH0gfSxcbiAgY29tcG9uZW50czogeyBcInZ1ZS1kcmFnZ2FibGUtcmVzaXphYmxlXCI6IFZ1ZURyYWdnYWJsZVJlc2l6YWJsZSB9LFxuICB0ZW1wbGF0ZTogYFxuICAgIDx2dWUtZHJhZ2dhYmxlLXJlc2l6YWJsZSBjbGFzcz1cIm1vZHVsZVwiIDpjbGFzcz1cIntjb2xsYXBzZWQ6IGNvbGxhcHNlZH1cIiA6ZHJhZ2dhYmxlPVwibW9kaWZpYWJsZVwiIDpyZXNpemFibGU9XCJtb2RpZmlhYmxlXCIgOnBhcmVudD1cInRydWVcIiA6dz1cImVsZW1lbnQud1wiIDpoPVwiZWxlbWVudC5oXCIgOng9XCJlbGVtZW50LnhcIiA6eT1cImVsZW1lbnQueVwiIEBkcmFnZ2luZz1cInRoaXMubW92aW5nXCIgOm9uRHJhZ1N0YXJ0PVwidGhpcy51cGRhdGVfc2libGluZ3NfZGlzcG9zaXRpb25cIiBAcmVzaXppbmc9XCJ0aGlzLm1vdmVkXCI+XG4gICAgICAgIDxoZWFkZXI+XG4gICAgICAgICAgPGgyPnt7IG1vZHVsZSB9fTwvaDI+XG4gICAgICAgICAgPGltZyBzcmM9XCIke1VwfVwiIEBjbGljaz1cImNvbGxhcHNlZCA9ICFjb2xsYXBzZWRcIj5cbiAgICAgICAgPC9oZWFkZXI+XG4gICAgICAgICAgPG1haW4+XG4gICAgICAgICAgICA8c2xvdD48L3Nsb3Q+XG4gICAgICAgICAgPC9tYWluPlxuICAgICAgICA8Zm9vdGVyPjwvZm9vdGVyPlxuICAgIDwvdnVlLWRyYWdnYWJsZS1yZXNpemFibGU+XG4gIGBcbn07XG4iLCJpbXBvcnQgR2VuZXJpcXVlIGZyb20gXCIuL19nZW5lcmlxdWUuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBwcm9wczogWyd2YWxldXInLCAnZGlzcG9zaXRpb24nLCAnbW9kaWZpYWJsZSddLFxuICBjb21wb25lbnRzOiB7XG4gICAgXCJnZW5lcmlxdWVcIjogR2VuZXJpcXVlXG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICB1cGRhdGVfZGlzcG9zaXRpb246IGZ1bmN0aW9uIChlKSB7IFxuICAgICAgdGhpcy4kZW1pdCgndXBkYXRlOmRpc3Bvc2l0aW9uJywgZSk7IFxuICAgIH0sXG4gICAgZHJhZ19zdGFydDogZnVuY3Rpb24gKGUpIHtcbiAgICAgIC8vIFRPRE8gZ2FyZGVyIGVuIG1lbW9pcmUgeCB5IGluaXRpYWxcbiAgICB9LFxuICAgIGRyYWc6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAvLyBUT0RPIGNvbXBhcmVyLCBmYWlyZSBib3VnZXIgY29udHJvbGxldXIgZXQgbWV0dHJlIGEgam91ciB2YWxldXJzXG4gICAgfVxuICB9LFxuICBtb3VudGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgaWYoIXRoaXMuJHJlZnMuY29udHJvbGxldXIpIHRocm93IFwiQ29udHJvbGxldXIgbm9uLWltcGxlbWVudGVcIjtcblxuICAgIGxldCBjb250cm9sbGV1ciA9IHRoaXMuJHJlZnMuY29udHJvbGxldXI7XG4gICAgLy9kcmFnc3RhcnQgKG1vdXNlIGV0IHRvdWNoKVxuICAgIC8vZHJhZyAobW91c2UgZXQgdG91Y2gpXG4gIH1cbn1cbiIsImV4cG9ydCBkZWZhdWx0IHtcbiAgcHJvcHM6IFsnZGlzcG9zaXRpb24nLCAnbW9kaWZpYWJsZSddLFxuICBkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHsgXG4gICAgICBvdmVybGFwOiBmYWxzZSxcbiAgICAgIHNpYmxpbmdzOiBbXSxcbiAgICAgIHNpYmxpbmdzX2Rpc3Bvc2l0aW9uOiBbXSxcbiAgICAgIGVsZW1lbnQ6IHsgeDogMCwgeTogMCwgdzogMSwgaDogMSB9XG4gICAgfTtcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIGV4dHJhaXJlX2Nvb3Jkb25uZWVzOiBmdW5jdGlvbiAoZWwpIHtcbiAgICAgIGxldCBjb29yZG9ubmVlc190cmFuc2xhdGUgPSBlbC5zdHlsZS50cmFuc2Zvcm0ubWF0Y2goLyhcXGQrKS9nKTtcbiAgICAgIHJldHVybiB7IFxuICAgICAgICBsZWZ0OiBwYXJzZUZsb2F0KGNvb3Jkb25uZWVzX3RyYW5zbGF0ZVswXSksIFxuICAgICAgICB0b3A6IGNvb3Jkb25uZWVzX3RyYW5zbGF0ZVsxXSA/IHBhcnNlRmxvYXQoY29vcmRvbm5lZXNfdHJhbnNsYXRlWzFdKSA6IDBcbiAgICAgIH07XG4gICAgfSxcbiAgICB1cGRhdGVfc2libGluZ3NfZGlzcG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuc2libGluZ3NfZGlzcG9zaXRpb24gPSBfLm1hcCh0aGlzLnNpYmxpbmdzLCAoc2libGluZykgPT4ge1xuICAgICAgICBsZXQgcmVjdCA9IHNpYmxpbmcuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KClcbiAgICAgICAgbGV0IGNvb3Jkb25uZWVzID0gdGhpcy5leHRyYWlyZV9jb29yZG9ubmVlcyhzaWJsaW5nKTtcbiAgICAgICAgY29vcmRvbm5lZXMuYm90dG9tID0gY29vcmRvbm5lZXMudG9wICsgcmVjdC5oZWlnaHQ7XG4gICAgICAgIGNvb3Jkb25uZWVzLnJpZ2h0ID0gY29vcmRvbm5lZXMubGVmdCArIHJlY3Qud2lkdGg7XG4gICAgICAgIHJldHVybiBjb29yZG9ubmVlcztcbiAgICAgIH0pO1xuICAgIH0sXG4gICAgbW92aW5nOiBmdW5jdGlvbiAobGVmdCwgdG9wKSB7XG4gICAgICAvLyBUT0RPIEVuY29yZSBiZWF1Y291cCBkZSB0cmF2YWlsIGljaSBwb3VyIGVtcGVjaGVyIGwnb3ZlcmxhcCAuLi5cbiAgICAgIGxldCBtb3ZpbmdfZWwgPSB0aGlzLmV4dHJhaXJlX2Nvb3Jkb25uZWVzKHRoaXMuJGVsKTtcbiAgICAgIF8uZWFjaCh0aGlzLnNpYmxpbmdzX2Rpc3Bvc2l0aW9uLCAoc2libGluZykgPT4ge1xuICAgICAgICBpZihzaWJsaW5nLnJpZ2h0ID4gbW92aW5nX2VsLmxlZnQpIGNvbnNvbGUubG9nKFwidHJvcCBhIGdhdWNoZVwiKTtcbiAgICAgICAgLy9pZihzaWJsaW5nLmxlZnQgPiBtb3ZpbmdfZWwucmlnaHQpIGNvbnNvbGUubG9nKFwidHJvcCBhIGRyb2l0ZVwiKTtcbiAgICAgICAgLy9pZihzaWJsaW5nLnRvcCA8IG1vdmluZ19lbC5ib3R0b20pIGNvbnNvbGUubG9nKFwidHJvcCBhIGJhc1wiKTtcbiAgICAgICAgLy9pZihzaWJsaW5nLmJvdHRvbSA+IG1vdmluZ19lbC50b3ApIGNvbnNvbGUubG9nKFwidHJvcCBhIGhhdXRcIik7XG4gICAgICB9KTtcbiAgICAgIHRoaXMubW92ZWQoKTtcbiAgICB9LFxuICAgIG1vdmVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICB0aGlzLiRlbWl0KCdyZWRpc3Bvc2UnLCB0aGlzLmNhbGN1bGVyX2Rpc3Bvc2l0aW9uKCkpO1xuICAgIH0sXG4gICAgY2FsY3VsZXJfZGlzcG9zaXRpb246IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCBwYXJlbnRfYm94ID0gdGhpcy4kZWwucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIGxldCBib3ggPSB0aGlzLiRlbC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdG9wOiAoYm94LnkgLSBwYXJlbnRfYm94LnkpIC8gcGFyZW50X2JveC5oZWlnaHQsXG4gICAgICAgIGhlaWdodDogYm94LmhlaWdodCAvIHBhcmVudF9ib3guaGVpZ2h0LFxuICAgICAgICBsZWZ0OiAoYm94LnggLSBwYXJlbnRfYm94LngpIC8gcGFyZW50X2JveC53aWR0aCxcbiAgICAgICAgd2lkdGg6IGJveC53aWR0aCAvIHBhcmVudF9ib3gud2lkdGgsXG4gICAgICB9O1xuICAgIH0sXG4gICAgcmVkaXNwb3NlcjogZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IGJveCA9IHRoaXMuJGVsLnBhcmVudE5vZGUuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICB0aGlzLmVsZW1lbnQudyA9IHRoaXMuZGlzcG9zaXRpb24ud2lkdGggKiBib3gud2lkdGg7IFxuICAgICAgdGhpcy5lbGVtZW50LmggPSB0aGlzLmRpc3Bvc2l0aW9uLmhlaWdodCAqIGJveC5oZWlnaHQ7IFxuICAgICAgdGhpcy5lbGVtZW50LnggPSB0aGlzLmRpc3Bvc2l0aW9uLmxlZnQgKiBib3gud2lkdGg7IFxuICAgICAgdGhpcy5lbGVtZW50LnkgPSB0aGlzLmRpc3Bvc2l0aW9uLnRvcCAqIGJveC5oZWlnaHQ7IFxuICAgIH0sXG4gICAgZ2V0U2libGluZ3M6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGxldCBzaWJsaW5nICA9IHRoaXMuJGVsLnBhcmVudE5vZGUuZmlyc3RDaGlsZDtcbiAgICAgIHdoaWxlIChzaWJsaW5nKSB7XG4gICAgICAgIGlmIChzaWJsaW5nLm5vZGVUeXBlID09PSAxICYmIHNpYmxpbmcgIT09IHRoaXMuJGVsKSB7IHRoaXMuc2libGluZ3MucHVzaChzaWJsaW5nKTsgfVxuICAgICAgICBzaWJsaW5nID0gc2libGluZy5uZXh0U2libGluZztcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gIHdhdGNoOiB7XG4gICAgZGlzcG9zaXRpb246IGZ1bmN0aW9uICgpIHsgdGhpcy5yZWRpc3Bvc2VyKCk7IH0gICAgXG4gIH0sXG4gIG1vdW50ZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmdldFNpYmxpbmdzKCk7XG4gICAgd2luZG93LnNldFRpbWVvdXQodGhpcy5yZWRpc3Bvc2VyLCAwKTsgXG4gIH1cbn07XG4iLCJpbXBvcnQgVXRpbHMgZnJvbSBcIi4vX3V0aWxzLmpzXCI7XG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgbWl4aW5zOiBbVXRpbHNdLFxuICBkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHsgeDogMCwgeTogMCB9XG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuJGVtaXQoJ3VwZGF0ZTp2YWxldXInLCB7IHg6IHRoaXMueCwgeTogdGhpcy55IH0pO1xuICAgIH0sXG4gIH0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPGdlbmVyaXF1ZSBjbGFzcz1cImdlbmVyaXF1ZVwiIDptb2R1bGU9XCIkdCgnbW9kdWxlcy5zZWxlY3RldXInKVwiIDpkaXNwb3NpdGlvbj1cImRpc3Bvc2l0aW9uXCIgOm1vZGlmaWFibGU9XCJtb2RpZmlhYmxlXCIgQHJlZGlzcG9zZT1cInRoaXMudXBkYXRlX2Rpc3Bvc2l0aW9uXCI+XG4gICAgICA8ZGl2PlxuICAgICAgICBEZWJ1dCA8aW5wdXQgdi1tb2RlbC5udW1iZXI9XCJ4XCIgdi1vbjppbnB1dD1cInRoaXMudXBkYXRlXCIgdHlwZT1cIm51bWJlclwiPlxuICAgICAgICBGaW4gPGlucHV0IHYtbW9kZWwubnVtYmVyPVwieVwiIHYtb246aW5wdXQ9XCJ0aGlzLnVwZGF0ZVwiIHR5cGU9XCJudW1iZXJcIj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZ2VuZXJpcXVlPlxuICBgXG59O1xuIl0sInNvdXJjZVJvb3QiOiIifQ==