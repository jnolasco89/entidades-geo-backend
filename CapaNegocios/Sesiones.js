import Consultas from '../CapaDatos/ConsultasAbstractas';

const serv = new Consultas();

export default class Sesiones {

    agregarSesion(sesion) {
        let respuesta = serv.agregarDocumento('Sesiones', sesion);
        return respuesta;
    }

    actualizarSesion(idSesion,actualizacion){
        let respuesta=serv.actualizarDocumento('Sesiones',idSesion,actualizacion);
        return respuesta;
    }

    getSesion(id) {
        let respuesta = serv.getDocumentoPorID('Sesiones', id);
        return respuesta;
    }

    async validarSesion(id){
        let sesion= await this.getSesion(id);
        return sesion.activa;
    }
}