const attack = 0.1;
const release = 0.1;

export default class Track {
  constructor (context, audio_buffer, noeud_audio, parametres) {

    // Initialisation
    let source = this.source = context.createBufferSource();
    let enveloppe = context.createGain();
    let now = context.currentTime;
    console.log(context.state);

    source.buffer = audio_buffer;

    // Enveloppe
    source.connect(enveloppe);
    enveloppe.connect(noeud_audio);
    enveloppe.gain.setValueAtTime         (0, now);
    enveloppe.gain.linearRampToValueAtTime(1, now + attack);
    enveloppe.gain.linearRampToValueAtTime(1, now + attack + parametres.longueur);
    enveloppe.gain.linearRampToValueAtTime(0, now + attack + parametres.longueur + release);

    // Vitesse
    source.playbackRate.setValueAtTime(parametres.vitesse * parametres.sens, context.currentTime);

    // Lancer
    //source.start(context.currentTime, parametres.debut, attack + parametres.longueur + release);
    source.start();
  }
}
