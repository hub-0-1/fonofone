import Vue from 'vue';

import ApplicationFonofone from './fonofone_core';

import './style.less';
import './fonofone_gestion.js'; // Contient GFonofone

window.Fonofone = class Fonofone {
  constructor (element, parametres = {}) {

    if(!element || element.nodeType !== Node.ELEMENT_NODE) {
      throw "Element d'attache non valide";
    }

    // Creer l'element pour le Vue
    let app_container = document.createElement("div");
    app_container.id = "fnfn-" + window.GestionnaireFonofone.prochainIndex();
    element.appendChild(app_container);
    
    // Archive a charger
    parametres.configuration = (parametres.configuration || "https://hub-0-1.github.io/fonofone/src/configurations/dauphin.fnfn");
   
    // Si on passe des configurations externes, on assume qu'on est dans un Fonoimage 
    let integration_fonoimage = !!(parametres.ctx_audio || parametres.noeud_sortie);

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
          //resolve(ApplicationFonofone(app_container.id, archive, parametres.ctx_audio, parametres.noeud_sortie, !!parametres.integration_fonoimage));
          console.log(app_container);
          let app = new Vue({
            el: "#" + app_container.id,
            components: {
              "fonofone": ApplicationFonofone
            },
            data: {
              id: app_container.id,
              archive: archive,
              ctx_audio: parametres.ctx_audio,
              noeud_sortie: parametres.noeud_sortie
            },
            template: ` <fonofone :id="id" :archive="archive" :ctx_audio="ctx_audio" :noeud_sortie="noeud_sortie"></fonofone> `
          });

          resolve(app);
        });
    });
  }
}
