import { saveAs } from 'file-saver';

import ApplicationFonofone from './fonofone_application';

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
  constructor (element, configuration) {

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
    this.instance = ApplicationFonofone(app.id, this);
  }

  save_to_server () { }

  importer (blob) { // TODO Lire le blob, JSON.parse, dataURI en blob

  }

  exporter (serialisation) {
    serialisation.then((fnfn) => {
      let blob = new Blob([fnfn])
      saveAs(blob, "archive.fnfn");
    })
  }
}
