import Consultas from '../CapaDatos/ConsultasAbstractas';

const serv = new Consultas();

export default class Usuario {

    async getUsuario(usuario){
        let respuesta=await serv.getDocumentoPorPropiedad('Usuarios','usuario','==',usuario);
        return respuesta;
    }

    getVotacionesUsuario(idUsuario){
        let respuesta=serv.getPropiedadDocumento('Usuarios', idUsuario, 'votaciones');
        return respuesta;
    }

    getUsuarioVotacion(idVotacion, usuario){
        console.log("LLEGA HASTA GETUSUARIOVOTACION >>>>>>>>>>>>>>"+idVotacion);
        let respuesta=serv.getDocumentoEnSubcoleccionPorPropiedad('Votaciones', idVotacion, 'votantes','usuario', '==', usuario);
        //let respuesta=serv.getSubcoleccion('Votaciones',idVotacion,'votantes');
        return respuesta;
    }
}