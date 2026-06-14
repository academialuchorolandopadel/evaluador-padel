// ====================================================================
// banco-ejercicios.js — Batería inicial de ejercicios por golpe y categoría
// Academia Lucho Rolando — Método FAP
//
// NOTA: Estos ejercicios son una BASE inicial editable. Desde la pestaña
// "Banco de Ejercicios" (solo profesor/fiscal) se pueden agregar, editar o
// eliminar ejercicios, que se guardan en la colección Firestore "bancoEjercicios".
// Este archivo solo siembra los ejercicios por defecto la primera vez.
//
// Estructura por golpe → categoría objetivo (la categoría que se busca alcanzar)
// Cada ejercicio: { nombre, cuantificador, descripcion, series, repeticiones, criterioExito }
// ====================================================================

var BANCO_EJERCICIOS_BASE = {
  smash: {
    nombre: "🏐 Sobre Cabeza (Smash / Bandeja / Víbora)",
    categorias: {
      6: [
        { nombre: "Iniciación al efecto", cuantificador: "Aptitud", descripcion: "Bandeja desde mitad de Zona II rozando la pelota para generar sidespin. El monitor lanza globos cómodos y parejos.", series: 3, repeticiones: 10, criterioExito: "5 de 10 con efecto perceptible" },
        { nombre: "Continuidad básica", cuantificador: "Continuidad", descripcion: "Encadenar bandejas sin fallar; si falla, se reinicia el conteo de la serie. Prioridad al control, no a la potencia.", series: 4, repeticiones: 8, criterioExito: "Completar 2 series sin error" },
        { nombre: "Avanzar tras el golpe", cuantificador: "Desplazamiento", descripcion: "Tras cada bandeja, dar 2-3 pasos hacia la red buscando recuperar posición de Zona I.", series: 4, repeticiones: 6, criterioExito: "Llegar a Zona I en 4 de 6" }
      ],
      5: [
        { nombre: "Efecto consistente drive/revés", cuantificador: "Aptitud", descripcion: "Alternar bandeja de drive y de revés con sidespin controlado, manteniendo profundidad.", series: 3, repeticiones: 12, criterioExito: "8 de 12 con efecto controlado" },
        { nombre: "Buscar las dos paredes", cuantificador: "Direccionamiento", descripcion: "Smash/bandeja dirigida a que la pelota toque pared lateral y luego pared de fondo. Marcar la zona objetivo con conos.", series: 3, repeticiones: 8, criterioExito: "6 de 8 tocan ambas paredes" },
        { nombre: "Cierre de red", cuantificador: "Desplazamiento", descripcion: "Después de la bandeja, cerrar la red con pasos laterales cubriendo el ángulo.", series: 4, repeticiones: 8, criterioExito: "Cierre completo en 6 de 8" }
      ],
      4: [
        { nombre: "Elegir pared a voluntad", cuantificador: "Direccionamiento", descripcion: "Antes de golpear, el monitor indica qué pared buscar primero. El jugador ejecuta según la consigna.", series: 4, repeticiones: 10, criterioExito: "8 de 10 aciertan la secuencia" },
        { nombre: "Control de impulso", cuantificador: "Velocidad", descripcion: "Ejecutar tres velocidades distintas a voluntad sobre bandejas seguidas (lenta, media, a traerla).", series: 4, repeticiones: 10, criterioExito: "7 de 10 en la velocidad pedida" },
        { nombre: "Confiabilidad alta", cuantificador: "Continuidad", descripcion: "Serie larga de bandejas asegurando el golpe; máximo un error permitido por serie.", series: 5, repeticiones: 12, criterioExito: "Máximo 1 error por serie" }
      ],
      3: [
        { nombre: "Smash plano y sidespin de ambos lados", cuantificador: "Aptitud", descripcion: "Alternar smash plano y con efecto buscando la zona objetivo marcada, desde Zona II.", series: 4, repeticiones: 8, criterioExito: "7 de 8 en zona objetivo" },
        { nombre: "Direccionamiento a alambres y cuerpo", cuantificador: "Direccionamiento", descripcion: "Dirigir el smash a 3 dianas: alambre lateral, fondo y cuerpo del rival. Rotar objetivo cada golpe.", series: 4, repeticiones: 9, criterioExito: "6 de 9 en diana indicada" },
        { nombre: "Cambio táctico de velocidad", cuantificador: "Velocidad", descripcion: "Rápido al cuerpo, lento a los costados según consigna del monitor durante la serie.", series: 4, repeticiones: 8, criterioExito: "6 de 8 según plan táctico" },
        { nombre: "Transición rápida a volea", cuantificador: "Desplazamiento", descripcion: "Tras el smash, llegar a posición de volea listo para el contraataque rival.", series: 5, repeticiones: 8, criterioExito: "7 de 8 transiciones completas" }
      ],
      2: [
        { nombre: "Maestría con efecto desde Zona II y III", cuantificador: "Aptitud", descripcion: "Smash con efecto a ángulos extremos desde distintas profundidades, manteniendo eficacia.", series: 5, repeticiones: 10, criterioExito: "9 de 10 en zona objetivo" },
        { nombre: "Direccionamiento total", cuantificador: "Direccionamiento", descripcion: "Smash a cualquier zona del campo rival a pedido, incluso con pelota incómoda.", series: 5, repeticiones: 10, criterioExito: "9 de 10 en zona deseada" },
        { nombre: "Estrategia de velocidad (construcción)", cuantificador: "Velocidad", descripcion: "Alternar velocidades construyendo el punto, usando la 'a traerla' como recurso.", series: 5, repeticiones: 10, criterioExito: "9 de 10 efectivos" },
        { nombre: "Excelencia continua", cuantificador: "Continuidad", descripcion: "Smash sostenido con mínimo margen de error desde Zona II.", series: 5, repeticiones: 15, criterioExito: "Máximo 1 error cada 15" }
      ]
    }
  },

  volea: {
    nombre: "🏸 Volea (Drive y Revés)",
    categorias: {
      6: [
        { nombre: "Bloqueo firme", cuantificador: "Aptitud", descripcion: "Bloquear voleas de drive y revés usando la fuerza del rival, sin acompañar de más.", series: 3, repeticiones: 10, criterioExito: "7 de 10 bloqueos firmes" },
        { nombre: "Buscar profundidad", cuantificador: "Profundidad", descripcion: "Volear intentando que la pelota pase la línea de saque rival. Referencia visual en el piso.", series: 3, repeticiones: 10, criterioExito: "4 de 10 pasan la línea" },
        { nombre: "Mantener posición", cuantificador: "Desplazamiento", descripcion: "No retroceder tras volea corta; mantener el sitio en la red.", series: 4, repeticiones: 6, criterioExito: "4 de 6 sin retroceder" }
      ],
      5: [
        { nombre: "Volea con slice", cuantificador: "Aptitud", descripcion: "Impactar con slice de drive y de revés a voluntad, manteniendo el control.", series: 3, repeticiones: 12, criterioExito: "8 de 12 con slice controlado" },
        { nombre: "Volea a los alambres", cuantificador: "Direccionamiento", descripcion: "Dirigir la volea a los alambres laterales. Conos como objetivo.", series: 3, repeticiones: 8, criterioExito: "6 de 8 a zona objetivo" },
        { nombre: "Profundidad constante", cuantificador: "Profundidad", descripcion: "Series de voleas buscando que todas piquen pasando la línea de saque.", series: 3, repeticiones: 12, criterioExito: "8 de 12 profundas" },
        { nombre: "Cierre horizontal", cuantificador: "Desplazamiento", descripcion: "Moverse lateralmente tras volear para cubrir el ángulo del próximo golpe.", series: 4, repeticiones: 8, criterioExito: "6 de 8 con cierre correcto" }
      ],
      4: [
        { nombre: "Volea alta con potencia", cuantificador: "Aptitud", descripcion: "Volea alta de Zona II impactada plano y con potencia hacia el fondo.", series: 4, repeticiones: 8, criterioExito: "6 de 8 profundas y firmes" },
        { nombre: "Angular y buscar alambres", cuantificador: "Direccionamiento", descripcion: "Alternar volea al medio y angulada a los costados según consigna.", series: 4, repeticiones: 10, criterioExito: "8 de 10 al objetivo" },
        { nombre: "Cambio de ángulo deliberado", cuantificador: "Velocidad", descripcion: "Variar la velocidad de impulso buscando distintos ángulos en la misma serie.", series: 4, repeticiones: 8, criterioExito: "6 de 8 con cambio claro" },
        { nombre: "Red en ataque", cuantificador: "Desplazamiento", descripcion: "Avanzar y cerrar la red tras la volea, ganando metros hacia adelante.", series: 4, repeticiones: 10, criterioExito: "8 de 10 ganando red" }
      ],
      3: [
        { nombre: "Globo de volea de ataque", cuantificador: "Aptitud", descripcion: "Globo de volea con intención ofensiva para ganar la red, con buenos resultados.", series: 4, repeticiones: 10, criterioExito: "7 de 10 globos efectivos" },
        { nombre: "Volea corta con slice", cuantificador: "Velocidad", descripcion: "Jugar la pelota corta con mucho slice a picar en Zona I, a voluntad.", series: 4, repeticiones: 8, criterioExito: "6 de 8 cortas controladas" },
        { nombre: "Profundidad plano y slice", cuantificador: "Profundidad", descripcion: "Alternar voleas profundas planas y con slice; objetivo Zona III.", series: 4, repeticiones: 10, criterioExito: "7 de 10 en Zona III" },
        { nombre: "Duelo de voleas", cuantificador: "Desplazamiento", descripcion: "Intercambio de voleas rápidas manteniendo siempre la posición de ataque.", series: 5, repeticiones: 8, criterioExito: "7 de 8 sin retroceder" }
      ],
      2: [
        { nombre: "Volea total (plano, slice, drop)", cuantificador: "Aptitud", descripcion: "Alternar bloqueo, slice y drop desde Zona I y II con igual eficacia.", series: 5, repeticiones: 10, criterioExito: "9 de 10 ejecuciones correctas" },
        { nombre: "Direccionamiento completo", cuantificador: "Direccionamiento", descripcion: "Dirigir a alambres, ángulo o cuerpo del rival a pedido, sin dificultad.", series: 5, repeticiones: 10, criterioExito: "9 de 10 al objetivo" },
        { nombre: "Dominio de velocidades", cuantificador: "Velocidad", descripcion: "Alternar velocidades según posición simulada de rivales, ejecutando drop con precisión.", series: 5, repeticiones: 10, criterioExito: "9 de 10 con criterio" },
        { nombre: "Profundidad de élite", cuantificador: "Profundidad", descripcion: "Series largas donde casi todas las voleas son profundas.", series: 5, repeticiones: 10, criterioExito: "9 de 10 profundas" }
      ]
    }
  },

  pegadaFondo: {
    nombre: "🎯 Pegada de Fondo (Drive y Revés)",
    categorias: {
      6: [
        { nombre: "Iniciación al slice de drive", cuantificador: "Aptitud", descripcion: "Empezar a usar slice de drive sobre bolas cómodas desde el fondo.", series: 3, repeticiones: 10, criterioExito: "5 de 10 con slice" },
        { nombre: "Dirigir paralelo", cuantificador: "Direccionamiento", descripcion: "Buscar tiros paralelos por el pasillo. Conos marcando el corredor.", series: 3, repeticiones: 10, criterioExito: "5 de 10 en el pasillo" },
        { nombre: "Reducir errores no forzados", cuantificador: "Error", descripcion: "Series de fondo asegurando el golpe; minimizar fallos sobre bola pareja.", series: 4, repeticiones: 8, criterioExito: "Máximo 2 errores por serie" }
      ],
      5: [
        { nombre: "Slice y plano combinados", cuantificador: "Aptitud", descripcion: "Alternar drive plano y con slice manteniendo media altura y dirección cruzada.", series: 3, repeticiones: 12, criterioExito: "8 de 12 controlados" },
        { nombre: "Cruzado y paralelo", cuantificador: "Direccionamiento", descripcion: "Alternar dirección cruzada y paralela según consigna del monitor.", series: 3, repeticiones: 12, criterioExito: "8 de 12 al objetivo" },
        { nombre: "Aflojar la pelota", cuantificador: "Velocidad", descripcion: "Imprimir velocidad o aflojar según conveniencia, dejando alguna corta.", series: 4, repeticiones: 10, criterioExito: "7 de 10 con cambio claro" },
        { nombre: "Tomar la red en ataque", cuantificador: "Desplazamiento", descripcion: "Avanzar tras pegar de fondo aunque la bola no haya pasado al rival.", series: 4, repeticiones: 8, criterioExito: "6 de 8 ganando metros" }
      ],
      4: [
        { nombre: "Globo y rasante de revés", cuantificador: "Aptitud", descripcion: "Revés tanto rasante como en globo, eligiendo según la altura de la bola.", series: 4, repeticiones: 10, criterioExito: "7 de 10 ejecuciones limpias" },
        { nombre: "Paralelo, cruzado y al medio", cuantificador: "Direccionamiento", descripcion: "Dirigir a tres zonas distintas en la misma serie, con buen acierto.", series: 4, repeticiones: 9, criterioExito: "6 de 9 al objetivo" },
        { nombre: "Cambios de velocidad ambos lados", cuantificador: "Velocidad", descripcion: "Variar velocidad de drive y revés (plano o slice) según consigna.", series: 4, repeticiones: 8, criterioExito: "6 de 8 con cambio claro" },
        { nombre: "Baja el factor de error", cuantificador: "Error", descripcion: "Series largas de fondo con mínimo error, asegurando bajo presión.", series: 5, repeticiones: 12, criterioExito: "Máximo 1 error cada 6 bolas" }
      ],
      3: [
        { nombre: "Slice o plano sin dificultad", cuantificador: "Aptitud", descripcion: "Drive y revés con slice o plano a voluntad, incluyendo globo llovido.", series: 4, repeticiones: 10, criterioExito: "8 de 10 limpias" },
        { nombre: "Rasantes que obligan a levantar", cuantificador: "Direccionamiento", descripcion: "Tiros muy rasantes a los pies del rival para forzar la levantada.", series: 4, repeticiones: 8, criterioExito: "6 de 8 rasantes a objetivo" },
        { nombre: "Fuerte al medio, suave a laterales", cuantificador: "Velocidad", descripcion: "Combinar potencia al medio y bola suave a los costados en la misma serie.", series: 4, repeticiones: 10, criterioExito: "7 de 10 con criterio" },
        { nombre: "Avanzar para contraatacar", cuantificador: "Desplazamiento", descripcion: "Tras impactar, movimiento vertical buscando ganar la red.", series: 5, repeticiones: 8, criterioExito: "7 de 8 con avance" }
      ],
      2: [
        { nombre: "Maestría plano y slice", cuantificador: "Aptitud", descripcion: "Drive y revés con total habilidad; globo llovido o al rincón a voluntad.", series: 5, repeticiones: 10, criterioExito: "9 de 10 limpias" },
        { nombre: "Cualquier zona con maestría", cuantificador: "Direccionamiento", descripcion: "Dirigir a medio, laterales o cuerpo según convenga, incluso sobrepique direccionado.", series: 5, repeticiones: 10, criterioExito: "9 de 10 al objetivo" },
        { nombre: "Velocidad para presionar", cuantificador: "Velocidad", descripcion: "Fuerte al cuerpo, suave rasante a laterales para contraatacar.", series: 5, repeticiones: 10, criterioExito: "9 de 10 con criterio" },
        { nombre: "Excelencia (factor de error mínimo)", cuantificador: "Error", descripcion: "Series muy largas con error casi nulo desde el fondo.", series: 5, repeticiones: 15, criterioExito: "Máximo 1 error cada 8 bolas" }
      ]
    }
  },

  salidaPared: {
    nombre: "🧱 Salida de Pared (Drive y Revés)",
    categorias: {
      6: [
        { nombre: "Salida con globo", cuantificador: "Aptitud", descripcion: "Levantar en globo de drive y revés desde pared de fondo, de forma consistente.", series: 3, repeticiones: 10, criterioExito: "5 de 10 globos buenos" },
        { nombre: "Buscar el medio", cuantificador: "Direccionamiento", descripcion: "Dirigir la salida al medio de la pista para asegurar. Cono central de referencia.", series: 3, repeticiones: 10, criterioExito: "5 de 10 al medio" },
        { nombre: "Levantar pelotas bajas", cuantificador: "Levantadas", descripcion: "Salir de bolas que quedan muy cerca del piso tras el rebote.", series: 4, repeticiones: 8, criterioExito: "4 de 8 levantadas limpias" }
      ],
      5: [
        { nombre: "Salida con slice", cuantificador: "Aptitud", descripcion: "Drive y revés con slice tras la pared, agregando control y efecto.", series: 3, repeticiones: 12, criterioExito: "8 de 12 con slice" },
        { nombre: "Cambiar dirección de revés", cuantificador: "Direccionamiento", descripcion: "Salida de revés variando el ángulo, no siempre al mismo lado.", series: 3, repeticiones: 10, criterioExito: "7 de 10 a zona pedida" },
        { nombre: "Control de velocidad", cuantificador: "Velocidad", descripcion: "Elegir la intensidad de la salida según la consigna (firme o suave).", series: 4, repeticiones: 10, criterioExito: "7 de 10 con cambio" },
        { nombre: "Levantar con globo y slice", cuantificador: "Levantadas", descripcion: "Levantar bolas bajas saliendo con globo o rasante según altura del rebote.", series: 4, repeticiones: 12, criterioExito: "9 de 12 levantadas buenas" }
      ],
      4: [
        { nombre: "Salida rasante de ambos lados", cuantificador: "Aptitud", descripcion: "Impactar rasante de drive y revés tras la pared con confianza.", series: 4, repeticiones: 8, criterioExito: "6 de 8 rasantes limpias" },
        { nombre: "Cruzados y paralelos", cuantificador: "Direccionamiento", descripcion: "Globos y rasantes dirigidos tanto cruzados como paralelos según consigna.", series: 4, repeticiones: 10, criterioExito: "8 de 10 al objetivo" },
        { nombre: "Fuerte o aflojando", cuantificador: "Velocidad", descripcion: "Impactar fuerte o aflojar hacia costados/medio según convenga.", series: 4, repeticiones: 8, criterioExito: "6 de 8 con criterio" },
        { nombre: "Levantar a muy baja altura", cuantificador: "Levantadas", descripcion: "Salir de bolas pegadas al piso dirigiéndolas cruzadas o paralelas.", series: 5, repeticiones: 10, criterioExito: "8 de 10 levantadas dirigidas" }
      ],
      3: [
        { nombre: "Plano o slice a voluntad", cuantificador: "Aptitud", descripcion: "Drive y revés plano o slice según la situación tras la pared.", series: 4, repeticiones: 10, criterioExito: "8 de 10 limpias" },
        { nombre: "Alambres, ángulos y medio", cuantificador: "Direccionamiento", descripcion: "Muy buen direccionamiento a las tres zonas con globos paralelos y cruzados.", series: 4, repeticiones: 9, criterioExito: "7 de 9 al objetivo" },
        { nombre: "Manejo del slice y la velocidad", cuantificador: "Velocidad", descripcion: "Cambios de velocidad tanto de drive como de revés con buen slice.", series: 4, repeticiones: 10, criterioExito: "7 de 10 con criterio" },
        { nombre: "Tomar la red tras salir", cuantificador: "Levantadas", descripcion: "Levantar muy bajo y avanzar verticalmente hacia la red para ganar el punto.", series: 5, repeticiones: 10, criterioExito: "8 de 10 con avance" }
      ],
      2: [
        { nombre: "Salida perfecta de ambos lados", cuantificador: "Aptitud", descripcion: "Plano o slice de drive y revés sin dificultad ante cualquier rebote.", series: 5, repeticiones: 10, criterioExito: "9 de 10 limpias" },
        { nombre: "Cualquier zona rasante o globo", cuantificador: "Direccionamiento", descripcion: "Direccionar a ángulos, alambres y medio rasante; globo llovido paralelo y cruzado.", series: 5, repeticiones: 10, criterioExito: "9 de 10 al objetivo" },
        { nombre: "Velocidad según circunstancia", cuantificador: "Velocidad", descripcion: "Suave a laterales, fuerte al medio o al cuerpo del rival según convenga.", series: 5, repeticiones: 10, criterioExito: "9 de 10 con criterio" },
        { nombre: "Levantadas de élite", cuantificador: "Levantadas", descripcion: "Salir sin problemas de bolas muy bajas con rasantes o globos profundos.", series: 5, repeticiones: 12, criterioExito: "11 de 12 levantadas buenas" }
      ]
    }
  }
};

window.BANCO_EJERCICIOS_BASE = BANCO_EJERCICIOS_BASE;
