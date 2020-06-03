let imprmirMsjDeOperacion=(titulo,descripcion,data)=>{
    //Dando formato al titulo
    let relleno=100-titulo.length;
    let rellenoDerecho=Math.round(relleno/2);
    let rellenoIzquierdo=relleno-rellenoDerecho;

    let tituloFinal="";
    for(let i=0;i<rellenoDerecho;i++){
        tituloFinal+="*";
    }
    tituloFinal+= titulo.toUpperCase();
    for(let i=0;i<rellenoIzquierdo;i++){
        tituloFinal+="*";
    }

    //imprimiendo el titulo
    console.log(tituloFinal);
    console.log(descripcion);
    if(data!=null){
        if(Array.isArray(data)){
            console.log(data);
        }else{
            console.log(JSON.stringify(data));
        }
    }
    
}

let ordernarArreglo=(arreglo)=>{

}

export {imprmirMsjDeOperacion}