# Verificación del generador (objetivo específico 1 del informe), reporta el error relativo de los sobres para
# completar el set contra el coleccionista de cupones y de las frecuencias de la ranura rara contra Wizards.
from simulacion.configuracion import CARPETA_RESULTADOS, CARPETA_SET_ACTIVO
from simulacion.exportar_csv import guardar_registros, guardar_resultados
from simulacion.modelo.catalogo import Catalogo
from simulacion.modelo.mercado import Mercado
from simulacion.modelo.probabilidades_sobre import calcular_probabilidades_por_sobre
from simulacion.semillas import (
    SEMILLA_VERIFICACION_RAREZA,
    SEMILLAS_VERIFICACION_COLECCIONISTA,
    SOBRES_VERIFICACION_RAREZA,
)
from simulacion.verificacion.coleccionista_cupones import comparar_con_coleccionista, simular_solo_sobres
from simulacion.verificacion.frecuencias_rareza import comparar_frecuencias_ranura_rara, leer_ranura_rara

catalogo = Catalogo(CARPETA_SET_ACTIVO)
mercado = Mercado(catalogo)

resultados_solo_sobres = simular_solo_sobres(catalogo, mercado, SEMILLAS_VERIFICACION_COLECCIONISTA)
coleccionista = comparar_con_coleccionista(calcular_probabilidades_por_sobre(catalogo), resultados_solo_sobres)
ranura_rara = leer_ranura_rara(CARPETA_SET_ACTIVO)
rarezas = comparar_frecuencias_ranura_rara(
    catalogo, ranura_rara, SOBRES_VERIFICACION_RAREZA, SEMILLA_VERIFICACION_RAREZA
)

guardar_resultados(resultados_solo_sobres, CARPETA_RESULTADOS / "verificacion_solo_sobres.csv")
guardar_registros([coleccionista], CARPETA_RESULTADOS / "verificacion_coleccionista.csv")
guardar_registros(rarezas, CARPETA_RESULTADOS / "verificacion_rareza.csv")

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
print(f"CSV guardados en {CARPETA_RESULTADOS}")
