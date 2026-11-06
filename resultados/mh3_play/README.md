# Resultados de Modern Horizons 3 (Play Booster)

Salidas de la simulación para el set base de MH3, con los precios congelados al 2026-11-04. Todos los montos están en dólares (USD) y todos los archivos se generan con los scripts de `simulacion/`; no se editan a mano. Para regenerarlos, desde la raíz del repositorio:

```bash
python -m simulacion.experimentos.escenario_base
python -m simulacion.experimentos.sensibilidad
python -m simulacion.verificacion.ejecutar
python -m simulacion.salidas.graficas
```

## Términos que se repiten

- **Estrategia**, la forma de decidir qué comprar. Hay cinco: `comprar_sueltas`, `solo_sobres`, `solo_cajas`, `parada_optima` y `parada_optima_sin_cajas`.
- **Semilla**, el número que fija el azar de una simulación. Con la misma semilla salen los mismos sobres, así que cualquier fila se puede reproducir.
- **Réplica**, una simulación completa, desde la colección vacía hasta tener las 303 cartas.
- **Costo neto**, lo gastado en sobres y cajas más lo pagado por cartas sueltas menos lo recuperado al vender repetidas y cartas fuera del set. Es la métrica que se busca minimizar.
- **IC 95%**, intervalo de confianza del 95% del promedio. Dice entre qué valores está el promedio real, no entre qué valores cae cada simulación.
- **Pareada**, comparación entre dos estrategias semilla por semilla, con la misma suerte inicial, promediando las diferencias.

## Escenario base (`experimentos/escenario_base.py`)

Las cinco estrategias, cada una con las mismas 31 semillas.

| Archivo | Una fila es | Para qué sirve |
|---|---|---|
| `resultados.csv` | Una simulación (estrategia y semilla), 155 filas | El detalle de cada réplica: sobres y cajas abiertos, cartas compradas sueltas, gasto, venta y costo neto |
| `historial_faltantes.csv` | Un producto abierto dentro de una simulación | Cuántas cartas faltaban después de cada sobre o caja; es la base de la gráfica de faltantes |
| `resumen_estrategias.csv` | Una estrategia, 5 filas | Costo neto promedio, desviación, IC 95%, mínimo, máximo y los promedios de las demás salidas |
| `mejora_parada_optima.csv` | Una comparación contra la parada óptima, 4 filas | Cuánto ahorra la parada óptima frente a cada estrategia, en dólares y en porcentaje, con IC 95% y la proporción de réplicas en que gana |
| `comparacion_vida_real.csv` | Una columna de la tabla de la sección 9 del informe | Referencia real, modelo base y modelo mejorado, con el cambio respecto del modelo base. La fila de la referencia real aparece solo cuando se anota el precio de Cardmarket en `simulacion/datos/mh3_play/referencia_real.json` |

`resultados.csv` e `historial_faltantes.csv` se unen por `estrategia` y `semilla`.

Columnas de `resultados.csv`, que también usa `verificacion_solo_sobres.csv`:

| Columna | Significado |
|---|---|
| `sobres_abiertos` | Sobres abiertos en total, contando los 36 de cada caja |
| `cajas_abiertas` | Cajas abiertas |
| `gasto_en_sobres_y_cajas` | Lo pagado por producto sellado |
| `cartas_compradas_sueltas` | Cartas que faltaban al parar y se compraron sueltas |
| `costo_cartas_sueltas` | Lo pagado por esas cartas, con el mínimo de $0.40 por carta y $3.99 de envío si el pedido no llega a $50 |
| `ingreso_venta_neta` | Lo recuperado al vender, ya descontadas las comisiones; una carta que dejaría pérdida cuenta como cero |
| `costo_neto` | `gasto_en_sobres_y_cajas + costo_cartas_sueltas - ingreso_venta_neta` |
| `valor_mercado_sobrantes` | Lo que valen las cartas vendidas a precio de mercado, antes de comisiones |
| `valor_mercado_coleccion` | Lo que vale la colección final de 303 cartas a precio de mercado |

## Sensibilidad (`experimentos/sensibilidad.py`)

Diez variantes, moviendo un precio a la vez: el precio de la caja de 80% a 120% de su valor y la comisión de venta de 6.75% a 14.75%. Cada variante corre las cinco estrategias con las mismas 31 semillas.

| Archivo | Una fila es | Para qué sirve |
|---|---|---|
| `sensibilidad.csv` | Una variante, 10 filas | La mejor estrategia sin optimizar, la parada óptima con su IC 95%, las cajas que abre y la reducción porcentual del costo neto |
| `sensibilidad_por_estrategia.csv` | Una estrategia dentro de una variante, 50 filas | El mismo resumen de `resumen_estrategias.csv`, repetido para cada variante |

En `sensibilidad.csv`, `caja_con_ganancia_por_reventa` vale `True` cuando la caja cuesta menos que lo que se espera recuperar vendiendo sus 36 sobres (`precio_umbral_caja`). En esas variantes abrir cajas deja ganancia por sí solo, la parada óptima termina igual que solo cajas y, si el costo de referencia sale negativo, la reducción porcentual queda vacía (`nan`), porque un porcentaje sobre una ganancia no tiene sentido.

## Verificación (`verificacion/ejecutar.py`)

Pruebas de que el simulador hace lo que dice. Usan semillas distintas a las de los experimentos.

| Archivo | Una fila es | Para qué sirve |
|---|---|---|
| `verificacion_rareza.csv` | Una categoría de la ranura rara (rara, mítica y variante), 3 filas | Frecuencia simulada en 500,000 sobres contra la tasa publicada por Wizards of the Coast, con su error relativo |
| `verificacion_solo_sobres.csv` | Una simulación de solo sobres, 2,000 filas | Las réplicas que usa la comparación con el coleccionista de cupones; mismas columnas que `resultados.csv` |
| `verificacion_coleccionista.csv` | Una sola fila | Sobres para completar el set según la fórmula del coleccionista de cupones contra el promedio simulado, con IC 95% y error relativo |
| `verificacion_por_carta.csv` | Una carta del set base, 303 filas | Probabilidad calculada de que la carta salga en un sobre contra su frecuencia en 200,000 sobres simulados, y si cae dentro del IC 95% |
| `verificacion_por_carta_resumen.csv` | Una sola fila | Proporción de cartas dentro del IC 95% (se espera cerca de 95%) y la venta neta por sobre calculada contra la simulada |
| `verificacion_consistencia.csv` | Una prueba, 6 filas | Casos revisados y fallas de cada prueba de consistencia (cuadre de cuentas y casos límite); todas deben tener cero fallas |

## Gráficas (`salidas/graficas.py`)

Se generan a partir de los CSV anteriores y quedan en `graficas/`.

| Archivo | Qué muestra | Sección del informe |
|---|---|---|
| `faltantes_por_sobre.png` | Cartas faltantes contra sobres abiertos en solo sobres, la curva esperada según las probabilidades exactas y el punto donde para la parada óptima | 10.1, comportamiento del sistema |
| `costo_por_estrategia.png` | Costo neto de cada réplica por estrategia, con su promedio e IC 95% | 10.2, comparación de escenarios |
| `sensibilidad.png` | Costo neto de la parada óptima y de la mejor estrategia sin optimizar ante cambios del precio de la caja y de la comisión | 10.3, sensibilidad |
| `verificacion_coleccionista.png` | Histograma de sobres para completar el set solo con sobres, con la media de la fórmula y la simulada | 8.2, comparación con datos de referencia |
