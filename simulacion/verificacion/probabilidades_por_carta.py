# Compara, carta por carta, qué tan seguido sale cada carta del set base en un sobre del generador contra la
# probabilidad exacta de calcular_probabilidades_por_sobre, y la venta neta media por sobre contra la venta esperada
# que usa la regla de parada. Son las dos entradas de la regla, así que esta prueba revisa que la regla decide con las
# mismas probabilidades con las que después se abren los sobres.
#
# Si el cálculo es correcto, la probabilidad exacta de cada carta debe caer dentro del intervalo de confianza del 95%
# de su frecuencia simulada en cerca del 95% de las cartas.
from dataclasses import dataclass

import numpy as np

from simulacion.modelo.generador_sobres import GeneradorSobres
from simulacion.verificacion.comparacion import error_relativo, intervalo_confianza_media, intervalo_confianza_proporcion


@dataclass(frozen=True)
class ComparacionCarta:
    identificador: str
    rareza: str
    probabilidad_calculada: float
    frecuencia_simulada: float
    limite_inferior_ic95: float
    limite_superior_ic95: float
    dentro_del_ic95: bool
    error_relativo: float


@dataclass(frozen=True)
class ResumenPorCarta:
    sobres_abiertos: int
    cartas_comparadas: int
    proporcion_dentro_del_ic95: float
    error_relativo_medio: float
    error_relativo_maximo: float
    venta_esperada_calculada: float
    venta_media_simulada: float
    venta_limite_inferior_ic95: float
    venta_limite_superior_ic95: float
    venta_error_relativo: float


def contar_apariciones(catalogo, mercado, cantidad_sobres, semilla):
    generador_sobres = GeneradorSobres(catalogo, np.random.default_rng(semilla))
    sobres_con_la_carta = np.zeros(catalogo.cantidad_cartas_base)
    venta_por_sobre = np.empty(cantidad_sobres)
    venta_neta_por_carta = {}
    for numero_sobre in range(cantidad_sobres):
        cartas = generador_sobres.abrir_sobre()
        posiciones = {
            catalogo.posicion_en_set_base[carta.identificador]
            for carta in cartas
            if carta.identificador in catalogo.posicion_en_set_base
        }
        sobres_con_la_carta[list(posiciones)] += 1
        venta = 0.0
        for carta in cartas:
            clave = (carta.identificador, carta.es_foil)
            if clave not in venta_neta_por_carta:
                venta_neta_por_carta[clave] = mercado.venta_neta_carta(carta.identificador, carta.es_foil)
            venta += venta_neta_por_carta[clave]
        venta_por_sobre[numero_sobre] = venta
    return sobres_con_la_carta, venta_por_sobre


def comparar_probabilidades_por_carta(catalogo, mercado, probabilidades, venta_esperada, cantidad_sobres, semilla):
    sobres_con_la_carta, venta_por_sobre = contar_apariciones(catalogo, mercado, cantidad_sobres, semilla)
    comparaciones = []
    for posicion, identificador in enumerate(catalogo.identificadores_base):
        calculada = float(probabilidades.probabilidad_al_menos_una_copia[posicion])
        frecuencia = sobres_con_la_carta[posicion] / cantidad_sobres
        limite_inferior, limite_superior = intervalo_confianza_proporcion(sobres_con_la_carta[posicion], cantidad_sobres)
        comparaciones.append(
            ComparacionCarta(
                identificador=identificador,
                rareza=catalogo.cartas[identificador]["rareza"],
                probabilidad_calculada=calculada,
                frecuencia_simulada=float(frecuencia),
                limite_inferior_ic95=float(limite_inferior),
                limite_superior_ic95=float(limite_superior),
                dentro_del_ic95=bool(limite_inferior <= calculada <= limite_superior),
                error_relativo=error_relativo(frecuencia, calculada),
            )
        )
    errores = np.array([comparacion.error_relativo for comparacion in comparaciones])
    venta_media = float(venta_por_sobre.mean())
    venta_limite_inferior, venta_limite_superior = intervalo_confianza_media(venta_por_sobre)
    resumen = ResumenPorCarta(
        sobres_abiertos=cantidad_sobres,
        cartas_comparadas=len(comparaciones),
        proporcion_dentro_del_ic95=float(np.mean([comparacion.dentro_del_ic95 for comparacion in comparaciones])),
        error_relativo_medio=float(errores.mean()),
        error_relativo_maximo=float(errores.max()),
        venta_esperada_calculada=venta_esperada,
        venta_media_simulada=venta_media,
        venta_limite_inferior_ic95=venta_limite_inferior,
        venta_limite_superior_ic95=venta_limite_superior,
        venta_error_relativo=error_relativo(venta_media, venta_esperada),
    )
    return comparaciones, resumen
