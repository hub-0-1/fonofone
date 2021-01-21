import { saveAs } from 'file-saver';

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
    app.id = "fnfn-" + window.GestionnaireFonofone.prochainIndex();
    this.containerElement.appendChild(app);

    // Creer l'instance Vue, l'application elle-meme
    this.instance = ApplicationFonofone(app.id, this, CONFIG);
  }

  save_to_server () { }

  async importer (blob) {
    let archive_serialisee = await new Promise((resolve) => {
      let fileReader = new FileReader();
      fileReader.onload = (e) => resolve(fileReader.result);
      fileReader.readAsText(blob);
    });

    let archive = JSON.parse(archive_serialisee);
    archive.fichier = await (await fetch(archive.fichier)).blob(); // https://stackoverflow.com/questions/12168909/blob-from-dataurl#12300351

    this.instance.archive = archive;
    this.instance.configurer();
  }

  exporter (serialisation) {
    serialisation.then((archive) => {
      let blob = new Blob([archive])
      saveAs(blob, "archive.fnfn");
    })
  }
}
