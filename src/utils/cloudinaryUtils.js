// * Cloudinary + Multer
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require('../config/cloudinary.js');
const cloudinaryRaw = require('../config/cloudinaryRaw.js');
const { v4: uuidv4 } = require('uuid');

// * Função para cancelar envio da imagem para a Cloudinary
async function rollBackDeFoto(fotoId){
    if(fotoId){
        try {
            await cloudinary.uploader.destroy(fotoId, { resourceType: 'image' });
        } catch (erro) {
            console.error('Erro ao cancelar envio da imagem: ' + erro.message);
        }
    }
}

// * Função para cancelar envio de arquivos RAW no Cloudinary
async function rollBackDeArquivoRaw(fileId) {
  if (fileId) {
    try {
      await cloudinaryRaw.uploader.destroy(fileId, { resource_type: 'raw' });
    } catch (erro) {
      console.error('Erro ao cancelar envio do arquivo RAW:', erro.message);
    }
  }
}

// * Storage para as imagens das experiencias
const expStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "experiencias", // * Pasta no Cloudinary para as experiencias
    allowed_formats: ["jpg", "jpeg", "png", 'webp'],
    format: "webp",
    transformation: [
      {  
        quality: 'auto',
        fetch_format: 'webp'
      }
    ],
  },
});
const uploadExperienciaImg = multer({ storage: expStorage });  // * Upload das fotos das experiências

// * Storage para as fotos de perfil
const candidatoPerfilStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fotos_perfil_cand', // * Pasta no Cloudinary para as fotos de perfil dos candidatos
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] ,
    format: 'webp',
    transformation: [
      {  
        quality: 'auto',
        fetch_format: 'webp'
      }
    ],
  }
});
const uploadCandidatoImg = multer({ storage: candidatoPerfilStorage });  // * Upload das fotos de perfil dos candidatos

// * Storage para as fotos de perfil de empresa
const empresaPerfilStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'fotos_perfil_emp', // * Pasta no Cloudinary para as fotos de perfil de empresa
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'] ,
    format: 'webp',
    transformation: [
      {  
        quality: 'auto',
        fetch_format: 'webp'
      }
    ],
  }
});
const uploadEmpresaImg = multer({ storage: empresaPerfilStorage });  // * Upload das fotos de perfil das empresas

// * Storage para arquivos Raw
const rawStorage = new CloudinaryStorage({
  cloudinary: cloudinaryRaw,
  params: {
    folder: 'raw_files', // * Pasta no Cloudinary para os arquivos Raw
    resource_type: 'raw',
    allowed_formats: ['pdf', 'doc', 'docx', 'txt', 'zip'],
    public_id: (req, file) => {
      const ext = file.originalname.split('.').pop();
      return `${uuidv4()}.${ext}`;
    }
  }
});
const uploadRawFile = multer({ storage: rawStorage, limits: { fileSize: 2 * 1024 * 1024 } });  // * Upload dos arquivos Raw

// * Exports
module.exports = { 
    rollBackDeFoto,
    rollBackDeArquivoRaw,
    uploadExperienciaImg,
    uploadCandidatoImg,
    uploadEmpresaImg,
    uploadRawFile
};