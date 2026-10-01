import type { LegalDoc } from "@/lib/legal";

// BORRADOR: debe revisarlo un abogado o contador antes de publicarse.
// Todo lo marcado como [[PENDIENTE: ...]] hay que completarlo o decidirlo.
const TITULAR = "[[PENDIENTE: nombre completo o razón social]]";

export const terminos: LegalDoc = {
  title: "Términos y condiciones",
  updated: "[[PENDIENTE: fecha de publicación]]",
  sections: [
    { heading: "Quién ofrece los cursos", body: [
      `Los cursos de IA NAILS son ofrecidos por ${TITULAR}, CUIT/DNI [[PENDIENTE: número]], con domicilio en Av. San Martín 180, Bernal, Buenos Aires, Argentina (en adelante, "IA NAILS").`,
      "Podés escribirnos por WhatsApp al [[PENDIENTE: número]] o a [[PENDIENTE: email de contacto]].",
    ] },
    { heading: "Qué incluye tu compra", body: [
      "Al comprar un curso accedés a las clases grabadas y a los materiales de ese curso desde tu cuenta, durante [[PENDIENTE: período de acceso: de por vida o cantidad de meses]]. El detalle de cada curso (temario, duración y materiales) figura en su página.",
    ] },
    { heading: "Tu cuenta", body: [
      "Para comprar y ver los cursos necesitás crear una cuenta con datos verdaderos. Sos responsable de mantener la confidencialidad de tu contraseña.",
      "La cuenta y el acceso a los cursos son personales e intransferibles: no se pueden compartir ni revender.",
    ] },
    { heading: "Precios y pago", body: [
      "Los precios se expresan en pesos argentinos [[PENDIENTE: confirmar si incluyen impuestos]]. El pago se procesa a través de Mercado Pago, con los medios de pago que esa plataforma habilite. IA NAILS no almacena los datos de tu tarjeta.",
      "El acceso se habilita automáticamente cuando Mercado Pago confirma el pago. En pagos en efectivo o pendientes puede demorar hasta que se acrediten.",
    ] },
    { heading: "Propiedad intelectual", body: [
      `Los videos, textos, imágenes, materiales y la marca IA NAILS pertenecen a ${TITULAR} y están protegidos por la Ley 11.723.`,
      "Queda prohibido copiar, grabar, descargar (salvo los materiales indicados como descargables), compartir, publicar o revender el contenido sin autorización escrita. El incumplimiento puede dar lugar a la suspensión del acceso y a las acciones legales que correspondan.",
    ] },
    { heading: "Uso responsable de lo aprendido", body: [
      "Los cursos tienen fines educativos y técnicos. Aplicá las técnicas con los cuidados de higiene y seguridad que se explican en las clases, y consultá a un profesional de la salud ante alergias, lesiones o afecciones de la piel o de las uñas.",
      "IA NAILS no garantiza resultados económicos o profesionales determinados. [[PENDIENTE: ¿se entrega certificado o diploma? Indicar condiciones o eliminar esta mención]]",
    ] },
    { heading: "Arrepentimiento y devoluciones", body: [
      "Podés ejercer tu derecho de arrepentimiento con el [Botón de arrepentimiento](/arrepentimiento). Las condiciones están explicadas en la [política de devoluciones](/devoluciones).",
    ] },
    { heading: "Atención al cliente", body: [
      "Atendemos consultas por [[PENDIENTE: canales: teléfono, WhatsApp, email]], de [[PENDIENTE: días y horarios]]. Área responsable de la atención: [[PENDIENTE: nombre del área o persona]].",
    ] },
    { heading: "Suspensión del acceso", body: [
      "IA NAILS puede suspender el acceso a un curso ante un uso contrario a estos términos, como compartir la cuenta o redistribuir el contenido.",
    ] },
    { heading: "Cambios en estos términos", body: [
      "Podemos actualizar estos términos. Rige la versión publicada en el sitio y los cambios no afectan las compras ya realizadas.",
    ] },
    { heading: "Ley aplicable y reclamos", body: [
      "Se aplica la ley argentina, incluida la Ley 24.240 de Defensa del Consumidor. Podés presentar reclamos ante la autoridad de aplicación de defensa del consumidor de tu jurisdicción. [[PENDIENTE: consultar si corresponde mostrar el enlace a la Dirección de Defensa del Consumidor]]",
    ] },
  ],
};

export const privacidad: LegalDoc = {
  title: "Política de privacidad",
  updated: "[[PENDIENTE: fecha de publicación]]",
  sections: [
    { heading: "Quién es responsable de tus datos", body: [
      `${TITULAR}, con domicilio en Av. San Martín 180, Bernal, Buenos Aires, Argentina. Contacto: [[PENDIENTE: email de contacto]].`,
    ] },
    { heading: "Qué datos recopilamos", body: [
      "Tu nombre, tu email y tu contraseña (que se guarda cifrada), el historial de tus compras y tu progreso en los cursos.",
      "Los datos de pago los procesa Mercado Pago: IA NAILS no almacena datos de tarjetas.",
      "Para solicitudes de arrepentimiento, los datos que completes en el formulario.",
    ] },
    { heading: "Para qué los usamos", body: [
      "Para crear y gestionar tu cuenta, procesar tus compras y darte acceso a los cursos, enviarte los mails vinculados a tu cuenta y a tus compras, atender tus consultas y solicitudes, y cumplir obligaciones legales.",
      "No vendemos tus datos ni los usamos para publicidad de terceros. [[PENDIENTE: ¿se enviarán novedades o promociones? De ser así, pedir tu consentimiento por separado]]",
    ] },
    { heading: "Con quién los compartimos", body: [
      "Usamos proveedores para operar el sitio: Mercado Pago (pagos), Supabase (cuentas y base de datos), Vercel (alojamiento), Bunny (videos) y Resend (envío de mails). [[PENDIENTE: ajustar esta lista cuando estén contratados]]",
      "Estos proveedores pueden almacenar o procesar datos en servidores ubicados fuera de la Argentina. [[PENDIENTE: revisión legal sobre transferencias internacionales de datos]]",
    ] },
    { heading: "Cookies", body: [
      "Usamos cookies técnicas necesarias para mantener tu sesión iniciada. No usamos cookies de publicidad. [[PENDIENTE: actualizar si se agrega analítica]]",
    ] },
    { heading: "Cuánto tiempo los conservamos", body: [
      "Mientras tengas una cuenta y durante los plazos que exijan las obligaciones legales y contables.",
    ] },
    { heading: "Tus derechos", body: [
      "Podés pedir el acceso, la rectificación o la supresión de tus datos escribiendo a [[PENDIENTE: email de contacto]].",
      "El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley Nº 25.326. La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley Nº 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.",
      "[[PENDIENTE: consultar si corresponde inscribir la base de datos en el Registro Nacional de Bases de Datos]]",
    ] },
    { heading: "Seguridad", body: [
      "Aplicamos medidas razonables para proteger tus datos: conexiones cifradas y acceso restringido a la información.",
    ] },
    { heading: "Cambios en esta política", body: [
      "Podemos actualizarla. Rige la versión publicada en el sitio.",
    ] },
  ],
};

export const devoluciones: LegalDoc = {
  title: "Devoluciones y arrepentimiento",
  updated: "[[PENDIENTE: fecha de publicación]]",
  sections: [
    { heading: "Tu derecho de arrepentimiento", body: [
      "Si comprás un curso en este sitio, podés arrepentirte dentro de los 10 días corridos desde que celebraste la compra, sin costo para vos. No tenés que explicar el motivo.",
      "Para hacerlo usá el [Botón de arrepentimiento](/arrepentimiento). No necesitás tener una cuenta ni hacer trámites adicionales.",
    ] },
    { heading: "Cómo funciona", body: [
      "1. Completás el formulario del botón de arrepentimiento.",
      "2. Recibís un código de identificación de tu solicitud, en pantalla y dentro de las 24 horas por [[PENDIENTE: medio de confirmación]].",
      "3. Te devolvemos el importe por el mismo medio de pago que usaste, en [[PENDIENTE: plazo de reintegro]], y se desactiva el acceso al curso.",
    ] },
    { heading: "Cuándo no aplica", body: [
      "El derecho de arrepentimiento no aplica en los casos que prevé la normativa, por ejemplo cuando el servicio ya fue utilizado o consumido.",
      "[[PENDIENTE: decisión con abogado o contador: cuándo se considera \"utilizado\" un curso online (¿al ver la primera clase? ¿al superar cierto porcentaje?) y si se ofrece reintegro total o parcial]]",
    ] },
    { heading: "Problemas con tu compra", body: [
      "Si pagaste y no ves tu curso, si se te cobró dos veces o si tenés cualquier otro inconveniente, escribinos a [[PENDIENTE: email o WhatsApp de contacto]] y lo resolvemos.",
    ] },
  ],
};
