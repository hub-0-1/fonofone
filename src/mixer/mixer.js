import WaveSurfer from 'wavesurfer.js';
import Regions from 'wavesurfer.js/dist/plugin/wavesurfer.regions.min.js';
import Audiobuffer2Wav from 'audiobuffer-to-wav';
import StereoPannerNode from 'stereo-panner-node';

import Track from "./track.js";
import Impulse from "../donnees/impulse.wav";

StereoPannerNode.polyfill();

const min_bpm = 24;
const max_bpm = 375;
const pct_bpm_aleatoire = 0.6;

class Mixer {
  constructor (waveform_element_id, fnfn_id, ctx_audio) {
    this.fnfn_id = fnfn_id;
    this.ctx_audio = ctx_audio;
    this.chargement = true;
    this.en_pause = true;
    this.audio_buffer = this.ctx_audio.createBufferSource();
    this.parametres = {};
    this.tracks = [];
    this.nodes = {};

    // Enregistrement de session
    this.nodes.media_stream_destination = ctx_audio.createMediaStreamDestination();
    this.session = {
      blob: null,
      encours: false,
      chunks: [],
      recorder: new MediaRecorder(this.nodes.media_stream_destination.stream)
    };
    this.session.recorder.ondataavailable = (evt) => { this.session.chunks.push(evt.data); };

    // Representation graphique du son
    this.wavesurfer = WaveSurfer.create({
      container: `#${waveform_element_id}`,
      waveColor: '#418ACA',
      height: 100, // TODO determiner par CSS si possible
      plugins: [ Regions.create() ]
    });

    // Initialisation
    this.nodes.n0 = this.ctx_audio.createGain();
    
    // Pan
    if(typeof this.ctx_audio.createStereoPanner == "function")
    this.nodes.pan = this.ctx_audio.createStereoPanner(); // TODO Alex : n'existe pas sous safari ...
    // https://www.npmjs.com/package/stereo-panner-node/v/0.1.2

    // Reverb
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
    if(this.nodes.pan) { // Pour safari
      this.nodes.n0.connect(this.nodes.pan);
      this.nodes.pan.connect(this.nodes.reverberation_dry);
      this.nodes.pan.connect(this.nodes.reverberation_wet);
    }
    else {
      this.nodes.n0.connect(this.nodes.reverberation_dry);
      this.nodes.n0.connect(this.nodes.reverberation_wet);
    }

    this.nodes.reverberation_dry.connect(this.nodes.lowpass_filter);
    this.nodes.reverberation_wet.connect(this.nodes.convolver);
    this.nodes.convolver.connect(this.nodes.lowpass_filter);

    this.nodes.lowpass_filter.connect(this.nodes.highpass_filter);
    this.nodes.highpass_filter.connect(this.nodes.bandpass_filter);
    this.nodes.bandpass_filter.connect(this.nodes.master);

    this.nodes.master.connect(this.ctx_audio.destination);
    this.nodes.master.connect(this.nodes.media_stream_destination);
  }

  charger_blob (blob) {
    return new Promise((resolve) => {
      new Response(blob).arrayBuffer().then((array_buffer) => {
        return this.ctx_audio.decodeAudioData(array_buffer)
      }).then((audio_buffer) => {
        this.audio_buffer = audio_buffer;
        this.wavesurfer.loadBlob(blob);
        resolve(true);
      });
    });
  }

  toggle_pause () {
    if(this.en_pause || this.tracks.length == 0) {
      this.ctx_audio.resume().then(() => { this.jouer(); });
    }
    else {
      _.each(this.tracks, (track) => { track.source.stop(); });
    }
    this.en_pause = !this.en_pause;
  }

  jouer () {

    // Ne pas jouer au chargement
    if(this.chargement) return;

    // Creer et supprimer la track
    let track = new Track(this.ctx_audio, this.audio_buffer, this.nodes.n0, this.parametres);
    this.tracks.push(track);
    track.source.onended = () => { 
      this.tracks.splice(this.tracks.indexOf(track), 1); 

      // Loop sans metronome
      if(this.tracks.length == 0 && this.parametres.loop && !this.parametres.metronome_actif) {
        this.jouer();
      }
    }

    // Loop avec metronome
    if(this.parametres.metronome_actif && this.parametres.loop) {
      setTimeout(this.jouer.bind(this), (60 / (this.parametres.bpm * (1 - this.parametres.aleatoire / 2))) * 1000); // TODO Aleatoire
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
    // TODO faire quelque chose avec le mode
    if(!valeur.actif) valeur.vitesse = 0.5;
    this.parametres.vitesse = valeur.vitesse;
    this.update_tracks();
  }

  set_selecteur (valeur) {

    if(!valeur.actif) {
      valeur.debut = 0;
      valeur.longueur = 1;
    }

    this.parametres.debut = (valeur.debut * this.audio_buffer.duration || 0);
    this.parametres.longueur = (valeur.longueur * this.audio_buffer.duration || 0);

    // Visuel
    this.wavesurfer.clearRegions();
    this.wavesurfer.addRegion({id: `selected-${this.fnfn_id}`, start: this.parametres.debut, end: this.parametres.debut + this.parametres.longueur, color: '#323232'}); // TODO ajouter id fonofone
  }

  set_metronome (valeur) {

    // Rythme aleatoire
    this.parametres.aleatoire = valeur.aleatoire * Math.random() * pct_bpm_aleatoire;
    this.parametres.metronome_actif = valeur.actif;
    this.parametres.bpm = valeur.bpm * (max_bpm - min_bpm) + min_bpm; // Projection sur l'interval [min_bpm, max_bpm]
  }

  set_reverberation (valeur) {
    if(!valeur.actif) valeur.wet = 0;
    this.parametres.convolver_wet = valeur.wet;

    this.nodes.reverberation_dry.gain.setValueAtTime(1 - valeur.wet, this.ctx_audio.currentTime);
    this.nodes.reverberation_wet.gain.setValueAtTime(valeur.wet, this.ctx_audio.currentTime);

    // Son du convolver
    fetch(valeur.url).then((response) => {
      return response.arrayBuffer();
    }).then((buffer) => {
      return this.ctx_audio.decodeAudioData(buffer);
    }).then((audio_buffer) => {
      this.nodes.convolver.buffer = audio_buffer;
    });
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
      console.log(this.parametres.vitesse * this.parametres.sens);
      track.source.playbackRate.setValueAtTime(this.parametres.vitesse * this.parametres.sens, this.ctx_audio.currentTime);
    });
  }

  exporter () {
    return new Promise ((resolve) => {
      this.session.recorder.onstop = () => { 
        this.session.blob = new Blob(this.session.chunks, { 'type': 'audio/ogg; codecs=opus' }); 
        this.session.chunks = [];
        resolve(this.session.blob);
      };
      this.session.recorder.stop();
    }) 
  }

  start_session () {
    this.session.recorder.start();
  }

  // TODO Nouvelle fonction devrait faire : https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamAudioDestinationNode
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
