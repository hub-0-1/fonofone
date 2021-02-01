(self["webpackChunkfonofone"] = self["webpackChunkfonofone"] || []).push([["src_modules_volume_js"],{

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

/***/ "./src/modules/volume.js":
/*!*******************************!*
  !*** ./src/modules/volume.js ***!
  \*******************************/
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
    <generique class="generique" :module="$t('modules.volume')" :disposition="disposition" :modifiable="modifiable" @redispose="this.update_disposition">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width: 100%; height: 100%;">
        <rect x="5" width="90" y="5" height="90" rx="5" style="fill:green; fill-opacity:0.5;"/>
        <rect x="49" width="2" y="5" height="90" style="fill:green;"/>
        <rect x="40" width="20" y="45" height="10" rx="5" style="fill:green; stroke:white; stroke-width:5; fill-opacity:0.5;" ref="controlleur" onclick="console.log(2)"/>
      </svg>
      <input v-model.number="volume" @input="this.update" type="hidden" step="0.1">
    </generique>
  `
});


/***/ })

}]);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9mb25vZm9uZS8uL3NyYy9tb2R1bGVzL19nZW5lcmlxdWUuanMiLCJ3ZWJwYWNrOi8vZm9ub2ZvbmUvLi9zcmMvbW9kdWxlcy9fdXRpbHMuanMiLCJ3ZWJwYWNrOi8vZm9ub2ZvbmUvLi9zcmMvbW9kdWxlcy9taXhpbnMvZGlzcG9zaXRpb24uanMiLCJ3ZWJwYWNrOi8vZm9ub2ZvbmUvLi9zcmMvbW9kdWxlcy92b2x1bWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBc0I7QUFDc0M7QUFDSTs7QUFFZDtBQUNWOztBQUV4QyxpRUFBZTtBQUNmO0FBQ0EsV0FBVywyREFBVztBQUN0QixxQkFBcUIsU0FBUyxtQkFBbUIsRUFBRTtBQUNuRCxlQUFlLDRCQUE0QixnRUFBcUIsRUFBRTtBQUNsRTtBQUNBLHFEQUFxRCxxQkFBcUI7QUFDMUU7QUFDQSxnQkFBZ0IsVUFBVTtBQUMxQixzQkFBc0IsaURBQUUsQ0FBQztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsRUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUN4QnNDOztBQUV4QyxpRUFBZTtBQUNmO0FBQ0E7QUFDQSxpQkFBaUIsa0RBQVM7QUFDMUIsR0FBRztBQUNIO0FBQ0Esc0M7QUFDQSwwQztBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ3pCRCxpRUFBZTtBQUNmO0FBQ0E7QUFDQSxZO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBLGM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSwwRDtBQUNBLDREO0FBQ0EseUQ7QUFDQSx5RDtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQSw2REFBNkQsNkJBQTZCO0FBQzFGO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBLDhCQUE4QixtQkFBbUIsRTtBQUNqRCxHQUFHO0FBQ0g7QUFDQTtBQUNBLDBDO0FBQ0E7QUFDQSxDQUFDLEVBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUU4Qjs7QUFFaEMsaUVBQWU7QUFDZixXQUFXLDhDQUFLO0FBQ2hCO0FBQ0EsWTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0EsK0VBQStFLGNBQWM7QUFDN0YsMEVBQTBFLGtCQUFrQjtBQUM1RixtRUFBbUU7QUFDbkUsNEVBQTRFLGNBQWMsZ0JBQWdCLGtCQUFrQjtBQUM1SDtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsRUFBQyIsImZpbGUiOiJzcmNfbW9kdWxlc192b2x1bWVfanMuZm9ub2ZvbmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgVnVlIGZyb20gJ3Z1ZSc7XG5pbXBvcnQgVnVlRHJhZ2dhYmxlUmVzaXphYmxlIGZyb20gJ3Z1ZS1kcmFnZ2FibGUtcmVzaXphYmxlJzsgLy8gaHR0cHM6Ly9naXRodWIuY29tL21hdXJpY2l1cy92dWUtZHJhZ2dhYmxlLXJlc2l6YWJsZVxuaW1wb3J0ICd2dWUtZHJhZ2dhYmxlLXJlc2l6YWJsZS9kaXN0L1Z1ZURyYWdnYWJsZVJlc2l6YWJsZS5jc3MnO1xuXG5pbXBvcnQgRGlzcG9zaXRpb24gZnJvbSBcIi4vbWl4aW5zL2Rpc3Bvc2l0aW9uLmpzXCI7XG5pbXBvcnQgVXAgZnJvbSBcIi4uL2ltYWdlcy9pY29ucy91cC5wbmdcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBwcm9wczogWydtb2R1bGUnXSxcbiAgbWl4aW5zOiBbRGlzcG9zaXRpb25dLFxuICBkYXRhOiBmdW5jdGlvbiAoKSB7IHJldHVybiB7IGNvbGxhcHNlZDogZmFsc2UgfSB9LFxuICBjb21wb25lbnRzOiB7IFwidnVlLWRyYWdnYWJsZS1yZXNpemFibGVcIjogVnVlRHJhZ2dhYmxlUmVzaXphYmxlIH0sXG4gIHRlbXBsYXRlOiBgXG4gICAgPHZ1ZS1kcmFnZ2FibGUtcmVzaXphYmxlIGNsYXNzPVwibW9kdWxlXCIgOmNsYXNzPVwie2NvbGxhcHNlZDogY29sbGFwc2VkfVwiIDpkcmFnZ2FibGU9XCJtb2RpZmlhYmxlXCIgOnJlc2l6YWJsZT1cIm1vZGlmaWFibGVcIiA6cGFyZW50PVwidHJ1ZVwiIDp3PVwiZWxlbWVudC53XCIgOmg9XCJlbGVtZW50LmhcIiA6eD1cImVsZW1lbnQueFwiIDp5PVwiZWxlbWVudC55XCIgQGRyYWdnaW5nPVwidGhpcy5tb3ZpbmdcIiA6b25EcmFnU3RhcnQ9XCJ0aGlzLnVwZGF0ZV9zaWJsaW5nc19kaXNwb3NpdGlvblwiIEByZXNpemluZz1cInRoaXMubW92ZWRcIj5cbiAgICAgICAgPGhlYWRlcj5cbiAgICAgICAgICA8aDI+e3sgbW9kdWxlIH19PC9oMj5cbiAgICAgICAgICA8aW1nIHNyYz1cIiR7VXB9XCIgQGNsaWNrPVwiY29sbGFwc2VkID0gIWNvbGxhcHNlZFwiPlxuICAgICAgICA8L2hlYWRlcj5cbiAgICAgICAgICA8bWFpbj5cbiAgICAgICAgICAgIDxzbG90Pjwvc2xvdD5cbiAgICAgICAgICA8L21haW4+XG4gICAgICAgIDxmb290ZXI+PC9mb290ZXI+XG4gICAgPC92dWUtZHJhZ2dhYmxlLXJlc2l6YWJsZT5cbiAgYFxufTtcbiIsImltcG9ydCBHZW5lcmlxdWUgZnJvbSBcIi4vX2dlbmVyaXF1ZS5qc1wiO1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHByb3BzOiBbJ3ZhbGV1cicsICdkaXNwb3NpdGlvbicsICdtb2RpZmlhYmxlJ10sXG4gIGNvbXBvbmVudHM6IHtcbiAgICBcImdlbmVyaXF1ZVwiOiBHZW5lcmlxdWVcbiAgfSxcbiAgbWV0aG9kczoge1xuICAgIHVwZGF0ZV9kaXNwb3NpdGlvbjogZnVuY3Rpb24gKGUpIHsgXG4gICAgICB0aGlzLiRlbWl0KCd1cGRhdGU6ZGlzcG9zaXRpb24nLCBlKTsgXG4gICAgfSxcbiAgICBkcmFnX3N0YXJ0OiBmdW5jdGlvbiAoZSkge1xuICAgICAgLy8gVE9ETyBnYXJkZXIgZW4gbWVtb2lyZSB4IHkgaW5pdGlhbFxuICAgIH0sXG4gICAgZHJhZzogZnVuY3Rpb24gKGUpIHtcbiAgICAgIC8vIFRPRE8gY29tcGFyZXIsIGZhaXJlIGJvdWdlciBjb250cm9sbGV1ciBldCBtZXR0cmUgYSBqb3VyIHZhbGV1cnNcbiAgICB9XG4gIH0sXG4gIG1vdW50ZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICBpZighdGhpcy4kcmVmcy5jb250cm9sbGV1cikgdGhyb3cgXCJDb250cm9sbGV1ciBub24taW1wbGVtZW50ZVwiO1xuXG4gICAgbGV0IGNvbnRyb2xsZXVyID0gdGhpcy4kcmVmcy5jb250cm9sbGV1cjtcbiAgICAvL2RyYWdzdGFydCAobW91c2UgZXQgdG91Y2gpXG4gICAgLy9kcmFnIChtb3VzZSBldCB0b3VjaClcbiAgfVxufVxuIiwiZXhwb3J0IGRlZmF1bHQge1xuICBwcm9wczogWydkaXNwb3NpdGlvbicsICdtb2RpZmlhYmxlJ10sXG4gIGRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4geyBcbiAgICAgIG92ZXJsYXA6IGZhbHNlLFxuICAgICAgc2libGluZ3M6IFtdLFxuICAgICAgc2libGluZ3NfZGlzcG9zaXRpb246IFtdLFxuICAgICAgZWxlbWVudDogeyB4OiAwLCB5OiAwLCB3OiAxLCBoOiAxIH1cbiAgICB9O1xuICB9LFxuICBtZXRob2RzOiB7XG4gICAgZXh0cmFpcmVfY29vcmRvbm5lZXM6IGZ1bmN0aW9uIChlbCkge1xuICAgICAgbGV0IGNvb3Jkb25uZWVzX3RyYW5zbGF0ZSA9IGVsLnN0eWxlLnRyYW5zZm9ybS5tYXRjaCgvKFxcZCspL2cpO1xuICAgICAgcmV0dXJuIHsgXG4gICAgICAgIGxlZnQ6IHBhcnNlRmxvYXQoY29vcmRvbm5lZXNfdHJhbnNsYXRlWzBdKSwgXG4gICAgICAgIHRvcDogY29vcmRvbm5lZXNfdHJhbnNsYXRlWzFdID8gcGFyc2VGbG9hdChjb29yZG9ubmVlc190cmFuc2xhdGVbMV0pIDogMFxuICAgICAgfTtcbiAgICB9LFxuICAgIHVwZGF0ZV9zaWJsaW5nc19kaXNwb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgdGhpcy5zaWJsaW5nc19kaXNwb3NpdGlvbiA9IF8ubWFwKHRoaXMuc2libGluZ3MsIChzaWJsaW5nKSA9PiB7XG4gICAgICAgIGxldCByZWN0ID0gc2libGluZy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKVxuICAgICAgICBsZXQgY29vcmRvbm5lZXMgPSB0aGlzLmV4dHJhaXJlX2Nvb3Jkb25uZWVzKHNpYmxpbmcpO1xuICAgICAgICBjb29yZG9ubmVlcy5ib3R0b20gPSBjb29yZG9ubmVlcy50b3AgKyByZWN0LmhlaWdodDtcbiAgICAgICAgY29vcmRvbm5lZXMucmlnaHQgPSBjb29yZG9ubmVlcy5sZWZ0ICsgcmVjdC53aWR0aDtcbiAgICAgICAgcmV0dXJuIGNvb3Jkb25uZWVzO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBtb3Zpbmc6IGZ1bmN0aW9uIChsZWZ0LCB0b3ApIHtcbiAgICAgIC8vIFRPRE8gRW5jb3JlIGJlYXVjb3VwIGRlIHRyYXZhaWwgaWNpIHBvdXIgZW1wZWNoZXIgbCdvdmVybGFwIC4uLlxuICAgICAgbGV0IG1vdmluZ19lbCA9IHRoaXMuZXh0cmFpcmVfY29vcmRvbm5lZXModGhpcy4kZWwpO1xuICAgICAgXy5lYWNoKHRoaXMuc2libGluZ3NfZGlzcG9zaXRpb24sIChzaWJsaW5nKSA9PiB7XG4gICAgICAgIGlmKHNpYmxpbmcucmlnaHQgPiBtb3ZpbmdfZWwubGVmdCkgY29uc29sZS5sb2coXCJ0cm9wIGEgZ2F1Y2hlXCIpO1xuICAgICAgICAvL2lmKHNpYmxpbmcubGVmdCA+IG1vdmluZ19lbC5yaWdodCkgY29uc29sZS5sb2coXCJ0cm9wIGEgZHJvaXRlXCIpO1xuICAgICAgICAvL2lmKHNpYmxpbmcudG9wIDwgbW92aW5nX2VsLmJvdHRvbSkgY29uc29sZS5sb2coXCJ0cm9wIGEgYmFzXCIpO1xuICAgICAgICAvL2lmKHNpYmxpbmcuYm90dG9tID4gbW92aW5nX2VsLnRvcCkgY29uc29sZS5sb2coXCJ0cm9wIGEgaGF1dFwiKTtcbiAgICAgIH0pO1xuICAgICAgdGhpcy5tb3ZlZCgpO1xuICAgIH0sXG4gICAgbW92ZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuJGVtaXQoJ3JlZGlzcG9zZScsIHRoaXMuY2FsY3VsZXJfZGlzcG9zaXRpb24oKSk7XG4gICAgfSxcbiAgICBjYWxjdWxlcl9kaXNwb3NpdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IHBhcmVudF9ib3ggPSB0aGlzLiRlbC5wYXJlbnROb2RlLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgbGV0IGJveCA9IHRoaXMuJGVsLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICB0b3A6IChib3gueSAtIHBhcmVudF9ib3gueSkgLyBwYXJlbnRfYm94LmhlaWdodCxcbiAgICAgICAgaGVpZ2h0OiBib3guaGVpZ2h0IC8gcGFyZW50X2JveC5oZWlnaHQsXG4gICAgICAgIGxlZnQ6IChib3gueCAtIHBhcmVudF9ib3gueCkgLyBwYXJlbnRfYm94LndpZHRoLFxuICAgICAgICB3aWR0aDogYm94LndpZHRoIC8gcGFyZW50X2JveC53aWR0aCxcbiAgICAgIH07XG4gICAgfSxcbiAgICByZWRpc3Bvc2VyOiBmdW5jdGlvbiAoKSB7XG4gICAgICBsZXQgYm94ID0gdGhpcy4kZWwucGFyZW50Tm9kZS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgIHRoaXMuZWxlbWVudC53ID0gdGhpcy5kaXNwb3NpdGlvbi53aWR0aCAqIGJveC53aWR0aDsgXG4gICAgICB0aGlzLmVsZW1lbnQuaCA9IHRoaXMuZGlzcG9zaXRpb24uaGVpZ2h0ICogYm94LmhlaWdodDsgXG4gICAgICB0aGlzLmVsZW1lbnQueCA9IHRoaXMuZGlzcG9zaXRpb24ubGVmdCAqIGJveC53aWR0aDsgXG4gICAgICB0aGlzLmVsZW1lbnQueSA9IHRoaXMuZGlzcG9zaXRpb24udG9wICogYm94LmhlaWdodDsgXG4gICAgfSxcbiAgICBnZXRTaWJsaW5nczogZnVuY3Rpb24gKCkge1xuICAgICAgbGV0IHNpYmxpbmcgID0gdGhpcy4kZWwucGFyZW50Tm9kZS5maXJzdENoaWxkO1xuICAgICAgd2hpbGUgKHNpYmxpbmcpIHtcbiAgICAgICAgaWYgKHNpYmxpbmcubm9kZVR5cGUgPT09IDEgJiYgc2libGluZyAhPT0gdGhpcy4kZWwpIHsgdGhpcy5zaWJsaW5ncy5wdXNoKHNpYmxpbmcpOyB9XG4gICAgICAgIHNpYmxpbmcgPSBzaWJsaW5nLm5leHRTaWJsaW5nO1xuICAgICAgfVxuICAgIH1cbiAgfSxcbiAgd2F0Y2g6IHtcbiAgICBkaXNwb3NpdGlvbjogZnVuY3Rpb24gKCkgeyB0aGlzLnJlZGlzcG9zZXIoKTsgfSAgICBcbiAgfSxcbiAgbW91bnRlZDogZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZ2V0U2libGluZ3MoKTtcbiAgICB3aW5kb3cuc2V0VGltZW91dCh0aGlzLnJlZGlzcG9zZXIsIDApOyBcbiAgfVxufTtcbiIsImltcG9ydCBVdGlscyBmcm9tIFwiLi9fdXRpbHMuanNcIjtcblxuZXhwb3J0IGRlZmF1bHQge1xuICBtaXhpbnM6IFtVdGlsc10sXG4gIGRhdGE6IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4geyBcbiAgICAgIGNvbGxhcHNlZDogZmFsc2UsXG4gICAgICB2b2x1bWU6IDFcbiAgICB9XG4gIH0sXG4gIG1ldGhvZHM6IHtcbiAgICB1cGRhdGU6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHRoaXMuJGVtaXQoJ3VwZGF0ZTp2YWxldXInLCB0aGlzLnZvbHVtZSk7XG4gICAgfVxuICB9LFxuICB0ZW1wbGF0ZTogYFxuICAgIDxnZW5lcmlxdWUgY2xhc3M9XCJnZW5lcmlxdWVcIiA6bW9kdWxlPVwiJHQoJ21vZHVsZXMudm9sdW1lJylcIiA6ZGlzcG9zaXRpb249XCJkaXNwb3NpdGlvblwiIDptb2RpZmlhYmxlPVwibW9kaWZpYWJsZVwiIEByZWRpc3Bvc2U9XCJ0aGlzLnVwZGF0ZV9kaXNwb3NpdGlvblwiPlxuICAgICAgPHN2ZyB2aWV3Qm94PVwiMCAwIDEwMCAxMDBcIiBwcmVzZXJ2ZUFzcGVjdFJhdGlvPVwibm9uZVwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTtcIj5cbiAgICAgICAgPHJlY3QgeD1cIjVcIiB3aWR0aD1cIjkwXCIgeT1cIjVcIiBoZWlnaHQ9XCI5MFwiIHJ4PVwiNVwiIHN0eWxlPVwiZmlsbDpncmVlbjsgZmlsbC1vcGFjaXR5OjAuNTtcIi8+XG4gICAgICAgIDxyZWN0IHg9XCI0OVwiIHdpZHRoPVwiMlwiIHk9XCI1XCIgaGVpZ2h0PVwiOTBcIiBzdHlsZT1cImZpbGw6Z3JlZW47XCIvPlxuICAgICAgICA8cmVjdCB4PVwiNDBcIiB3aWR0aD1cIjIwXCIgeT1cIjQ1XCIgaGVpZ2h0PVwiMTBcIiByeD1cIjVcIiBzdHlsZT1cImZpbGw6Z3JlZW47IHN0cm9rZTp3aGl0ZTsgc3Ryb2tlLXdpZHRoOjU7IGZpbGwtb3BhY2l0eTowLjU7XCIgcmVmPVwiY29udHJvbGxldXJcIiBvbmNsaWNrPVwiY29uc29sZS5sb2coMilcIi8+XG4gICAgICA8L3N2Zz5cbiAgICAgIDxpbnB1dCB2LW1vZGVsLm51bWJlcj1cInZvbHVtZVwiIEBpbnB1dD1cInRoaXMudXBkYXRlXCIgdHlwZT1cImhpZGRlblwiIHN0ZXA9XCIwLjFcIj5cbiAgICA8L2dlbmVyaXF1ZT5cbiAgYFxufTtcbiJdLCJzb3VyY2VSb290IjoiIn0=