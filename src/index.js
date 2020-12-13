import _ from 'lodash';
import Vue from 'vue';
import template_fnfn from './partials/fonofone';
import './style.less';
import './gestionnaire_fonofone.js';

/*
 * Classe parente du module en tant que tel.
 * Elle permet d'intergir avec la page
 * - Drag N Drop fichier
 * - Export
 * parametre 1 : HTML Node auquel on ajoutera le module fonofone
 * parametre 2 : id de scenario ou objet de configuration
 */

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
    app.id = "fnfn-" + window.GFonofone.getProchainIndex();
    this.containerElement.appendChild(app);

    // Crer l'instance Vue
    this.instance = new Vue({
      el: "#" + app.id,
      template: template_fnfn,
      data: {
        message: 'Fonofone'
      }
    });
  }

  export () {
    return {};
  }
}
