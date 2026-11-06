# Corre cada estrategia con las semillas de los experimentos y guarda los resultados en CSV.
from simulacion.configuracion import CARPETA_RESULTADOS, CARPETA_SET_ACTIVO
from simulacion.estrategias.parada_optima import ReglaUnPasoAdelante
from simulacion.estrategias.solo_sobres import SoloSobres
from simulacion.exportar_csv import guardar_historial_faltantes, guardar_resultados
from simulacion.modelo.catalogo import Catalogo
from simulacion.modelo.mercado import Mercado
from simulacion.modelo.probabilidades_sobre import calcular_probabilidades_por_sobre
from simulacion.motor import simular
from simulacion.semillas import SEMILLAS_EXPERIMENTOS

catalogo = Catalogo(CARPETA_SET_ACTIVO)
mercado = Mercado(catalogo)
estrategias = [
    ReglaUnPasoAdelante(calcular_probabilidades_por_sobre(catalogo), mercado, catalogo),
    SoloSobres(),
]

resultados = [
    simular(estrategia, catalogo, mercado, semilla) for estrategia in estrategias for semilla in SEMILLAS_EXPERIMENTOS
]
guardar_resultados(resultados, CARPETA_RESULTADOS / "resultados.csv")
guardar_historial_faltantes(resultados, CARPETA_RESULTADOS / "historial_faltantes.csv")

print(f"{len(resultados)} simulaciones guardadas en {CARPETA_RESULTADOS}")
for estrategia in estrategias:
    propios = [resultado for resultado in resultados if resultado.estrategia == estrategia.nombre]
    costo_neto_promedio = sum(resultado.costo_neto for resultado in propios) / len(propios)
    sobres_promedio = sum(resultado.sobres_abiertos for resultado in propios) / len(propios)
    print(f"  {estrategia.nombre_legible}, sobres {sobres_promedio:.1f}, costo neto ${costo_neto_promedio:.2f}")
