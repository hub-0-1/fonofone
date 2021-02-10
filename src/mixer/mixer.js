import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';

import Track from "./track.js";

class Mixer {
  constructor (waveform_element_id, fnfn_id) {
    this.fnfn_id = fnfn_id;
    this.blob = null;
    this.nodes = {};
    this.parametres = { 
      debut: 0,
      longueur: 0,
      volume: 1,
      vitesse: 1
    };

    // Representation graphique du son
    this.wavesurfer = WaveSurfer.create({
      container: `#${waveform_element_id}`,
      waveColor: 'violet',
      progressColor: 'purple',
      height: 100, // TODO determiner par CSS si possible
      plugins: [ Regions.create() ]
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
    return new Promise ((resolve, reject) => {
      this.blob = blob_audio;
      this.wavesurfer.load(URL.createObjectURL(this.blob));

      new Response(this.blob).arrayBuffer().then((buffer) => {
          return this.contexte.decodeAudioData(buffer)
        }).then((audio_buffer) => {
          this.audio_buffer = audio_buffer;
          resolve(true);
        }).catch(() => {
          reject("erreur importation");
        });
    });
  }

  jouer () {
    new Track(this.contexte, this.audio_buffer, this.nodes.master, this.parametres.debut, this.parametres.longueur, this.parametres.vitesse);
  }

  set_volume (valeur) {
    this.parametres.volume = valeur;
    this.nodes.master.gain.setValueAtTime(valeur, this.contexte.currentTime);
  }

  set_vitesse (valeur) {
    this.parametres.vitesse = valeur;
  }

  set_selecteur (valeur) {
    this.parametres.debut = valeur.debut * this.audio_buffer.duration;
    this.parametres.longueur = valeur.longueur * this.audio_buffer.duration;

    // Visuel
    this.wavesurfer.clearRegions();
    this.wavesurfer.addRegion({id: "selected", start: this.parametres.debut, end: this.parametres.debut + this.parametres.longueur, color: 'rgba(200,0,0,0.2)'}); // TODO ajouter id fonofone

    this.jouer();
  }

  set_metronome (valeur) {
    console.log(valeur);
    // TODO annuler les autres;
    //setInterval (this.jouer, valeur);
  }

  set_reverb (valeur) {
    //https://blog.gskinner.com/archives/2019/02/reverb-web-audio-api.html
    throw 'pas encore implemente';
  }

  set_loop (valeur) {
    this.wavesurfer.regions.list.selected.loop = valeur;
  }
}

export default Mixer;
