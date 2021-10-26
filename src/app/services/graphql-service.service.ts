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
     
     monedass{
       descripcion_moneda{
         auxiliarId
         nombre
         
       }
       info_moneda{
          monedaId
       idMonedaEmpresaOdoo
       name
       symbol
       rate
       estado
       }
      
       
     }
     companiaa{
       idCompania
       idEmpresa
        idCompaniaOdoo
         name
       idMonedaEmpresaOdoo
       estado
       
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
@Injectable({
  providedIn: 'root'
})
export class GraphqlServiceService {

  constructor( private apollo: Apollo) { }

  postLogin(name:any,pass:any) {
    return this.apollo.watchQuery({
      query: LOGIN,
      variables: { usuario:name,clave:pass }
    });
  }
  getCifrasNotables(idusuario:number,companiaid:number,categoriacompaniaid:number,tableroid:number,anio:any,mes:String,moneda:number){
      alert(companiaid);
    return this.apollo.watchQuery({
      query: QCIFRASNOTABLES,
          variables: {
            idusuario: idusuario,
            companiaid:companiaid,
            categoriacompaniaid:categoriacompaniaid,
            tableroid:tableroid,
            anio: anio,
            mes: mes,
            monedadestino: moneda
          }
    });
  }
}
