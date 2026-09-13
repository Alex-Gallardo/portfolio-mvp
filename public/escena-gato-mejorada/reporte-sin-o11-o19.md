# Variante de la escena: retirada de O11–O19

Fecha: 12 de septiembre de 2026.

## Resultado

Se editaron los objetos **O11 a O19, ambos incluidos**, sobre [escena-limpia-full-hd.png](escena-limpia-full-hd.png). La solicitud “011 al 019” se corresponde con estos ID del inventario existente, escritos con la letra O.

Los nueve registros están retirados en la nueva imagen. Se conservan **23 objetos/componentes**, incluido el respaldo y base azul **O10**, el dispositivo amarillo **O20** y el gato pequeño de la derecha **O22**.

La imagen base no se sobrescribió. Esta es una variante independiente, exportada a **1920 × 1080 píxeles, Full HD**.

![Escena limpia sin los objetos O11 a O19](escena-limpia-sin-o11-o19-full-hd.png)

## Archivos

| Archivo                                                                        | Contenido                                                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| [escena-limpia-sin-o11-o19-full-hd.png](escena-limpia-sin-o11-o19-full-hd.png) | Imagen final 1920 × 1080; PNG RGB opaco; 3.413.037 bytes.                                        |
| [escena-limpia-sin-o11-o19-nativa.png](escena-limpia-sin-o11-o19-nativa.png)   | Salida nativa del generador, 1672 × 941.                                                         |
| [inventario-sin-o11-o19.json](inventario-sin-o11-o19.json)                     | Los 32 ID originales, con 9 eliminados y 23 conservados; coordenadas y estados de esta variante. |
| [prompts-sin-o11-o19.md](prompts-sin-o11-o19.md)                               | Prompt exacto utilizado y exportación.                                                           |
| [reporte-sin-o11-o19.md](reporte-sin-o11-o19.md)                               | Este registro de análisis y edición.                                                             |

Carpeta: `public/escena-gato-mejorada/`.

Ruta pública: `/escena-gato-mejorada/escena-limpia-sin-o11-o19-full-hd.png`.

## 1. Análisis del alcance

O11–O14 son componentes del mismo gran gato de peluche: cabeza, cuerpo, pata frontal y extremo elevado derecho. Retirarlos en conjunto elimina el gato grande completo, incluyendo pelaje, cara, bigotes y bandas turquesa.

O15 es la figura humana que descansa sobre él. O16–O18 componen el juguete suspendido: varilla, cordón y pez. O19 es el accesorio magenta que cuelga delante de la mejilla. Al retirar el conjunto se libera la región central y la pared situada encima.

**O10 no forma parte del rango solicitado.** El respaldo azul ya era una pieza independiente en el inventario. Su eliminación habría retirado un elemento adicional, por lo que se mantuvo y se completó la superficie oculta.

El gato pequeño blanco/manchado es O22 y tampoco pertenece al rango. Permanece de pie a la derecha, con sus patas levantadas.

## 2. Retirada individual

Las cajas siguientes localizan los objetos en la **imagen base de 1920 × 1080**, antes de esta edición. Son aproximadas, pueden solaparse y no son máscaras de borrado.

| ID  | Elemento retirado                                   | Caja histórica en la imagen base | Resultado revisado      |
| --- | --------------------------------------------------- | -------------------------------- | ----------------------- |
| O11 | Cabeza del gato grande                              | `(491, 318)–(810, 607)`          | Ausente en la variante. |
| O12 | Cuerpo naranja del gato grande                      | `(665, 496)–(1409, 811)`         | Ausente en la variante. |
| O13 | Pata delantera levantada y bandas turquesa          | `(711, 412)–(966, 738)`          | Ausente en la variante. |
| O14 | Extremo elevado derecho del gato: pata/cola curvada | `(1184, 306)–(1398, 579)`        | Ausente en la variante. |
| O15 | Figura humana recostada                             | `(889, 387)–(1204, 580)`         | Ausente en la variante. |
| O16 | Varilla azul                                        | `(842, 225)–(933, 525)`          | Ausente en la variante. |
| O17 | Cordón del juguete                                  | `(783, 183)–(854, 294)`          | Ausente en la variante. |
| O18 | Señuelo naranja con forma de pez                    | `(745, 270)–(797, 326)`          | Ausente en la variante. |
| O19 | Personaje/accesorio magenta colgante                | `(505, 503)–(663, 744)`          | Ausente en la variante. |

### Comprobaciones por grupo

- **O11–O14:** no se observan cabeza lavanda, cuerpo naranja, vientre crema, pata elevada, bandas turquesa, cola/pata dorada ni rasgos del gato grande.
- **O15:** no quedan cabeza, cabello, diadema, ropa azul, brazos, manos, piernas o pies rosados de la figura.
- **O16–O18:** la pared y el espacio sobre el respaldo no contienen varilla, cordón o pez suspendido.
- **O19:** no quedan el muñeco magenta, su rostro, patas, cola, pieza oscura ni unión colgante.

Las sombras propias de estos elementos se integraron con las superficies reconstruidas. No se observan siluetas residuales evidentes.

## 3. O10: respaldo y base azul conservados

### Partes observables en la imagen base

Se veía el contorno exterior azul: extremos altos redondeados, un descenso central en el borde superior y una base inferior blanda apoyada sobre la alfombra. La mayor parte de su superficie interna estaba tapada por el gato grande y la figura.

### Resultado de la reconstrucción

O10 aparece ahora como un soporte acolchado azul vacío, manteniendo su ubicación y silueta general. La superficie del respaldo es continua y la zona inferior forma un borde/base acolchado con profundidad suave. Se mantienen la familia de color azul y la lectura textil.

Caja aproximada de O10 en la variante: **`(488, 280)–(1413, 805)`**.

La forma del interior, su textura y el relieve de la base son **reconstrucciones generativas**. No se puede certificar cómo era exactamente la superficie original detrás de los elementos retirados. La zona añadida se trata como parte de O10, sin asignar ID nuevo ni afirmar que se encontró un objeto antes desconocido.

### Contactos y relaciones actualizados

- O10 sigue apoyado sobre la alfombra O03.
- La pared O01 se ve libre por encima del centro del respaldo.
- El dispositivo amarillo O20 permanece a su derecha, con un solapamiento parcial posible en el borde.
- El gato pequeño O22 y la pantalla O21 mantienen sus posiciones.
- Ya no existen contactos de O10 con O11–O19.

## 4. Elementos conservados

| ID  | Objeto o componente                        | Estado en la variante              |
| --- | ------------------------------------------ | ---------------------------------- |
| O01 | Pared del fondo                            | Conservado visualmente.            |
| O02 | Suelo                                      | Conservado visualmente.            |
| O03 | Alfombra                                   | Conservado visualmente.            |
| O04 | Mueble bajo izquierdo                      | Conservado visualmente.            |
| O05 | Pantalla de la lámpara                     | Conservado visualmente.            |
| O06 | Base verde de la lámpara                   | Conservado visualmente.            |
| O07 | Envase blanco, rosa y lavanda              | Conservado visualmente.            |
| O08 | Envase amarillo y lavanda                  | Conservado visualmente.            |
| O09 | Recipiente pequeño blanco                  | Conservado visualmente.            |
| O10 | Respaldo y base azul del asiento           | Conservado; interior reconstruido. |
| O20 | Dispositivo amarillo de apariencia musical | Conservado visualmente.            |
| O21 | Pantalla rectangular con marco crema       | Conservado visualmente.            |
| O22 | Gato pequeño blanco con manchas            | Conservado visualmente.            |
| O23 | Mueble alto derecho                        | Conservado visualmente.            |
| O24 | Florero verde del nicho                    | Conservado visualmente.            |
| O25 | Hoja oscura del florero                    | Conservado visualmente.            |
| O26 | Libro vertical izquierdo, crema            | Conservado visualmente.            |
| O27 | Libro vertical alto, verde pálido          | Conservado visualmente.            |
| O28 | Libro vertical verde menta                 | Conservado visualmente.            |
| O29 | Libro vertical derecho, marfil             | Conservado visualmente.            |
| O30 | Libro horizontal verde                     | Conservado visualmente.            |
| O31 | Planta grande del extremo derecho          | Conservado visualmente.            |
| O32 | Maceta blanca de la planta grande          | Conservado visualmente.            |

Se revisó la permanencia de ambos envases, un único recipiente blanco, la lámpara, los muebles, los libros, el florero y hoja, la planta lateral, su maceta, el aparato amarillo, la pantalla pequeña y el gato blanco/manchado.

O20 conserva dos antenas de punta azul, tres botones azules y una abertura oscura sin símbolos. O21 sigue con la pantalla vacía. Los envases y lomos permanecen sin palabras legibles. No se añadieron textos, personas o accesorios nuevos.

La revisión confirma continuidad de la composición, no identidad exacta de cada píxel. La generación introduce pequeñas variaciones en fibras, sombras y detalles de superficies que también pueden afectar a objetos conservados.

## 5. Actualización de archivos y trazabilidad

### Documentación principal

Se actualizaron los archivos relacionados para registrar la variante:

- [inventario-objetos.json](inventario-objetos.json): añade la variante y sus enlaces, conservando el inventario de la imagen base.
- [reporte-analisis.md](reporte-analisis.md): incorpora un acceso a esta versión derivada y aclara qué imagen describe el análisis original.
- [prompts-edicion.md](prompts-edicion.md): enlaza el nuevo prompt sin modificar los prompts de la creación anterior.

### Inventario de la variante

Los ID **no se renumeran**. O11–O19 permanecen documentados con estado `eliminado`, pero su campo `final` y su caja normalizada son `null`. Sus coordenadas históricas se conservan en `bbox_imagen_base` para saber dónde estaban.

Los otros 23 registros conservan cajas aproximadas actuales. O10 y O20 se revisaron en particular por los cambios de visibilidad. Las descripciones de la imagen base se mantienen separadas del resultado y las relaciones de esta variante, evitando presentar contactos con objetos retirados como si siguieran vigentes.

Las huellas SHA-256 de la base y las dos nuevas imágenes constan en el JSON. Las imágenes anteriores y la entrega del escritorio se preservaron. Los tres documentos principales del gato se modificaron deliberadamente para registrar la nueva versión.

Las huellas históricas guardadas en la entrega del escritorio describen el estado de los archivos cuando se creó esa entrega. No se reescribieron para ocultar la actualización posterior de la documentación del gato.

### Referencias del proyecto

Se buscaron referencias al archivo y la carpeta en el proyecto. Las referencias encontradas pertenecen a la documentación y los inventarios de estas entregas; no se detectó un componente de la aplicación consumiendo esta imagen. No hizo falta cambiar páginas o componentes para guardar y enlazar la variante.

## 6. Método y formato

La edición se realizó con la herramienta integrada **image_gen**, en una pasada, usando la imagen limpia Full HD anterior como objetivo. El prompt enumera los nueve elementos a retirar y destaca O10, O20 y O22 como elementos que deben conservarse.

La herramienta devolvió **1672 × 941 píxeles**. Se guardó esa salida nativa y se exportó a **1920 × 1080** mediante escalado uniforme Lanczos3 con ajuste central mínimo de proporción, equivalente aproximadamente a un píxel de altura según redondeo. La limpieza y la reconstrucción se hicieron en el generador; la exportación solo normaliza dimensiones.

El resultado es una **exportación Full HD**, no una generación nativa a esa resolución. El aumento lineal desde el nativo es de aproximadamente el 14,8 %.

No se empleó el modo CLI/API de generación. No se entregan capas, máscaras, transparencia ni recortes individuales; se conserva una escena plana RGB opaca.

## 7. Control de calidad

| Criterio                   | Resultado                                                                                                              |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Rango pedido               | O11–O19 inclusive: 9 registros retirados.                                                                              |
| Respaldo O10               | Conservado, vacío y reconstruido en las superficies antes ocultas.                                                     |
| Gato pequeño O22           | Conservado a la derecha.                                                                                               |
| Aparato O20 y pantalla O21 | Conservados, sin glifos ni contenido de pantalla añadido.                                                              |
| Otros componentes          | 23 conservados en total, incluyendo partes de objetos compuestos.                                                      |
| Resolución                 | PNG final 1920 × 1080.                                                                                                 |
| Formato                    | RGB opaco, sin capas.                                                                                                  |
| Base anterior              | Se mantiene como archivo independiente sin sobrescritura.                                                              |
| Documentación              | Inventario nuevo y enlaces desde los tres documentos principales actualizados.                                         |
| Límites                    | Cajas aproximadas y superficies ocultas reconstruidas; no se afirma restauración exacta ni identidad de microtexturas. |

La imagen a usar para esta variante es **escena-limpia-sin-o11-o19-full-hd.png**. El [reporte original](reporte-analisis.md) sigue documentando la versión anterior que contiene los 32 registros.
