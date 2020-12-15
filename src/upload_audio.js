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

    fonofone.update_fichier_audio(e.detail.file.file);

    // Utiliser des medias pour enregistrer live
    //https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices
  });
}

export default init_filepond;
