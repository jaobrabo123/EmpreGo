// * Cloudinary + Multer
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require('../config/cloudinary.js');
//const cloudinaryRaw = require('../config/cloudinaryRaw.js');
const storage = multer.memoryStorage();

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
      await cloudinary.uploader.destroy(fileId, { resource_type: 'raw' });
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
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
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

// * Storage para imagens do chat
const uploadChatImage = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedMimes = [
      "image/jpeg",
      "image/png",
      "image/webp"
    ];
    const allowedExt = [
      "jpg", "jpeg", "png", "webp"
    ];
    if (allowedMimes.includes(file.mimetype) && allowedExt.includes(file.originalname.split('.').pop())) callback(null, true);
    else callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }
});

// * Uploader para os Raw Files
async function chatImageUploader(file, idFile) {
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: idFile,
        folder: 'chat_images',
        format: 'webp',
        quality: 'auto'
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });
  return result;
}

// * Storage para arquivos Raw
const uploadRawFile  = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    const allowedMimes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
      "application/zip",
      "application/x-zip-compressed",
      "multipart/x-zip",
      "application/vnd.rar",
      "application/x-rar-compressed",
      "application/x-compressed"
    ];
    const allowedExt = [
      "pdf", "doc", "docx", "txt", "zip", "rar"
    ];
    if (allowedMimes.includes(file.mimetype) && allowedExt.includes(file.originalname.split('.').pop())) callback(null, true);
    else callback(new multer.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
  }
});

// * Uploader para os Raw Files
async function rawUploader(file, idFile) {
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'raw',
        public_id: idFile,
        folder: 'raw_files',
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    stream.end(file.buffer);
  });
  return result;
}

// * Exports
module.exports = { 
    rollBackDeFoto,
    rollBackDeArquivoRaw,
    uploadExperienciaImg,
    uploadCandidatoImg,
    uploadEmpresaImg,
    uploadChatImage,
    chatImageUploader,
    uploadRawFile,
    rawUploader
};