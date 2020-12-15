import * as FilePond from 'filepond';
import 'filepond/dist/filepond.min.css';

let init_filepond = function (fonofone) {

  let pond = FilePond.create({
    name: 'filepond'
  });

  document.body.appendChild(pond.element);

  // TODO s'assurer que ça fonctionne pour plusieurs fonofones
  let filepond = document.querySelector('.filepond--root');
  filepond.addEventListener('FilePond:addfile', e => { 
    
    if(!e.detail.file.fileType.match(/audio/)) {
      throw "type de fichier non valide";
    }

    fonofone.audio = new Audio(e.detail.file.file);
    console.log(e.detail.file, e.detail.file.file);
    console.log(fonofone.audio);

    var audioCtx = new (AudioContext || webkitAudioContext)();
    var reader1 = new FileReader();
    reader1.onload = function(file) {
          
      // Decode audio
      audioCtx.decodeAudioData(file).then(function(buffer) {

        var soundSource = audioCtx.createBufferSource();
        soundSource.buffer = buffer;
      }).then(function(res) {
        console.log(res);
      });
    };
    reader1.readAsArrayBuffer(e.detail.file.file);
    fonofone.export();
  });
}

export default init_filepond;
