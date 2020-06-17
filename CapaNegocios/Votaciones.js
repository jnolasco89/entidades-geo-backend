import Consultas from '../CapaDatos/ConsultasAbstractas';
import lodash from 'lodash';
import { generarIDaleatorio, generarPasswordAleatorio, imprmirMsjDeOperacion } from '../Utilidades/Utilidades';

const serv = new Consultas();

export default class Votaciones {

    async agregarVotacion(votacion) {
        //===========================================================================================
        //PASO 1: CREANDO PASSWORD PARA LOS VOTANTES (Proceamiento de JSON, sin realizar ninguna consulta)
        //===========================================================================================
        votacion.votantes.forEach(votante => {
            let pass = generarPasswordAleatorio(6);
            votante.password = pass;
        });

        //===========================================================================================
        //PASO 2: CREANDO EL ID PARA LAS PAPELETAS Y PARA LAS OPCIONES DE CADA PAPELETA (Proceamiento de JSON, sin realizar ninguna consulta)
        //===========================================================================================
        //Se recorren las papeletas y las opciones para generar cada uno de sus respectivos IDs
        votacion.papeletas.forEach(papeleta => {
            papeleta.id = generarIDaleatorio();
            papeleta.opciones.forEach((opcion, index) => {
                opcion.valor = generarIDaleatorio();
                delete opcion.foto;
            });
        });
        //Se almacena temporalmente en otra variable la lista de los votantes, ya que en la base de
        //datos los votantes deben de ser una subcoleccion y no un arreglo dentro del objeto Votacion
        let coleccionVotantes = votacion.votantes;
        delete votacion.votantes;

        //===========================================================================================
        //PASO 3: CREANDO LA ESTRUCTURA PARA EL OBJETO CONTEO (Proceamiento de JSON, sin realizar ninguna consulta)
        //===========================================================================================
        let papeletasConteo = [];

        //Recorriendo las papeletas de la votacion para crear las papeletas del conteo
        votacion.papeletas.forEach(papeleta => {
            let opcionesPapeletaConteo = [];
            papeleta.opciones.forEach(opcion => {
                let opcionPapeletaConteo = {
                    valor: opcion.valor,
                    nombreFoto: opcion.nombreFoto,
                    nombre: opcion.nombre,
                    totalVotos: 0
                };
                opcionesPapeletaConteo.push(opcionPapeletaConteo);
            });

            let papeletaConteo = {
                id: papeleta.id,
                titulo: papeleta.titulo,
                opciones: opcionesPapeletaConteo
            };

            papeletasConteo.push(papeletaConteo);
        });

        let conteo = {
            idVotacion: null,
            totalVotantes: 0,
            votosEmitidos: 0,
            papeletas: papeletasConteo
        };

        //===========================================================================================
        //PASO 4: HACIENDO LAS CONSULTAS POR LOTES PARA AGREGAR LA VOTACION Y SU CONTEO
        //===========================================================================================
        //Primeramente se realiza la escritura por lotes de la votacion y de su conteo.
        //Una ejecucion por lotes puede escribir como maximo 500 documentos en una sola transaccion
        let db = serv.getDB();
        //let batchVotacionConteo = db.batch();

        //Agregando la votacion
        let idVotacion = await db.collection('Votaciones').add(votacion).then(votacionCreada => {
            return votacionCreada.id;
        });
        votacion.id = idVotacion;

        //Agregando el conteo
        conteo.idVotacion = idVotacion;
        let idConteo = await db.collection('Conteos').add(conteo).then(conteoCreada => {
            return conteoCreada.id;
        });

        //===========================================================================================
        //PASO 5: AGREGANDO LOS VOTANTES
        //===========================================================================================
        //Creando la estructura para las paepeltas de los votantes
        let papeletasVotante = [];
        for (let i = 0; i < votacion.papeletas.length; i++) {
            let papeleta = votacion.papeletas[i];
            papeletasVotante.push({
                marcada: false,
                idPapeletaPlantilla: papeleta.id,
                opcionMarcada: null,
                titulo:papeleta.titulo
            });
        }

        //Si la votacion y su conteo son agregados, se procede a crear la subcoleccion para la votacion
        for (let index = 0; index < coleccionVotantes.length; index++) {
            let votante = coleccionVotantes[index];

            //Agregando el votante
            let idVotante = await db.collection('Votaciones').doc(idVotacion).collection('votantes').add(votante).then(votanteCreado => {
                return votanteCreado.id;
            });


            for (let i = 0; i < papeletasVotante.length; i++) {
                let p = papeletasVotante[i];
                let votanteRef = db.collection('Votaciones').doc(idVotacion).collection('votantes').doc(idVotante);
                await votanteRef.collection('papeletas').add(p);
            }
        }

        /*
        let votantesPorLotes = async (votantes) => {
            let bacthVotantes = db.batch();

            for (let index = 0; index < votantes.length; index++) {
                await db.collection('Votaciones').doc(idVotacion).collection('votantes').add(votantes[index]);
            }

            bacthVotantes.commit().then(() => {
                imprmirMsjDeOperacion("Votantes agregados", `Se agregaron ${votantes.length} votantes`, null);
            }).catch(error => {
                imprmirMsjDeOperacion("La transaccion por lotes para los votantes falló", "No se pudo crear la votacion ni el conteo", error);
            })
        }

        //Agregando los votantes
        let paginas = Math.ceil(coleccionVotantes.length / 500);
        if (paginas == 1) {
            votantesPorLotes(coleccionVotantes);
        } else if (paginas > 1) {
            let indexInicial = 0;
            let ultimoIndice = 500;
            for (let i = 0; i < paginas; i++) {
                let subArray = null;
                //La ultima pagina
                if (i == (paginas - 1)) {
                    subArray = coleccionVotantes.slice(indexInicial, coleccionVotantes.length);
                } else {//Cualquier otra pagina
                    let subArray = coleccionVotantes.slice(indexInicial, ultimoIndice);
                }
                votantesPorLotes(subArray);
                indexInicial = ultimoIndice;
                ultimoIndice += 500;
            }
        }
        */

    }

    async validarVoto(idVotacion, idVotante, idPapeleta) {
        console.log(idVotacion + " ---- " + idVotante + " ---- " + idPapeleta + " >>>>>>>>>>>>>>>>>>>>>>>>>");
        let db = serv.getDB();
        let permitirVoto = await db.collection('Votaciones').doc(idVotacion)
            .collection('votantes').doc(idVotante)
            .collection('papeletas').doc(idPapeleta)
            .get().then(papeleta => {
                if (papeleta.data().marcada) {
                    return false;
                } else {
                    return true;
                }
            });

        return permitirVoto;
    }

    async getVotacion(idVotacion, idVotante) {
        let bd = serv.getDB();
        let votacion = await bd.collection('Votaciones').doc(idVotacion).get().then(votacion => {
            let dataVotacion = votacion.data();
            dataVotacion.id = votacion.id;
            return dataVotacion;
        });
        await bd.collection('Votaciones').doc(idVotacion).collection('votantes').doc(idVotante).collection('papeletas').get().then(papeletasVotante => {
            votacion.papeletas.forEach((papeletaPlantilla,index) => {
                papeletasVotante.forEach(papeleta => {
                    let papeletaVotante = papeleta.data();
                    papeletaVotante.id = papeleta.id;
                    
                    console.log(`${papeletaPlantilla.id}==${papeletaVotante.idPapeletaPlantilla} && ${papeletaVotante.marcada}==false  >>>>>>>>>>>>`);
                    if (papeletaPlantilla.id == papeletaVotante.idPapeletaPlantilla && papeletaVotante.marcada == false) {
                        papeletaPlantilla.idPorigen = papeletaPlantilla.id;
                        papeletaPlantilla.id = papeletaVotante.id;
                        papeletaPlantilla.marcada = false;
                    } 
                    else if (papeletaPlantilla.id == papeletaVotante.idPapeletaPlantilla && papeletaVotante.marcada) {
                        //papeletaVotante.titulo=papeletaPlantilla.titulo;
                        delete papeletaVotante.idPapeletaPlantilla;
                        delete papeletaVotante.opcionMarcada.valor;
                        delete papeletaVotante.id;
                        votacion.papeletas[index]=papeletaVotante;
                    }

                });
            });
        });
        return votacion;
    }


    async validarVotacion(id) {
        let db = serv.getDB();

        let votacion = await db.collection('Votaciones').doc(id).get().then(documento => {
            return documento.data();
        });

        if (votacion.estado.id == 1) {
            return true;
        }
        return false;

        /*
       let votacionActiva=await serv.getDocumentoPorID('Votaciones',id).then(votacion=>{
            if(votacion.estado.id*1==1){
                return true;
            }
            return false;
       });
       */
    }

    async emitirVoto(idVotacion, idPapeleta, idPapeletaOrigen, opcionSeleccionada, idVotante, usuario) {

        let conteo = await serv.getDocumentoPorPropiedad('Conteos', 'idVotacion', '==', idVotacion);


        let voto = null;
        conteo.papeletas.forEach(papeleta => {
            if (papeleta.id * 1 == idPapeletaOrigen * 1) {
                papeleta.opciones.forEach(opcion => {
                    if (opcion.valor * 1 == opcionSeleccionada.valor * 1) {
                        conteo.votosEmitidos++;
                        if (papeleta.votosEmitidos == undefined) {
                            papeleta.votosEmitidos = 1;
                        } else {
                            papeleta.votosEmitidos++;
                        }
                        opcion.totalVotos++;


                        let fecha = new Date();
                        let [anio, mes, dia] = fecha.toISOString().substr(0, 10).split('-');
                        let hora = fecha.getHours();
                        let minutos = fecha.getMinutes();
                        let segundos = fecha.getSeconds();
                        let milisegundos = fecha.getMilliseconds();

                        voto = {
                            fecha: `${dia}/${mes}/${anio}`,
                            hora: `${hora}:${minutos}:${segundos}.${milisegundos}`,
                            fechaObjeto: fecha,
                            usuario: usuario
                        };
                    }
                });
            }
        });


        await serv.actualizarDocumento('Conteos', conteo.id, conteo);
        let db = serv.getDB();

        await db.collection('Conteos').doc(conteo.id).collection('votos').add(voto);

        await db.collection('Votaciones').doc(idVotacion)
            .collection('votantes').doc(idVotante)
            .collection('papeletas').doc(idPapeleta)
            .update({ marcada: true, opcionMarcada: opcionSeleccionada });

        let papeleta = await db.collection('Votaciones').doc(idVotacion)
            .collection('votantes').doc(idVotante)
            .collection('papeletas').doc(idPapeleta)
            .get().then(documento => {
                let data = documento.data();
                return data;
            });

        return papeleta;

    }

    validarVotoUsuario(usuario) {

    }

    async getVotaciones(idsVotaciones) {
        let votaciones = [];

        for (let index = 0; index < idsVotaciones.length; index++) {
            let idVotacion = idsVotaciones[index];
            let votacion = await serv.getDocumentoPorID('Votaciones', idVotacion);
            votaciones.push(votacion);
        }

        votaciones = lodash.sortBy(votaciones, ['estado']);

        return votaciones;
    }

    getVotantePorUsuario(idVotacion, usuario) {
        let respuesta = serv.getDocumentoEnSubcoleccionPorPropiedad('Votaciones', idVotacion, 'votantes', 'usuario', '==', usuario);
        return respuesta;
    }

}