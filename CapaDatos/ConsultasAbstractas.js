import firebase from 'firebase';
import { imprmirMsjDeOperacion } from '../Utilidades/Utilidades'
import variables from '../Utilidades/Variables'

export default class Consultas {

    constructor() {
        //CONFIGURANDO FIREBASE -------------------------
        const configFirebase = {
            apiKey: variables.API_KEY_FIREBASE,
            authDomain: variables.AUTH_DOMAIN,
            databaseURL: variables.DATA_BASE_URL,
            projectId: variables.PROJECT_ID,
            storageBucket: variables.STORAGE_BUCKET,
            messagingSenderId: variables.MESSAGING_SENDER_ID,
            appId: variables.APP_ID
        };
        //Para evitar que firebase se inicialice 2 veces
        if (!firebase.apps.length) {
            firebase.initializeApp(configFirebase);
        }
        
        this.db = firebase.firestore();
    }

    getDB(){
        return this.db;
    }

    agregarDocumento(coleccion, documento) {
        this.db.collection(coleccion).add(documento)
            .then(() => {
                imprmirMsjDeOperacion("Se agrego un documento", "Documento agregado: ", documento);
                return true;
            })
            .catch((error) => {
                console.log(error);
            })
    }

    agregarPorLotes(coleccion, documentos) {
        //Se obtiene un objeto de escritura por lotes, asi si una transaccion falla, ninguna se agregara
        //El numero máximo de operaciones por lotes permitida es de 500
        let batch = this.db.batch();

        //Creando los documentos
        documentos.forEach(documento => {
            this.db.collection(coleccion).add(documento);
        });

        batch.commit().then(respuesta => {
            imprmirMsjDeOperacion("Transaccion por lotes exitosa", "Se agregaron " + documentos.length + " documentos", documentos);
        })
            .catch(error => {
                console.log("La transaccion por lotes falló");
            })
    }


    async getAllDocumentos(coleccion){
       let respuesta= await this.db.collection(coleccion).get()
        .then(respuesta=>{
            let documentos=[];

            respuesta.forEach(documento=>{
                let dataDocumento = documento.data();
                    dataDocumento.id = documento.id;
                    documentos.push(dataDocumento);
            });

            return documentos;
        })

        return respuesta;
    }

    async getPropiedadDocumento(coleccion,documento,propiedad){
        let respuesta=await this.db.collection(coleccion).doc(documento).get()
        .then(documento=>{
            return documento.get(propiedad);
        });

        return respuesta;
    }

    async getDocumentoPorPropiedad(coleccion,propiedad,comparacion,valor){
        let respuesta=await this.db.collection(coleccion).where(propiedad,comparacion,valor).get()
        .then((resultado)=>{
            let data=null;
            resultado.forEach(doc=>{
                data=doc.data();
            });
            return data;
        });

        return respuesta;
    }

    async getDocumentoPorID(coleccion,idDocumento){
        let respuesta=await this.db.collection(coleccion).doc(idDocumento).get()
        .then((documento)=>{
            return documento.data();
        });

        return respuesta;
    }

    async busquedaLike(coleccion,filtros){
        //{"id":2,"nombre":"Promoción"},{"id":1,"nombre":"Participación"}
        //array-contains-any,in
        //let filtrosL=[{campo:'tipo',operador:'==',valor:1},{campo:'cantidad',operador:'>=',valor:200}];
        /*
        let filtrosL=[{campo:'cantidad',condiciones:[{operador:'>',valor:110},{operador:'<',valor:210}]},
                {campo:'tipo',condiciones:[{operador:'==',valor:1}]}
        ];
        let consulta=this.db.collection("Pruebas");
        
        
        filtrosL.forEach(filtro=>{
           filtro.condiciones.forEach(condicion=>{
               consulta=consulta.where(filtro.campo,condicion.operador,condicion.valor);
           });     
        });
        */
        let consulta=this.db.collection("Pruebas");
        consulta=consulta.where('cantidad','>',110).where('cantidad','<',210);
        consulta=consulta.where('tipo','==',1);
        consulta.get().then(respuesta=>{
            respuesta.forEach(documento=>{
                   console.log("*************************");
                   console.log(documento.id);   
                   console.log(documento.data());
            });
        });

        /*
        await this.db.collection(coleccion).where("tipologia", "array-contains-any",[{"id":1,"nombre":"Participación"},{"id":2,"nombre":"Promoción"}])
        .get()
        .then(respuesta=>{
            respuesta.forEach(documento=>{


                    let dataDocumento = documento.data();
                    console.log("*************************************");
                    console.log(documento.data().nombre);
                    console.log(documento.data().tipologia);
                    
            });
        });
        */

        return [];
        /*
        let documentosFiltrados=[];
        await this.db.collection(coleccion).get()
        .then(respuesta=>{
            respuesta.forEach(documento=>{
                let regex=new RegExp(`^.*(${filtros[0].valor}).*$`);

                if(regex.test(documento.data()['nombre'])){
                    let dataDocumento = documento.data();
                    dataDocumento.id = documento.id;
                    documentosFiltrados.push(dataDocumento);
                }    
            });

        })

        return documentosFiltrados;
        */
    }

    async getDocumentosPaginados(coleccion, idInicial, elementosPorPagina) {
        let respuesta = null;
        
        if (idInicial == null) {
            let pagina = this.db.collection(coleccion).orderBy('nombre').limit(elementosPorPagina);

            respuesta = await pagina.get().then(documentosPagina => {
                let documentos = [];
                
                documentosPagina.forEach((documento) => {
                    let dataDocumento = documento.data();
                    dataDocumento.id = documento.id;
                    documentos.push(dataDocumento);
                });

                return documentos;
            });
        } else {
            let self = this;
            
            let docRef = this.db.collection(coleccion).doc(idInicial);
            let pagina = await docRef.get().then((ultimoDocumento) => {
                return self.db.collection(coleccion).orderBy('nombre').startAfter(ultimoDocumento).limit(elementosPorPagina);
            });
            respuesta = await pagina.get().then(respuesta => {
                let documentos = [];

                respuesta.forEach((documento) => {
                    let dataDocumento = documento.data();
                    dataDocumento.id = documento.id;
                    documentos.push(dataDocumento);
                });

                return documentos;
            });
        }

        return respuesta;
    }
    
}





