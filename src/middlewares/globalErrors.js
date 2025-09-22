const multer = require('multer');

function errorHandler(err, req, res, next) {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'Arquivo muito grande.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ error: 'Formato de arquivo não suportado.' });
        }
        return res.status(400).json({ error: 'Erro no upload do arquivo: ' + err.message });
    }
    next(err);
}

module.exports = errorHandler;