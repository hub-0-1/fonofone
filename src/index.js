import _ from 'lodash';
import Vue from 'vue';
import template_fnfn from './partials/fonofone';
import './style.css';

window.Fonofone = class Fonofone {
  constructor (element, seed) {

    // Determiner si on charge un scenario par id ou par objet de configuration
    if(element && element.nodeType === Node.ELEMENT_NODE) {
      this.containerElement = element;
    }
    else {
      throw "Element d'attache non valide";
    }

    // Creer l'element pour le Vue
    let app = document.createElement("div");
    app.className = "fonofone";
    app.id = "fnfn-" + Date.now();
    this.containerElement.appendChild(app);

    // Crer l'instance Vue
    this.instance = new Vue({
      el: "#" + app.id,
      template: "<div>1</div>",
      data: {
        message: 'Hello Vue!'
      }
    });
  }
}

