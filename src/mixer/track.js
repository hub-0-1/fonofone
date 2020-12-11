class Track {
  constructor (context, audio_buffer, master, debut, longueur, vitesse) {

    // TODO refact constantes 
    let attack = 1;
    let release = 1;

    // Initialisation
    let source = context.createBufferSource();
    let enveloppe = context.createGain();
    let now = context.currentTime;

    source.buffer = audio_buffer;
    source.connect(enveloppe);
    enveloppe.connect(master);
    source.playbackRate.setValueAtTime(vitesse, context.currentTime);

    // Enveloppe
    enveloppe.gain.setValueAtTime         (0, now);
    enveloppe.gain.linearRampToValueAtTime(1, now + attack);
    enveloppe.gain.linearRampToValueAtTime(1, now + attack + longueur);
    enveloppe.gain.linearRampToValueAtTime(0, now + attack + longueur + release);

    source.start(context.currentTime, debut, attack + longueur + release)
  }
}

export default Track;
