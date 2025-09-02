// * Prisma
const prisma = require('../config/db.js');
const Erros = require('../utils/erroClasses.js');

class FavoritosService {

    static async candidatoFavoritarEmpresa(empresa, candidato){
        const favoritadasCount = await prisma.favoritos_empresas.count({
            where: {
                id_candidato: candidato
            }
        });

        if(favoritadasCount>=10) throw new Erros.ErroDeValidacao("Você não pode favoritar mais de 10 empresas.");

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