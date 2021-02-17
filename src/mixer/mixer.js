import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';

import Track from "./track.js";

// TODO un seul audio context pour tous les fonofones : https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createChannelMerger
// ou un audio context par fonofone si pas fonoimage
class Mixer {
  constructor (waveform_element_id, fnfn_id) {
    this.fnfn_id = fnfn_id;
    this.chargement = true;
    this.blob = null;
    this.nodes = {};
    this.parametres = {};

    // Representation graphique du son
    this.wavesurfer = WaveSurfer.create({
      container: `#${waveform_element_id}`,
      waveColor: '#418ACA',
      height: 100, // TODO determiner par CSS si possible
      plugins: [ Regions.create() ]
    });

    // Initialisation
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    this.contexte = new AudioContext(); // TODO ou recevoir contexte audio du Fonoimage parent

    // Reverb
    // TODO Wet / dry
    this.nodes.convolver = this.contexte.createConvolver();

    // Filtre
    this.nodes.lowpass_filter = this.contexte.createBiquadFilter();
    this.nodes.lowpass_filter.type='lowpass'
    this.nodes.lowpass_filter.frequency.value = 20000

    this.nodes.highpass_filter = this.contexte.createBiquadFilter();
    this.nodes.highpass_filter.type='highpass'
    this.nodes.highpass_filter.frequency.value = 20

    this.nodes.bandpass_filter = this.contexte.createBiquadFilter();
    this.nodes.bandpass_filter.type='peaking'
    this.nodes.bandpass_filter.frequency.value = 10000

    // Volume
    this.nodes.master = this.contexte.createGain();

    // Appliquer les filtres
    this.nodes.convolver.connect(this.nodes.lowpass_filter);
    this.nodes.lowpass_filter.connect(this.nodes.highpass_filter);
    this.nodes.highpass_filter.connect(this.nodes.bandpass_filter);
    this.nodes.bandpass_filter.connect(this.nodes.convolver);
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

  jouer () { // QQC avec _.curry pour enlever la condition?
    if(!this.chargement)
      new Track(this.contexte, this.audio_buffer, this.nodes.master, this.parametres.debut, this.parametres.longueur, this.parametres.vitesse);
  }

  set_volume (valeur) {
    console.log("volume", valeur);
    this.parametres.volume = valeur;
    this.nodes.master.gain.setValueAtTime(valeur, this.contexte.currentTime);
  }

  set_vitesse (valeur) {
    console.log("vitesse", valeur);
    this.parametres.vitesse = valeur;
  }

  set_selecteur (valeur) {
    console.log("selecteur", valeur);
    this.parametres.debut = valeur.debut * this.audio_buffer.duration;
    this.parametres.longueur = valeur.longueur * this.audio_buffer.duration;

    // Visuel
    this.wavesurfer.clearRegions();
    this.wavesurfer.addRegion({id: "selected", start: this.parametres.debut, end: this.parametres.debut + this.parametres.longueur, color: '#323232'}); // TODO ajouter id fonofone

    this.jouer();
  }

  set_metronome (valeur) {
    console.log("metronome", valeur);
  }

  set_reverberation (valeur) {
    console.log("reverberation", valeur);
  }

  set_filtre (valeur) {
    console.log("filtre", valeur);
  }

  set_arpegiateur (valeur) {
    console.log("arpegiateur", valeur);
  }
}

export default Mixer;
