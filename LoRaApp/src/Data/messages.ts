export interface MessageServer {
  dst: string;              // destinatário
  src: string;              // origem (usuário ou dispositivo)
  fct: "read" | "write";    // função desejada
  param: string;            // parâmetros desejado
  val: string;
}
