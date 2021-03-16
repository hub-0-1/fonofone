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
    let app_container = document.createElement("div");
    app_container.className = "fonofone";
    app_container.id = "fnfn-" + window.GestionnaireFonofone.prochainIndex();
    element.appendChild(app_container);
    
    // Archive a charger
    parametres.configuration = (parametres.configuration || "https://hub-0-1.github.io/fonofone/src/configurations/dauphin.fnfn");
   
    // Si on passe des configurations externes, on assume qu'on est dans un Fonoimage 
    let integration_fonoimage = !!(parametres.ctx_audio || parametres.noeud_sortie);
    console.log(integration_fonoimage);

    // Creer le contexte audio si on est pas dans un Fonoimage
    let AudioContext = window.AudioContext || window.webkitAudioContext;
    parametres.ctx_audio = (parametres.ctx_audio || new AudioContext);

    // Creer un noeud de sortie controllable par le Fonoimage
    parametres.noeud_sortie = (parametres.noeud_sortie || parametres.ctx_audio.createGain());

    return new Promise((resolve) => {
      fetch(parametres.configuration)
        .then((response) => {
          return response.blob();
        }).then((archive) => {
          resolve(ApplicationFonofone(app.id, archive, parametres.ctx_audio, parametres.noeud_sortie));
        });
    });
  }
}
