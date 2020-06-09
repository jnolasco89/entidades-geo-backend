import Consultas from '../CapaDatos/ConsultasAbstractas';

const serv = new Consultas();

export default class Votaciones {

    agregarVotacion(votacion){
        let respuesta=serv.agregarDocumento('Votaciones',votacion);
        return respuesta;
    }

    async getVotacion(id){
        console.log("DESDE getVotacion ***********>>>>>>>>> "+id);
        let respuesta=await serv.getDocumentoPorID('Votaciones',id);
        return respuesta;
    }

}