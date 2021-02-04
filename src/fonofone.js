
import ApplicationFonofone from './fonofone_core';

import './style.less';
import './fonofone_gestion.js'; // Contient GFonofone

const CONFIG = require("./configurations/dauphin.fnfn");

/*
 * Classe parente du module en tant que tel.
 * Elle permet d'intergir avec la page
 * - Export
 * parametre 1 : HTML Node auquel on ajoutera le module fonofone
 * parametre 2 : id de scenario ou objet de configuration
 */

window.Fonofone = class Fonofone {
  constructor (element, configuration) {

    if(!element || element.nodeType !== Node.ELEMENT_NODE) {
      throw "Element d'attache non valide";
    }

    // Creer l'element pour le Vue
    let app = document.createElement("div");
    app.className = "fonofone";
    app.id = "fnfn-" + window.GestionnaireFonofone.prochainIndex();
    element.appendChild(app);

    // Importation dynamique de la configuration (merci webpack) https://webpack.js.org/guides/code-splitting/
    import(`./configurations/${configuration}.fnfn`).then((archive) => {
      ApplicationFonofone(app.id, CONFIG, this); // TODO Mettre archive
    });
  }
}
