export interface FaqItem {
  question: string;
  answer: string;
}

export const CRYPTO_FAQ: FaqItem[] = [
  {
    question: "¿Necesito saber de blockchain para tener una dApp?",
    answer:
      "No. Yo me encargo de la parte técnica y diseño la interfaz para que tus usuarios la usen sin fricción, como cualquier app web.",
  },
  {
    question: "¿Qué es una wallet y por qué la necesito?",
    answer:
      "Es la llave digital con la que el usuario firma acciones y demuestra su identidad en la cadena, sin necesidad de contraseñas tradicionales.",
  },
  {
    question: "¿Es seguro un contrato inteligente?",
    answer:
      "Un contrato bien escrito y auditado es muy seguro porque se ejecuta exactamente como está programado. Por eso la auditoría es parte clave del proceso.",
  },
  {
    question: "¿Puedo integrar Web3 en mi web actual?",
    answer:
      "Sí. En muchos casos se puede añadir conexión de wallet, pagos o NFTs a un sitio existente sin rehacerlo por completo.",
  },
];
