import Consultas from "../CapaDatos/ConsultasAbstractas";

export default class Catalogos{
    
    constructor(){
        this.consultas = new Consultas();
    }

    async getCatalogo(nombreCatalogo){
        let catalogo=await this.consultas.getPropiedadDocumento("Catalogos","0bIxyMGal8uFFe6ziZDn",nombreCatalogo);
        return catalogo;
    }
}