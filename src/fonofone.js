import ApplicationFonofone from './fonofone_core';

import './style.less';
import './fonofone_gestion.js'; // Contient GFonofone

/*
 * Classe parente du module en tant que tel.
 * Elle permet d'intergir avec la page
 * - Export
 * parametre 1 : HTML Node auquel on ajoutera le module fonofone
 * parametre 2 : id de scenario ou objet de configuration
 */

window.Fonofone = class Fonofone {
  constructor (element, parametres = {}) {

    if(!element || element.nodeType !== Node.ELEMENT_NODE) {
      throw "Element d'attache non valide";
    }

    // Creer l'element pour le Vue
    let app = document.createElement("div");
    app.className = "fonofone";
    app.id = "fnfn-" + window.GestionnaireFonofone.prochainIndex();
    element.appendChild(app);
    
    // Archive a charger
    parametres.configuration = (parametres.configuration || "https://hub-0-1.github.io/fonofone/src/configurations/dauphin.fnfn");

    // Creer le contexte audio si on est pas dans un Fonoimage
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    parametres.ctx_audio = (parametres.ctx_audio || new AudioContext);

    // Creer un noeud de sortie controllable par le Fonoimage

    return fetch(parametres.configuration)
      .then((response) => {
        return response.blob()})
      .then((archive) => {
        ApplicationFonofone(app.id, archive, parametres.ctx_audio);
      });
  }
}
