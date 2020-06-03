import express from 'express';
import multer from 'multer';//Multer es un middleware node.js para manejar multipart/form-data, es principalmente usado para subir archivos.
import bodyparser from 'body-parser';//Analiza el cuerpo de la solicitud entrante en un middleware antes de sus manejadores. Permite accesar a la información del cuerpo de dicha petición.
import morgan from 'morgan';//Se utiliza para registrar detalles de la solicitud 
import cors from 'cors';//Se utiliza para habilitar permisos cors

export default class Config {
    constructor() {
        //CONFIGURANDO MULTER ---------------------------
        const storage = multer.diskStorage({
            destination: function (req, file, cb) {
                cb(null, 'uploads/');
            },
            filename: function (req, file, cb) {
                //cb(null, Date.now()+'-'+file.originalname);
                cb(null, file.originalname);
            },
            fileFilter: function (req, file, cb) {
                if (!file.originalname.match(/\.(xlsx|xls)$/)) {
                    return cb(new Error('Solo archivos de excel'));
                }
                cb(null, true);
            }
        });
        this.upload = multer({ storage: storage });

        //AGREGANDO LOS COMPONENTES A EXPRESS -------------
        this.app = express();
        this.app.use(cors({ origin: true,
  methods: ["POST","GET"],}));
        this.app.use(bodyparser.json());
        this.app.use(bodyparser.urlencoded({ extended: true }));
        this.app.use(morgan('dev'));

    }

    getApp(){
        return this.app;
    }

    getUpload(){
        return this.upload;
    }

}
