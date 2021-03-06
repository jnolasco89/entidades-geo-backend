import readXlsxFile from 'read-excel-file/node';
import Consultas from '../CapaDatos/ConsultasAbstractas';
import { imprmirMsjDeOperacion } from '../Utilidades/Utilidades'
import lodash from 'lodash';

const serv = new Consultas();

export default class Entidades {

    async leerArchivoExcel(file) {
        //__dirname obtiene el directorio del proyecto
        let respuesta = await readXlsxFile(__dirname + '/uploads/' + file.originalname, { sheet: 1 }).then(function(filas) {
            //Armando cada objeto a partir de la data
            let objetosLeidos = [];
            let encabezados = filas[0];

            for (let i = 1; i < filas.length; i++) {
                let fila = filas[i];

                //Recorriendo encabezados y armando JSON  
                let objJson = '{';
                encabezados.forEach((encabezado, index) => {
                    let valor = null;
                    if (fila[index] != null) {
                        if (isNaN(fila[index])) {
                            valor = '"' + fila[index] + '"';
                        } else {
                            valor = 1 * fila[index];
                        }
                    }

                    if (index == encabezados.length - 1) {
                        objJson += '"' + encabezado + '":' + valor + '}';
                    } else {
                        objJson += '"' + encabezado + '":' + valor + ',';
                    }
                });
                objJson = JSON.parse(objJson);

                objetosLeidos.push(objJson);
            }
            //console.log(filas);
            imprmirMsjDeOperacion("Se ejecuto el metodo de lectura de archivo", 'Se leyeron los siguientes datos del archivo: "' + file.originalname + '"', objetosLeidos);

            //Agregando las entidades a la base de datos
            serv.agregarPorLotes("Entidades", objetosLeidos);

            return objetosLeidos;
        });

        return respuesta;
    }

    async getAllEntidades() {
        let entidades= await serv.getAllDocumentos("Entidades");
        this.formatearEntidades(entidades);
        return entidades;
        /*
        let entidades = [];
        let respuesta = await serv.getAllDocumentos("Entidades");
        respuesta.forEach(entidad => {
            entidad.data.id = entidad.id;
            entidad.data.sedes.forEach((sede) => {
                this.formatearPersonasDeContacto(sede.personasDeContacto);

                if (sede.coordenadas == undefined) {
                    sede.coordenadas = {
                        latitud: null,
                        longitud: null
                    }
                }
            });
            entidades.push(
                entidad.data
            );

        });

        return entidades;
        */
    }

    agregarEntidad(entidad) {
        let respuesta = serv.agregarDocumento("Entidades",entidad);
        return respuesta;
    }

    async getEntidadesPorFiltro(cadena) {
        serv.busquedaLike("Entidades", cadena);
    }

    async getEntidadPorId(id) {
        let respuesta = await serv.getDocumentoPorID("Entidades", id);

        respuesta.tipologiaTexto = this.formatearTipologiasEntidad(respuesta.tipologia);    
        respuesta.sedes.forEach((sede) => {
            this.formatearPersonasDeContacto(sede.personasDeContacto);
            sede.contactos=this.formatearContactos(sede.contactos);
            
            if (sede.coordenadas == undefined) {
                sede.coordenadas = {
                    latitud: null,
                    longitud: null
                }
            }
        });

        return respuesta;
    }

    async getEntidadesPaginadas(idInicial, elementosPorPagina) {
        //let respuesta = await serv.getDocumentosPaginados("Entidades", idInicial, elementosPorPagina);
        let respuesta = await serv.getDocumentosPaginados("Entidades", idInicial, elementosPorPagina);
        //totalDocumentos:totalElementos,
        //documentos:respuesta
        this.formatearEntidades(respuesta.documentos);
        return respuesta;
        /*
        let entidades = [];

         respuesta.forEach(entidad => {
            entidad.sedes.forEach((sede) => {
                let contactosFormateados=this.formatearContactos(sede.contactos);
                sede.contactos=contactosFormateados;
                
                this.formatearPersonasDeContacto(sede.personasDeContacto);
                if (sede.coordenadas == undefined) {
                    sede.coordenadas = {
                        latitud: null,
                        longitud: null
                    }
                }
            });
            entidades.push(
                entidad
            );
        });

        return entidades;
        */
    }

    async getEntidadesFiltradas(filtroTexto, filtroTipologias){
        //let entidades= await serv.getAllDocumentos("Entidades");
        //let respuesta=await serv.busquedaLike("Entidades",[{valor:'Pro'}]);
        let entidades=[];
        let db=serv.getDB();    
        let consulta;
        
        if(filtroTipologias.length>0){
            consulta=db.collection("Entidades").where("tipologia", "array-contains-any",filtroTipologias);
        }else{
            consulta=db.collection("Entidades");
        }

        //await db.collection("Entidades").where("tipologia", "array-contains-any",[{"id":1,"nombre":"Participación"},{"id":2,"nombre":"Promoción"}])
        await consulta
        .get()
        .then(respuesta=>{
            respuesta.forEach(documento=>{
                //console.log(documento.data());
                if(filtroTexto!=null){
                    filtroTexto=filtroTexto.toUpperCase();
                    let regex=new RegExp(`^.*(${filtroTexto}).*$`);

                    if(regex.test(documento.data()['nombre'].toUpperCase())){
                        let dataDocumento = documento.data();
                        dataDocumento.id = documento.id;
                        entidades.push(this.formatearEntidad(dataDocumento));
                    }    
                }else{
                    let dataDocumento = documento.data();
                    dataDocumento.id = documento.id;
                    entidades.push(this.formatearEntidad(dataDocumento));
                }    
            });
        });
        
        return entidades;
    }

     formatearContactos(contactos) {
        let contactosPorGrupo = lodash.groupBy(contactos, "tipo.id");
        
        let contactosFormateados = lodash.map(contactosPorGrupo, (contactos) => {
            
            let grupoContactos = {
                tipo: null,
                nombreS: null,
                nombreP: null,
                contactos: []
            }
            
            contactos.forEach((c, index) => {
                if (index == 0) {
                    //console.log(JSON.stringify(c)+" ====> "+c.id);
                    //console.log(JSON.stringify(c)+" ====> ");
                    grupoContactos.tipo = c.tipo.id;
                    grupoContactos.nombreS = c.tipo.nombreS;
                    grupoContactos.nombreP = c.tipo.nombreP;
                    grupoContactos.contactos.push(c.valor);
                }
                else {
                    grupoContactos.contactos.push(c.valor);
                }
                
            });

            return grupoContactos;
        });

        return contactosFormateados;
    }

    formatearPersonasDeContacto(personasDeContacto) {
        personasDeContacto.forEach((persona) => {
            let nombreCompleto =
                (persona.titulo != null ? persona.titulo + ". " : "") +
                (persona.primerNombre != null ? persona.primerNombre + " " : "") +
                (persona.segundoNombre != null ? persona.segundoNombre + " " : "") +
                (persona.tercerNombre != null ? persona.tercerNombre + " " : "") +
                (persona.primerApellido != null ? persona.primerApellido + " " : "") +
                (persona.segundoApellido != null ? persona.segundoApellido + " " : "");

            persona.nombreCompleto = nombreCompleto;
            persona.contactos = this.formatearContactos(persona.contactos);
        });
    }

    formatearTipologiasEntidad(tipologias){
            let tipologiasFormateadas = '';
            tipologias.forEach((tip, index) => {
                if (index < (tipologias.length - 1)) {
                    tipologiasFormateadas += tip.nombre + ", ";
                }
                else {
                    tipologiasFormateadas += tip.nombre;
                }
            });
            return tipologiasFormateadas;
    }

    formatearEntidad(entidad){
        entidad.sedes.forEach((sede) => {
           if (sede.coordenadas == undefined) {
              sede.coordenadas = {
                latitud: null,
                longitud: null
              }
           }
           let contactosFormateados=this.formatearContactos(sede.contactos);
           sede.contactos=contactosFormateados;
                
            this.formatearPersonasDeContacto(sede.personasDeContacto);
          
        });

        return entidad;
    }

    formatearEntidades(entidades){
        entidades.forEach(enti=>{
            this.formatearEntidad(enti);
        });
    }
}


