# Corre todas las estrategias del escenario base con las semillas de los experimentos y guarda en CSV cada simulación,
# el resumen por estrategia, la mejora de la parada óptima y la tabla de comparación con la referencia real.
from simulacion.experimentos.analisis import comparar_pareado, mejor_estrategia, resumir_por_estrategia, tabla_vida_real
from simulacion.configuracion import CARPETA_RESULTADOS, CARPETA_SET_ACTIVO
from simulacion.experimentos.escenarios import (
    ESTRATEGIA_MEJORADA,
    ESTRATEGIA_SIN_CAJAS,
    ESTRATEGIAS_SIN_OPTIMIZAR,
    armar_escenario,
    correr_escenario,
)
from simulacion.salidas.exportar_csv import guardar_historial_faltantes, guardar_registros, guardar_resultados
from simulacion.modelo.catalogo import Catalogo
from simulacion.modelo.mercado import Mercado
from simulacion.modelo.referencia_real import leer_referencia_real
from simulacion.semillas import SEMILLAS_EXPERIMENTOS

catalogo = Catalogo(CARPETA_SET_ACTIVO)
mercado = Mercado(catalogo)
escenario = armar_escenario(catalogo, mercado)
resultados = correr_escenario(escenario, SEMILLAS_EXPERIMENTOS)

resumenes = resumir_por_estrategia(resultados, escenario.estrategias)
estrategia_base = mejor_estrategia(resumenes, ESTRATEGIAS_SIN_OPTIMIZAR)
# La mejora se mide contra cada estrategia sin optimizar y no solo contra la mejor, porque comprar sueltas y solo cajas
# quedan muy cerca y cuál sale primera puede depender del azar de las réplicas
referencias = (*ESTRATEGIAS_SIN_OPTIMIZAR, ESTRATEGIA_SIN_CAJAS)
comparaciones = [comparar_pareado(resultados, referencia, ESTRATEGIA_MEJORADA) for referencia in referencias]
referencia_real = leer_referencia_real(CARPETA_SET_ACTIVO)
vida_real = tabla_vida_real(resumenes, referencia_real, estrategia_base, ESTRATEGIA_MEJORADA)

guardar_resultados(resultados, CARPETA_RESULTADOS / "resultados.csv")
guardar_historial_faltantes(resultados, CARPETA_RESULTADOS / "historial_faltantes.csv")
guardar_registros(resumenes, CARPETA_RESULTADOS / "resumen_estrategias.csv")
guardar_registros(comparaciones, CARPETA_RESULTADOS / "mejora_parada_optima.csv")
guardar_registros(vida_real, CARPETA_RESULTADOS / "comparacion_vida_real.csv")

print(f"{len(resultados)} simulaciones con {len(SEMILLAS_EXPERIMENTOS)} semillas, guardadas en {CARPETA_RESULTADOS}")
print("Costo neto por estrategia, media e IC 95%")
for resumen in resumenes:
    print(
        f"  {resumen.nombre_legible:28s} ${resumen.costo_neto_medio:8.2f} "
        f"[{resumen.limite_inferior_ic95:8.2f}, {resumen.limite_superior_ic95:8.2f}], "
        f"sobres {resumen.sobres_abiertos_medio:6.1f}, cajas {resumen.cajas_abiertas_medio:4.1f}"
    )
print(f"Mejor estrategia sin optimizar, {estrategia_base}")
print("Reducción del costo neto de la parada óptima, pareada por semilla")
for comparacion in comparaciones:
    print(
        f"  frente a {comparacion.referencia:24s} ${comparacion.reduccion_media:7.2f} "
        f"[{comparacion.reduccion_limite_inferior_ic95:7.2f}, {comparacion.reduccion_limite_superior_ic95:7.2f}], "
        f"{comparacion.reduccion_porcentual:6.1%} "
        f"[{comparacion.reduccion_porcentual_limite_inferior_ic95:6.1%}, "
        f"{comparacion.reduccion_porcentual_limite_superior_ic95:6.1%}], "
        f"mejora en {comparacion.proporcion_replicas_con_mejora:.0%} de las réplicas"
    )
regla = escenario.regla_parada
print(
    f"Venta neta esperada por sobre ${regla.venta_esperada_por_sobre:.2f}; por debajo de "
    f"${regla.precio_umbral(catalogo.caja):.2f} la caja deja ganancia esperada solo con la reventa de sus cartas"
)
if referencia_real is None:
    print("Sin referencia real, falta anotar el precio en referencia_real.json")
else:
    print(f"Referencia real, {referencia_real.fuente} al {referencia_real.fecha_consulta}, ${referencia_real.precio_desde_usd:.2f}")
