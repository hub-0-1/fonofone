import * as FilePond from 'filepond';
import 'filepond/dist/filepond.min.css';

let init_filepond = function () {

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

    console.log('creer audio', e.detail);
    let son = new Audio(e.detail.file.file);
    console.log(son);
  });
}

export default init_filepond;
