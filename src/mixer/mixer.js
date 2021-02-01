import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';

//import Cursor from 'wavesurfer.js/dist/plugin/wavesurfer.cursor.min.js';

import Track from "./track.js";

class Mixer {
  constructor (waveform_element_id) {
    this.blob = null;
    this.nodes = {};
    this.parametres = { };
    this.selection = { debut: 0, duree: 10 };
    this.vitesse = 1.5;

    // Representation graphique du son
    this.wavesurfer = WaveSurfer.create({
      container: `#${waveform_element_id}`,
      waveColor: 'violet',
      progressColor: 'purple',
      height: 100, // TODO determiner par CSS si possible
      plugins: [
        Regions.create(),
//        Cursor.create()
      ]
    });

    // Initialisation
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    this.contexte =  new AudioContext();
    // Tous les sources se connectent dans le master
    this.nodes.master = this.contexte.createGain();

    // Appliquer les filtres
    this.nodes.master.connect(this.contexte.destination);
    // connecter master dans reverb, reverb dans xyz, xyz dans destination
  }

  charger (blob_audio) {
    this.blob = blob_audio;
    this.wavesurfer.load(URL.createObjectURL(this.blob));

    // OU this.source.buffer = this.wavesurfer.backend.buffer;
    new Response(this.blob).arrayBuffer()
      .then((buffer) => {
        this.contexte.decodeAudioData(buffer)
      .then((audio_buffer) => {
        this.audio_buffer = audio_buffer;
      })
    });
  }

  jouer () {
    new Track(this.contexte, this.audio_buffer, this.nodes.master, this.selection.debut, this.selection.duree, this.vitesse, this.nodes.master);
  }

  set_metronome (valeur) {
    // TODO annuler les autres;
    setInterval (this.jouer, valeur);
  }

  set_selecteur (valeur) {

    // TODO Valeurs a utiliser : milieu, longueur en pct
    this.selection.debut = valeur.x;
    this.selection.duree = valeur.y;

    // Visuel
    this.wavesurfer.clearRegions();
    this.wavesurfer.addRegion({id: "selected", start: valeur.x, end: valeur.y, color: 'rgba(200,0,0,0.2)'});

    this.jouer();
  }

  set_volume (valeur) {
    this.nodes.gainNode.gain.setValueAtTime(valeur, this.contexte.currentTime);
  }

  set_reverb (valeur) {
    //https://blog.gskinner.com/archives/2019/02/reverb-web-audio-api.html
    throw 'pas encore implemente';
  }

  /*set_pan (valeur) {
    this.nodes.stereoPannerNode.pan.setValueAtTime(valeur, this.contexte.currentTime);
  }*/

  set_loop (valeur) {
    this.wavesurfer.regions.list.selected.loop = valeur;
  }

  static async handle_to_blob (fichier) {
    return await (await fetch(fichier)).blob();
  }
}

export default Mixer;
