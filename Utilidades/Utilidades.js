import jwt from 'jsonwebtoken';
import variables from './Variables';

let imprmirMsjDeOperacion = (titulo, descripcion, data) => {
    //Dando formato al titulo
    let relleno = 100 - titulo.length;
    let rellenoDerecho = Math.round(relleno / 2);
    let rellenoIzquierdo = relleno - rellenoDerecho;

    let tituloFinal = "";
    for (let i = 0; i < rellenoDerecho; i++) {
        tituloFinal += "*";
    }
    tituloFinal += titulo.toUpperCase();
    for (let i = 0; i < rellenoIzquierdo; i++) {
        tituloFinal += "*";
    }

    //imprimiendo el titulo
    console.log(tituloFinal);
    console.log(descripcion);
    if (data != null) {
        if (Array.isArray(data)) {
            console.log(data);
        } else {
            console.log(JSON.stringify(data));
        }
    }

}

let crearToken = (fechaVencEnSegundos, tokenData) => {
    let token = jwt.sign({
        algorithm: 'RS256',
        exp: fechaVencEnSegundos,
        data: tokenData
    }, variables.KEY_TOKEN);
    return token;
}

let generarPasswordAleatorio = (largo) => {
    let getRango = () => {
        let caso = Math.floor(Math.random() * (3 - 1)) + 1;
        switch (caso) {
            case 1:
                return { min: 65, max: 90 };//A-B
            case 2:
                return { min: 97, max: 122 }//a-b
            case 3:
                return { min: 48, max: 57 }//0-9
        }
    }

    let pass='';
    for (let index = 0; index < largo; index++) {
        let rango = getRango();
        pass+= String.fromCharCode(Math.floor(Math.random() * (rango.max - rango.min)) + rango.min);
    }
    return pass;    
};

let generarIDaleatorio = () => {
    //let random = Math.floor(Math.random() * (10000 - 1)) + 1;
    let id=(`${Math.floor(Math.random() * (10000 - 1)) + 1}${Date.now()}${Math.floor(Math.random() * (10000 - 1)) + 1}`)*1;
    return id;
}

let verificarToken = (token, tipo) => {
    let respuesta = {
        valido: false,
        msj: 'No hay token',
        data: null
    };
    if (token != undefined || token != null) {
        let tokenDecodificado = jwt.decode(token, { complete: true });

        try {
            jwt.verify(token, variables.KEY_TOKEN);
            if (tipo != null ? tokenDecodificado.payload.data.tipo != tipo * 1 : false) {
                respuesta.valido = false;
                respuesta.msj = 'El tipo de token es incorrecto';
            }
            respuesta.valido = true;
            respuesta.msj = 'Token valido';
            respuesta.data = tokenDecodificado.payload.data;
        } catch (err) {
            respuesta.valido = false;
            respuesta.msj = 'Token expirado';
        }
    }

    return respuesta;
}


export { imprmirMsjDeOperacion, verificarToken, crearToken, generarIDaleatorio, generarPasswordAleatorio }