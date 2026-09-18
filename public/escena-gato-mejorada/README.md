# Escenas de la habitación

Actualizado: 18 de septiembre de 2026.

| Versión         | Imagen Full HD                                                                         | Contenido                                                               | Documentación                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| v1              | [escena-limpia-full-hd_v1.png](escena-limpia-full-hd_v1.png)                           | Escena completa limpia, con gato grande y figura.                       | [Reporte](reporte-analisis.md) · [Historial v1 dentro del inventario](inventario-objetos.json) · [Prompts](prompts-edicion.md)      |
| v2              | [escena-limpia-full-hd_v2.png](escena-limpia-full-hd_v2.png)                           | Sin O11–O19; conserva el respaldo azul O10.                             | [Reporte](reporte-sin-o11-o19.md) · [Inventario](inventario-sin-o11-o19.json) · [Prompt](prompts-sin-o11-o19.md)                    |
| v3              | [escena-limpia-full-hd_v3.png](escena-limpia-full-hd_v3.png)                           | O10 sustituido por escritorio, monitor, silla y accesorios E04–E22.     | [Reporte](reporte-v3-escritorio.md) · [Inventario](inventario-v3-escritorio.json) · [Prompt](prompts-v3-escritorio.md)              |
| v4              | [escena-limpia-full-hd_v4.png](escena-limpia-full-hd_v4.png)                           | Copia de v3 sin los dos envases O07 y O08; escritorio conservado.       | [Reporte](reporte-v4-sin-envases.md) · [Inventario](inventario-v4-sin-envases.json) · [Prompt](prompts-v4-sin-envases.md)           |
| v4-programacion | [escena-limpia-full-hd_v4-programacion.png](escena-limpia-full-hd_v4-programacion.png) | Variante de v4 con interfaz estilo VS Code, lista de archivos y código. | [Reporte](reporte-v4-programacion.md) · [Inventario propio](inventario-v4-programacion.json) · [Prompt](prompts-v4-programacion.md) |
| v5              | [escena-limpia-full-hd_v5.png](escena-limpia-full-hd_v5.png)                           | E08 y E09 eliminados; monitor físico con pantalla vacía.                | [Reporte](reporte-v5-monitor-vacio.md) · [Inventario actual](inventario-objetos.json) · [Prompt](prompts-v5-monitor-vacio.md)       |

Todas las imágenes Full HD miden 1920 × 1080. Sus salidas nativas se conservan como [v1](escena-limpia-nativa_v1.png), [v2](escena-limpia-nativa_v2.png), [v3](escena-limpia-nativa_v3.png), [v4](escena-limpia-nativa_v4.png) y [v5](escena-limpia-nativa_v5.png).

La variante **v4-programacion** parte directamente de v4 y tiene [salida nativa propia](escena-limpia-nativa_v4-programacion.png) e [inventario independiente](inventario-v4-programacion.json). No reemplaza las entregas v4 o v5 ni modifica sus inventarios.

El [inventario principal](inventario-objetos.json) describe ahora la **v5**: 37 registros presentes y 14 ausentes. Su sección `historial_inventarios.v1` conserva el contenido anterior completo del inventario; los JSON de v2, v3 y v4 siguen siendo registros históricos. No se creó un JSON nuevo para v5.

La fuente del conjunto de trabajo está en [escena-escritorio](../escena-escritorio/README.md). Los ID O corresponden a la habitación y los ID E al escritorio; no se renumeran entre versiones.

Los PNG originales sin limpiar ya no están incluidos tras la reorganización. Sus metadatos y las instantáneas de integridad antiguas se conservan como información histórica, no como enlaces activos.
