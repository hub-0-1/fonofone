const attack = 0.1;
const release = 0.1;

export default class Track {
  constructor (context, audio_buffer, noeud_audio, parametres) {

    // Initialisation
    let source = this.source = context.createBufferSource();
    let enveloppe = context.createGain();
    let now = context.currentTime;

    source.buffer = audio_buffer;
    source.connect(noeud_audio);
    
    // Enveloppe
    source.connect(enveloppe);
    enveloppe.connect(noeud_audio);
    enveloppe.gain.setValueAtTime         (0, now);
    enveloppe.gain.linearRampToValueAtTime(1, now + attack);
    enveloppe.gain.linearRampToValueAtTime(1, now + attack + parametres.longueur);
    enveloppe.gain.linearRampToValueAtTime(0, now + attack + parametres.longueur + release);

    // Vitesse
    //console.log(parametres.vitesse, parametres.sens);
    source.playbackRate.setValueAtTime(parametres.vitesse * parametres.sens, now);

    // Lancer
    source.start(now, parametres.debut, attack + parametres.longueur + release);
  }
}
