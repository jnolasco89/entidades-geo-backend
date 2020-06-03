import Consultas from '../CapaDatos/ConsultasAbstractas';

const serv = new Consultas();

export default class Usuario {

    async getUsuario(usuario){
        let respuesta=await serv.getDocumentoPorPropiedad('Usuarios','usuario','==',usuario);
        return respuesta;
    }

}