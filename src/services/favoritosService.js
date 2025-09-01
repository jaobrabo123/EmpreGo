// * Prisma
const prisma = require('../config/db.js');

class FavoritosService {

    static async candidatoFavoritarEmpresa(empresa, candidato){
        await prisma.favoritos_empresas.create({
            data: {
                cnpj_empresa: empresa,
                id_candidato: candidato
            }
        });
    }

    static async candidatoDesfavoritarEmpresa(empresa, candidato){
        await prisma.favoritos_empresas.deleteMany({
            where: {
                AND: [
                    {cnpj_empresa: empresa},
                    {id_candidato: candidato}
                ]
            }
        });
    }

}

module.exports = FavoritosService;