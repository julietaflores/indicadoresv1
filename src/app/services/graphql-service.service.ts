import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import gql from 'graphql-tag';
const LOGIN = gql`
  query validarlogin($usuario:String,$clave:String) {
    validarlogin(usuario: $usuario, clave: $clave) {
      idUsuario
      nombreUsuario
      usuario
      fechacreacionusuario
      codIdioma
      estado
      idEmpresa
     
     anioo{
       descripcion_anio{
         auxiliarId
         nombre
       }
       
     }
     
     mess{
       descripcion_mes{
         auxiliarId
         nombre
         
       }
       
       info_mes{
         mesid
         nombre
       }
     }
     
  
     companiaa{
       idCompania
       idEmpresa
        idCompaniaOdoo
         name
       idMonedaOdoo
       imagenUrl
       estado
          monedass{
       descripcion_moneda{
         auxiliarId
         nombre
         
       }
       info_moneda{
          monedaId
       idMonedaOdoo
       name
       symbol
       rate
       estado
       }
      
       
     }
     }
     idioma{
       codigoIdioma
       abreviaturaIdioma
       detalleIdioma
     }
 
     
  
    }
  }
  `;

const QCIFRASNOTABLES = gql`
  query  detalleCifrasNotables($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String, $monedadestino:Int!) {
    detalleCifrasNotables(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes,monedadestino:$monedadestino){
      tablero{
        idTablero
        nombreTablero
        urlTablero
      }
      lista{
        idIndicador
        nombreIndicador
        monto_Mes
        porcentaje_Monto_Mes
        monto_Acumulado
        porcentaje_Monto_Acumulado
        vs
      }
    } 
  }
  `;

const QIPGL = gql`
  query performancelineal($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String, $monedadestino:Int!) {
    performancelineal(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes,monedadestino:$monedadestino){
      tablero{
        idTablero
        nombreTablero
        estadoTablero
        urlTablero   
      }
      listames{
        idPosicion
        nombre
        importeactual
        importeanterior
        porcentajetorta
        detalle_Receptor{
          lista{
            idIndicador
            nombreIndicador
            monto_Mes
            porcentaje_Monto_Mes
            monto_Acumulado
            porcentaje_Monto_Acumulado
            vs
          }
          detallelista{
            idPosicion
            nombre
            precio
          }
        }
      }
      
        listaanual{
     idPosicion
        nombre
        importeactual
        importeanterior
        porcentajetorta
        detalle_Receptor{
          lista{
            idIndicador
            nombreIndicador
            monto_Mes
            porcentaje_Monto_Mes
            monto_Acumulado
            porcentaje_Monto_Acumulado
            vs
          }
          detallelista{
            idPosicion
            nombre
            precio
          }
        }
      }
       
    } 
  }
  `;
const QIPREGION = gql`
  query performanceregion($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String, $monedadestino:Int!) {
    performanceregion(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes,monedadestino:$monedadestino){
      tablero{
        idTablero
        nombreTablero
        estadoTablero
        urlTablero
        
      }
      listames{
        idPosicion
        nombre
        importeactual
        importeanterior
        porcentajetorta
        detalle_Receptor{
          lista{
            idIndicador
            nombreIndicador
            monto_Mes
            porcentaje_Monto_Mes
            monto_Acumulado
            porcentaje_Monto_Acumulado
            vs
          }
          detallelista{
            idPosicion
            nombre
            precio
          }
        }
      }
      
        listaanual{
         idPosicion
        nombre
        importeactual
        importeanterior
        porcentajetorta
        detalle_Receptor{
          lista{
            idIndicador
            nombreIndicador
            monto_Mes
            porcentaje_Monto_Mes
            monto_Acumulado
            porcentaje_Monto_Acumulado
            vs
          }
          detallelista{
            idPosicion
            nombre
            precio
          }
        }
      }
       
  
    } 
  }
  `;
const QIPTOP5 = gql`
  query performancetop5($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String, $monedadestino:Int!) {
    performancetop5(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes,monedadestino:$monedadestino){
      tablero{
        idTablero
        nombreTablero
        estadoTablero
        urlTablero
     
      }
      listames{
        idPosicion
        nombre
         importeactual
        importeanterior
        porcentajetorta
        detalle_Receptor{
          lista{
            idIndicador
            nombreIndicador
            monto_Mes
            porcentaje_Monto_Mes
            monto_Acumulado
            porcentaje_Monto_Acumulado
            vs
          }
          detallelista{
            idPosicion
            nombre
            precio
          }
        }
      }
      
     listaanual{
        idPosicion
        nombre
         importeactual
        importeanterior
        porcentajetorta
        detalle_Receptor{
          lista{
            idIndicador
            nombreIndicador
            monto_Mes
            porcentaje_Monto_Mes
            monto_Acumulado
            porcentaje_Monto_Acumulado
            vs
          }
          detallelista{
            idPosicion
            nombre
            precio
          }
        }
      }
    } 
  }
  `;
const QICV = gql`
  query composicion_ventas($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String) {
    composicion_ventas(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes){
      tablero{
        idTablero
        nombreTablero
        estadoTablero
        urlTablero
        
      }
      lista{
       indicador{
          idIndicador
          nombreIndicador
        estadoIndicador
        iDTablero
        }
        
       lista_mes{
        idPosicion
        nombre
        porcentajetorta
      }
      
        lista_anual{
        idPosicion
        nombre
        porcentajetorta
      }
        
        
        
      }
    } 
  }
  `;
const QIMBLINEAL = gql`
  query  margenbruto_lineal($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String, $monedadestino:Int!) {
    margenbruto_lineal(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes,monedadestino:$monedadestino){
      tablero{
        idTablero
        nombreTablero
        estadoTablero
        urlTablero
     
      }
      lista_mes{
        id
        nombre
        importe_actual
        coste_actual
        porcentaje_margen_actual
        importe_anterior
        coste_anterior
        porcentaje_margen_anterior
        bPS
        calculo_grafico
        porcentajetorta
      }
      
        lista_anual{
        id
        nombre
        importe_actual
        coste_actual
        porcentaje_margen_actual
        importe_anterior
        coste_anterior
        porcentaje_margen_anterior
        bPS
        calculo_grafico
        porcentajetorta
      }
    }
  }
  `;  
const QIMBREGION = gql`
  query margenbruto_region($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String, $monedadestino:Int!) {
    margenbruto_region(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes,monedadestino:$monedadestino){
      tablero{
        idTablero
        nombreTablero
        estadoTablero
        urlTablero
      
      }
      lista_mes{
        id
        nombre
        importe_actual
        coste_actual
        porcentaje_margen_actual
        importe_anterior
        coste_anterior
        porcentaje_margen_anterior
        bPS
        calculo_grafico
        porcentajetorta
      }
      
        lista_anual{
        id
        nombre
        importe_actual
        coste_actual
        porcentaje_margen_actual
        importe_anterior
        coste_anterior
        porcentaje_margen_anterior
        bPS
        calculo_grafico
        porcentajetorta
      }
    } 
  }
  `;
const QIMBTOP5 = gql`
  query margenbruto_top5($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String, $monedadestino:Int!) {
    margenbruto_top5(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes,monedadestino:$monedadestino){
      tablero{
        idTablero
        nombreTablero
        estadoTablero
        urlTablero
        
      }
      lista_mes{
        id
        nombre
        importe_actual
        coste_actual
        porcentaje_margen_actual
        importe_anterior
        coste_anterior
        porcentaje_margen_anterior
        bPS
        calculo_grafico
        porcentajetorta
      }
      
        lista_anual{
        id
        nombre
        importe_actual
        coste_actual
        porcentaje_margen_actual
        importe_anterior
        coste_anterior
        porcentaje_margen_anterior
        bPS
        calculo_grafico
        porcentajetorta
      
      }
    } 
  }
  `;
const QICM = gql`
  query  composicion_margenes($idusuario:Int!,$companiaid:Int!,$categoriacompaniaid:Int!,$tableroid:Int!,$anio:Int!,$mes:String) {
    composicion_margenes(idusuario:$idusuario,companiaid:$companiaid,categoriacompaniaid:$categoriacompaniaid,tableroid:$tableroid,anio:$anio,mes:$mes){
      tablero{
        idTablero
        nombreTablero
        estadoTablero
        urlTablero
        
      }
      lista{
       indicador{
          idIndicador
          nombreIndicador
        estadoIndicador
        iDTablero
        }
        
       lista_mes{
        id
        nombre
        importe_actual
        coste_actual
        porcentaje_margen_actual
        importe_anterior
        coste_anterior
        porcentaje_margen_anterior
        bPS
        calculo_grafico
        porcentajetorta
      }
      
        lista_anual{
        id
        nombre
        importe_actual
        coste_actual
        porcentaje_margen_actual
        importe_anterior
        coste_anterior
        porcentaje_margen_anterior
        bPS
        calculo_grafico
        porcentajetorta
        }
      }
    }
    
  }
  `;
  
@Injectable({
  providedIn: 'root'
})
export class GraphqlServiceService {

  constructor(private apollo: Apollo) { }

  postLogin(name: any, pass: any) {
    return this.apollo.watchQuery({
      query: LOGIN,
      variables: { usuario: name, clave: pass }
    });
  }
  getCifrasNotables(idusuario: number, companiaid: number, categoriacompaniaid: number, tableroid: number, anio: any, mes: String, moneda: number) {
    return this.apollo.watchQuery({
      query: QCIFRASNOTABLES,
      variables: {
        idusuario: idusuario,
        companiaid: companiaid,
        categoriacompaniaid: categoriacompaniaid,
        tableroid: tableroid,
        anio: anio,
        mes: mes,
        monedadestino: moneda
      }
    });
  }
  getPerformanceGeneralLineas(idusuario: any, companiaid: number, categoriacompaniaid: number,
    tableroid: number, anio: any, mes: any, moneda: number) {

    return this.apollo.watchQuery(
      {
        query: QIPGL,
        variables: {
          idusuario: idusuario,
          companiaid: companiaid,
          categoriacompaniaid: categoriacompaniaid,
          tableroid: tableroid,
          anio: anio,
          mes: mes,
          monedadestino: moneda

        }
      }
    );
  }

  getPerformanceGeneralRegiones(idusuario: any, companiaid: number, categoriacompaniaid: number,
    tableroid: number, anio: any, mes: any, moneda: number) {
    return this.apollo.watchQuery(
      {
        query: QIPREGION,
        variables: {
          idusuario: idusuario,
          companiaid: companiaid,
          categoriacompaniaid: categoriacompaniaid,
          tableroid: tableroid,
          anio: anio,
          mes: mes,
          monedadestino: moneda
        },
        fetchPolicy: "no-cache"
      }
    )
  }

  getPerformanceTop5(idusuario: any, companiaid: number, categoriacompaniaid: number,
    tableroid: number, anio: any, mes: any, moneda: number) {
    return this.apollo.watchQuery({

      query: QIPTOP5,
      variables: {

        idusuario: idusuario,
        companiaid: companiaid,
        categoriacompaniaid: categoriacompaniaid,
        tableroid: tableroid,
        anio: anio,
        mes: mes,
        monedadestino: moneda
      }
    })
  }

  getComposicionVentas(idusuario: any, companiaid: number, categoriacompaniaid: number,
    tableroid: number, anio: any, mes: any){
    return this.apollo.watchQuery({
      query: QICV,
      variables: {
        idusuario: idusuario,
        companiaid: companiaid,
        categoriacompaniaid: categoriacompaniaid,
        tableroid: tableroid,
        anio: anio,
        mes: mes
      },
      fetchPolicy: "no-cache"
    })
  }
  getMargenBrutoLineal(idusuario: any, companiaid: number, categoriacompaniaid: number,
    tableroid: number, anio: any, mes: any, moneda: number){
     return this.apollo.watchQuery({
        query: QIMBLINEAL,
        variables: {

          idusuario: idusuario,
          companiaid: companiaid,
          categoriacompaniaid: categoriacompaniaid,
          tableroid: tableroid,
          anio: anio,
          mes: mes,
          monedadestino: moneda


        },
        fetchPolicy: "no-cache"
      })
  }
  getMargenBrutoRegiones(idusuario: any, companiaid: number, categoriacompaniaid: number,
    tableroid: number, anio: any, mes: any, moneda: number){
    return this.apollo.watchQuery({
      query: QIMBREGION,
      variables: {
        idusuario: idusuario,
        companiaid: companiaid,
        categoriacompaniaid: categoriacompaniaid,
        tableroid: tableroid,
        anio: anio,
        mes: mes,
        monedadestino: moneda
      },
      fetchPolicy: "no-cache"
    })
  }
  getMargenBrutoTop5(idusuario: any, companiaid: number, categoriacompaniaid: number,
    tableroid: number, anio: any, mes: any, moneda: number){
   
      return this.apollo.watchQuery({
      query: QIMBTOP5,
      variables: {
        idusuario: idusuario,
        companiaid: companiaid,
        categoriacompaniaid: categoriacompaniaid,
        tableroid: tableroid,
        anio: anio,
        mes: mes,
        monedadestino: moneda
      },
      fetchPolicy: "no-cache"
    })
  }
  getComposicionMargenes(idusuario: any, companiaid: number, categoriacompaniaid: number,
    tableroid: number, anio: any, mes: any){

    return this.apollo.watchQuery({
      query:  QICM,
      variables: {
        idusuario: idusuario,
        companiaid: companiaid,
        categoriacompaniaid: categoriacompaniaid,
        tableroid: tableroid,
        anio: anio,
        mes: mes,
      },
      fetchPolicy: "no-cache"
    })
  }
}
