import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';

import Track from "./track.js";

import Impulse from "../donnees/impulse.wav";

const min_bpm = 24;
const max_bpm = 375;
const pct_bpm_aleatoire = 0.6;

// TODO un seul audio context pour tous les fonofones : https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createChannelMerger
// ou un audio context par fonofone si pas fonoimage
class Mixer {
  constructor (waveform_element_id, fnfn_id, ctx_audio) {
    this.fnfn_id = fnfn_id;
    this.ctx_audio = ctx_audio;
    this.chargement = true;
    this.blob = null;
    this.nodes = {};
    this.parametres = {};
    this.tracks = [];

    // Representation graphique du son
    this.wavesurfer = WaveSurfer.create({
      container: `#${waveform_element_id}`,
      waveColor: '#418ACA',
      height: 100, // TODO determiner par CSS si possible
      plugins: [ Regions.create() ]
    });

    // Initialisation
    this.nodes.pan = this.ctx_audio.createStereoPanner();

    // Reverb
    // TODO Wet / dry
    this.nodes.reverberation_dry = this.ctx_audio.createGain();
    this.nodes.reverberation_wet = this.ctx_audio.createGain();
    this.nodes.convolver = this.ctx_audio.createConvolver();

    // Filtre
    this.nodes.lowpass_filter = this.ctx_audio.createBiquadFilter();
    this.nodes.lowpass_filter.type='lowpass'
    this.nodes.lowpass_filter.frequency.value = 20000

    this.nodes.highpass_filter = this.ctx_audio.createBiquadFilter();
    this.nodes.highpass_filter.type='highpass'
    this.nodes.highpass_filter.frequency.value = 20

    this.nodes.bandpass_filter = this.ctx_audio.createBiquadFilter();
    this.nodes.bandpass_filter.type='peaking'
    this.nodes.bandpass_filter.frequency.value = 10000

    // Volume
    this.nodes.master = this.ctx_audio.createGain();

    // Appliquer les filtres //
    this.nodes.pan.connect(this.nodes.reverberation_dry);
    this.nodes.reverberation_dry.connect(this.nodes.lowpass_filter);

    this.nodes.pan.connect(this.nodes.convolver);
    this.nodes.convolver.connect(this.nodes.reverberation_wet);
    this.nodes.reverberation_wet.connect(this.nodes.lowpass_filter);

    this.nodes.lowpass_filter.connect(this.nodes.highpass_filter);
    this.nodes.highpass_filter.connect(this.nodes.bandpass_filter);
    this.nodes.bandpass_filter.connect(this.nodes.master);

    this.nodes.master.connect(this.ctx_audio.destination);
  }

  charger (blob_audio) {
    return new Promise ((resolve, reject) => {
      this.blob = blob_audio;
      this.wavesurfer.load(URL.createObjectURL(this.blob));

      new Response(this.blob).arrayBuffer().then((buffer) => {
          return this.ctx_audio.decodeAudioData(buffer)
        }).then((audio_buffer) => {
          this.audio_buffer = audio_buffer;
          resolve(true);
        }).catch(() => {
          reject("erreur importation");
        });
    });
  }

  jouer () {
    // Ne pas jouer au chargement
    if(this.chargement) return;

    // Creer et supprimer la track
    // TODO passer convolver au lieu de pan
    let track = new Track(this.ctx_audio, this.audio_buffer, this.nodes.pan, this.parametres);
    this.tracks.push(track);
    track.source.onended = () => { this.tracks.splice(this.tracks.indexOf(track), 1); }

    // Loop
    if(!this.parametres.loop) return;
    if(this.parametres.bpm > 0) {
      setTimeout(this.jouer.bind(this), (60 / (this.parametres.bpm * (1 - this.parametres.aleatoire / 2))) * 1000);
    }
    else {
      // TODO partir la loop onended
      setTimeout(this.jouer.bind(this), this.parametres.longueur * 1000);
    }
  }

  set_volume (valeur) {

    // Volume
    this.parametres.volume = valeur.volume;
    this.nodes.master.gain.setValueAtTime(valeur.volume, this.ctx_audio.currentTime);

    // Pan
    this.parametres.pan = (valeur.pan - 0.5) * 2; // Projection sur l'interval [-1, 1]
    this.nodes.pan.pan.setValueAtTime(this.parametres.pan, this.ctx_audio.currentTime);
  }

  set_vitesse (valeur) {
    this.parametres.vitesse = valeur;
    this.update_tracks();
  }

  set_selecteur (valeur) {
    this.parametres.debut = valeur.debut * this.audio_buffer.duration;
    this.parametres.longueur = valeur.longueur * this.audio_buffer.duration;

    // Visuel
    this.wavesurfer.clearRegions();
    this.wavesurfer.addRegion({id: "selected", start: this.parametres.debut, end: this.parametres.debut + this.parametres.longueur, color: '#323232'}); // TODO ajouter id fonofone
  }

  set_metronome (valeur) {

    // Rythme aleatoire
    this.parametres.aleatoire = valeur.aleatoire * Math.random() * pct_bpm_aleatoire;

    // BPM
    if(valeur.bpm == 0) {
      this.parametres.bpm = 0;
    }
    else {
      this.parametres.bpm = valeur.bpm * (max_bpm - min_bpm) + min_bpm; // Projection sur l'interval [min_bmp, max_bpm]
    }
  }

  async set_reverberation (valeur) {
    console.log("reverberation", valeur);
    this.parametres.convolver_dry = valeur.dry;

    this.nodes.reverberation_dry.gain.setValueAtTime(valeur.dry, this.ctx_audio.currentTime);
    this.nodes.reverberation_wet.gain.setValueAtTime(1 - valeur.dry, this.ctx_audio.currentTime);

    // TODO mettre les .wav dans le dossier
    //load impulse response from file
    let response     = await fetch(Impulse);
    let arraybuffer  = await response.arrayBuffer();
    convolver.buffer = await audioCtx.decodeAudioData(arraybuffer);
  }

  set_filtre (valeur) {
    let frequence = valeur.debut + valeur.longueur / 2;
    let resonnance = valeur.longueur;

    if(frequence < 0.5) {
      this.nodes.lowpass_filter.frequency.value = Math.pow(frequence / 0.45,2) * 19900 + 100; // Parce que c'est comme ca
      this.nodes.highpass_filter.frequency.value = 20;
      this.nodes.bandpass_filter.frequency.value = this.nodes.lowpass_filter.frequency.value;
    }
    else {
      this.nodes.lowpass_filter.frequency.value = 20000;
      this.nodes.highpass_filter.frequency.value = Math.pow((frequence - 0.5) / 0.45, 2) * 20000;
      this.nodes.bandpass_filter.frequency.value = this.nodes.highpass_filter.frequency.value;
    }

    this.nodes.bandpass_filter.gain.value = resonnance * 36;
  }

  set_loop (valeur) {
    this.parametres.loop = valeur;
  }

  set_sens (valeur) {
    this.parametres.sens = valeur;
    this.update_tracks();
  }

  crop () {
    this.audio_buffer = crop_audio_buffer(this.ctx_audio, this.audio_buffer, this.parametres.debut, this.parametres.debut + this.parametres.longueur, null);
    this.wavesurfer.loadDecodedBuffer(this.audio_buffer);
  }

  update_tracks () {
    _.each(this.tracks, (track) => {
      track.source.playbackRate.setValueAtTime(this.parametres.vitesse * this.parametres.sens, this.ctx_audio.currentTime);
    });
  }

  enregistrer () {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioSourceNode
    let chunks = [];
    let mediaRecorder = new MediaRecorder(this.nodes.master);

    mediaRecorder.ondataavailable = function(e) { chunks.push(e.data); };

    mediaRecorder.onstop = function () { 
      var blob = new Blob(chunks, { 'type' : 'audio/ogg; codecs=opus'  });
      var audioURL = URL.createObjectURL(blob);
      console.log(audioURL);
    }

  }
}

export default Mixer;

// https://miguelmota.com/bytes/slice-audiobuffer/
function crop_audio_buffer(ctx_audio, buffer, begin, end) {

  let channels = buffer.numberOfChannels;
  let rate = buffer.sampleRate;

  let startOffset = rate * begin;
  let endOffset = rate * end;
  let frameCount = endOffset - startOffset;

  let newArrayBuffer = ctx_audio.createBuffer(channels, endOffset - startOffset, rate);
  var anotherArray = new Float32Array(frameCount);
  var offset = 0;

  for (var channel = 0; channel < channels; channel++) {
    buffer.copyFromChannel(anotherArray, channel, startOffset);
    newArrayBuffer.copyToChannel(anotherArray, channel, offset);
  }

  return newArrayBuffer;
}
