# Verificación del modelo. Reporta el error relativo de los sobres para completar el set contra el coleccionista de
# cupones y de las frecuencias de la ranura rara contra Wizards (objetivo específico 1 del informe), compara la
# probabilidad de cada carta y la venta esperada por sobre que usa la regla de parada contra el generador, y corre las
# pruebas de consistencia interna.
from simulacion.configuracion import CARPETA_RESULTADOS, CARPETA_SET_ACTIVO
from simulacion.experimentos.escenarios import armar_escenario, correr_escenario
from simulacion.salidas.exportar_csv import guardar_registros, guardar_resultados
from simulacion.estrategias.parada_optima import ReglaUnPasoAdelante
from simulacion.modelo.catalogo import Catalogo
from simulacion.modelo.mercado import Mercado
from simulacion.modelo.probabilidades_sobre import calcular_probabilidades_por_sobre
from simulacion.semillas import (
    SEMILLA_VERIFICACION_POR_CARTA,
    SEMILLA_VERIFICACION_RAREZA,
    SEMILLAS_CONSISTENCIA,
    SEMILLAS_VERIFICACION_COLECCIONISTA,
    SOBRES_VERIFICACION_POR_CARTA,
    SOBRES_VERIFICACION_RAREZA,
)
from simulacion.verificacion.coleccionista_cupones import comparar_con_coleccionista, simular_solo_sobres
from simulacion.verificacion.consistencia import revisar_casos_limite, revisar_conservacion
from simulacion.verificacion.frecuencias_rareza import comparar_frecuencias_ranura_rara, leer_ranura_rara
from simulacion.verificacion.probabilidades_por_carta import comparar_probabilidades_por_carta

catalogo = Catalogo(CARPETA_SET_ACTIVO)
mercado = Mercado(catalogo)
probabilidades = calcular_probabilidades_por_sobre(catalogo)

resultados_solo_sobres = simular_solo_sobres(catalogo, mercado, SEMILLAS_VERIFICACION_COLECCIONISTA)
coleccionista = comparar_con_coleccionista(probabilidades, resultados_solo_sobres)
ranura_rara = leer_ranura_rara(CARPETA_SET_ACTIVO)
rarezas = comparar_frecuencias_ranura_rara(
    catalogo, ranura_rara, SOBRES_VERIFICACION_RAREZA, SEMILLA_VERIFICACION_RAREZA
)

venta_esperada = ReglaUnPasoAdelante(probabilidades, mercado, catalogo).venta_esperada_por_sobre
por_carta, resumen_por_carta = comparar_probabilidades_por_carta(
    catalogo, mercado, probabilidades, venta_esperada, SOBRES_VERIFICACION_POR_CARTA, SEMILLA_VERIFICACION_POR_CARTA
)
escenario_consistencia = armar_escenario(catalogo, mercado)
pruebas_consistencia = [
    *revisar_conservacion(correr_escenario(escenario_consistencia, SEMILLAS_CONSISTENCIA), catalogo),
    *revisar_casos_limite(catalogo, mercado, SEMILLAS_CONSISTENCIA),
]

guardar_resultados(resultados_solo_sobres, CARPETA_RESULTADOS / "verificacion_solo_sobres.csv")
guardar_registros([coleccionista], CARPETA_RESULTADOS / "verificacion_coleccionista.csv")
guardar_registros(rarezas, CARPETA_RESULTADOS / "verificacion_rareza.csv")
guardar_registros(por_carta, CARPETA_RESULTADOS / "verificacion_por_carta.csv")
guardar_registros([resumen_por_carta], CARPETA_RESULTADOS / "verificacion_por_carta_resumen.csv")
guardar_registros(pruebas_consistencia, CARPETA_RESULTADOS / "verificacion_consistencia.csv")

print(f"Sobres para completar el set solo con sobres, {coleccionista.replicas} réplicas")
print(f"  fórmula del coleccionista {coleccionista.media_formula:.2f} (desviación {coleccionista.desviacion_formula:.2f})")
print(
    f"  simulación {coleccionista.media_simulada:.2f} (desviación {coleccionista.desviacion_simulada:.2f}), "
    f"IC 95% [{coleccionista.limite_inferior_ic95:.2f}, {coleccionista.limite_superior_ic95:.2f}]"
)
print(f"  error relativo {coleccionista.error_relativo:.2%}")
print(f"Ranura rara en {SOBRES_VERIFICACION_RAREZA} sobres, tasas de {ranura_rara.fuente}")
for rareza in rarezas:
    print(
        f"  {rareza.categoria}, simulada {rareza.frecuencia_simulada:.2%}, pesos de los datos "
        f"{rareza.tasa_pesos_datos:.2%}, Wizards {rareza.tasa_oficial:.2%}, error relativo {rareza.error_relativo:.2%}"
    )
print(f"Probabilidad por carta en {resumen_por_carta.sobres_abiertos} sobres, {resumen_por_carta.cartas_comparadas} cartas")
print(
    f"  dentro del IC 95% {resumen_por_carta.proporcion_dentro_del_ic95:.1%}, error relativo medio "
    f"{resumen_por_carta.error_relativo_medio:.2%}, máximo {resumen_por_carta.error_relativo_maximo:.2%}"
)
print(
    f"  venta neta por sobre, calculada ${resumen_por_carta.venta_esperada_calculada:.3f}, simulada "
    f"${resumen_por_carta.venta_media_simulada:.3f} [{resumen_por_carta.venta_limite_inferior_ic95:.3f}, "
    f"{resumen_por_carta.venta_limite_superior_ic95:.3f}], error relativo {resumen_por_carta.venta_error_relativo:.2%}"
)
print("Pruebas de consistencia")
for prueba in pruebas_consistencia:
    estado = "aprobada" if prueba.aprobada else f"FALLÓ en {prueba.fallas}"
    print(f"  {prueba.prueba}, {prueba.casos} casos, {estado}")
print(f"CSV guardados en {CARPETA_RESULTADOS}")
