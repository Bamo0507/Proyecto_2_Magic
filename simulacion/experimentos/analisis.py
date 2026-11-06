# Resume los resultados de las simulaciones por estrategia y mide la mejora de una estrategia frente a otra.
#
# La mejora se mide de forma pareada. Para cada semilla se resta el costo neto de la estrategia evaluada al de la
# estrategia de referencia, y el intervalo de confianza se calcula sobre esas diferencias. Como ambas estrategias
# comparten el azar del inicio, las diferencias varían menos que los costos por separado y el intervalo sale más
# angosto que si se compararan las dos medias sueltas. La reducción porcentual divide la diferencia media entre el
# costo medio de la referencia, y su intervalo divide los límites de la diferencia entre ese mismo costo medio. Si la
# referencia no cuesta nada o deja ganancia, el porcentaje no tiene sentido y queda como NaN.
import math
from dataclasses import dataclass

import numpy as np

from simulacion.verificacion.comparacion import intervalo_confianza_media


@dataclass(frozen=True)
class ResumenEstrategia:
    estrategia: str
    nombre_legible: str
    replicas: int
    costo_neto_medio: float
    desviacion_costo_neto: float
    limite_inferior_ic95: float
    limite_superior_ic95: float
    costo_neto_minimo: float
    costo_neto_maximo: float
    sobres_abiertos_medio: float
    cajas_abiertas_medio: float
    cartas_compradas_sueltas_medio: float
    gasto_en_sobres_y_cajas_medio: float
    costo_cartas_sueltas_medio: float
    ingreso_venta_neta_medio: float
    valor_mercado_sobrantes_medio: float


@dataclass(frozen=True)
class ComparacionPareada:
    referencia: str
    evaluada: str
    replicas: int
    costo_neto_referencia: float
    costo_neto_evaluada: float
    reduccion_media: float
    reduccion_limite_inferior_ic95: float
    reduccion_limite_superior_ic95: float
    reduccion_porcentual: float
    reduccion_porcentual_limite_inferior_ic95: float
    reduccion_porcentual_limite_superior_ic95: float
    proporcion_replicas_con_mejora: float


def columna(resultados, campo):
    return np.array([getattr(resultado, campo) for resultado in resultados], dtype=float)


def resumir_estrategia(resultados, estrategia):
    propios = [resultado for resultado in resultados if resultado.estrategia == estrategia.nombre]
    costos = columna(propios, "costo_neto")
    limite_inferior, limite_superior = intervalo_confianza_media(costos)
    return ResumenEstrategia(
        estrategia=estrategia.nombre,
        nombre_legible=estrategia.nombre_legible,
        replicas=len(propios),
        costo_neto_medio=float(costos.mean()),
        desviacion_costo_neto=float(costos.std(ddof=1)),
        limite_inferior_ic95=limite_inferior,
        limite_superior_ic95=limite_superior,
        costo_neto_minimo=float(costos.min()),
        costo_neto_maximo=float(costos.max()),
        sobres_abiertos_medio=float(columna(propios, "sobres_abiertos").mean()),
        cajas_abiertas_medio=float(columna(propios, "cajas_abiertas").mean()),
        cartas_compradas_sueltas_medio=float(columna(propios, "cartas_compradas_sueltas").mean()),
        gasto_en_sobres_y_cajas_medio=float(columna(propios, "gasto_en_sobres_y_cajas").mean()),
        costo_cartas_sueltas_medio=float(columna(propios, "costo_cartas_sueltas").mean()),
        ingreso_venta_neta_medio=float(columna(propios, "ingreso_venta_neta").mean()),
        valor_mercado_sobrantes_medio=float(columna(propios, "valor_mercado_sobrantes").mean()),
    )


def resumir_por_estrategia(resultados, estrategias):
    return [resumir_estrategia(resultados, estrategia) for estrategia in estrategias]


def mejor_estrategia(resumenes, nombres):
    candidatas = [resumen for resumen in resumenes if resumen.estrategia in nombres]
    return min(candidatas, key=lambda resumen: resumen.costo_neto_medio).estrategia


def costos_por_semilla(resultados, estrategia):
    return {resultado.semilla: resultado.costo_neto for resultado in resultados if resultado.estrategia == estrategia}


def comparar_pareado(resultados, referencia, evaluada):
    costos_referencia = costos_por_semilla(resultados, referencia)
    costos_evaluada = costos_por_semilla(resultados, evaluada)
    semillas = sorted(costos_referencia.keys() & costos_evaluada.keys())
    referencia_por_semilla = np.array([costos_referencia[semilla] for semilla in semillas])
    evaluada_por_semilla = np.array([costos_evaluada[semilla] for semilla in semillas])
    diferencias = referencia_por_semilla - evaluada_por_semilla
    limite_inferior, limite_superior = intervalo_confianza_media(diferencias)
    costo_referencia = float(referencia_por_semilla.mean())
    divisor = costo_referencia if costo_referencia > 0 else math.nan
    return ComparacionPareada(
        referencia=referencia,
        evaluada=evaluada,
        replicas=len(semillas),
        costo_neto_referencia=costo_referencia,
        costo_neto_evaluada=float(evaluada_por_semilla.mean()),
        reduccion_media=float(diferencias.mean()),
        reduccion_limite_inferior_ic95=limite_inferior,
        reduccion_limite_superior_ic95=limite_superior,
        reduccion_porcentual=float(diferencias.mean()) / divisor,
        reduccion_porcentual_limite_inferior_ic95=limite_inferior / divisor,
        reduccion_porcentual_limite_superior_ic95=limite_superior / divisor,
        proporcion_replicas_con_mejora=float((diferencias > 0).mean()),
    )


@dataclass(frozen=True)
class FilaVidaReal:
    columna: str
    estrategia: str
    costo_usd: float
    limite_inferior_ic95: float | None
    limite_superior_ic95: float | None
    cambio_absoluto_vs_base: float
    cambio_porcentual_vs_base: float


def tabla_vida_real(resumenes, referencia_real, estrategia_base, estrategia_mejorada):
    # Las tres columnas de la comparación con la vida real, con el cambio de cada una respecto del modelo base
    por_nombre = {resumen.estrategia: resumen for resumen in resumenes}
    base = por_nombre[estrategia_base]
    filas = []

    def agregar(columna_tabla, estrategia, costo, limite_inferior, limite_superior):
        cambio = costo - base.costo_neto_medio
        divisor = base.costo_neto_medio if base.costo_neto_medio > 0 else math.nan
        filas.append(
            FilaVidaReal(columna_tabla, estrategia, costo, limite_inferior, limite_superior, cambio, cambio / divisor)
        )

    if referencia_real is not None:
        agregar("referencia_real", referencia_real.fuente, referencia_real.precio_desde_usd, None, None)
    agregar("modelo_base", base.estrategia, base.costo_neto_medio, base.limite_inferior_ic95, base.limite_superior_ic95)
    mejorada = por_nombre[estrategia_mejorada]
    agregar(
        "modelo_mejorado", mejorada.estrategia, mejorada.costo_neto_medio, mejorada.limite_inferior_ic95,
        mejorada.limite_superior_ic95,
    )
    return filas
