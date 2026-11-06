# Pruebas de consistencia interna del modelo, conservación de las cuentas en cada simulación y casos límite cuyo
# resultado se conoce sin simular. Cada prueba cuenta en cuántos casos se revisó y en cuántos falló.
#
# Conservación
#   El costo neto es lo gastado en sobres y cajas más lo pagado por sueltas menos lo recuperado al vender.
#   Lo gastado en sellado es lo que cuestan las cajas y los sobres sueltos abiertos.
#   Las estrategias que completan solo con sellado no compran ninguna carta suelta.
# Casos límite
#   Comprar sueltas cuesta exactamente lo que cuesta el set base completo suelto y no abre nada.
#   Con la caja a un precio imposible, la parada óptima nunca abre una caja.
#   Con sobre y caja a un precio imposible, la parada óptima no abre nada y cuesta lo mismo que comprar sueltas.
from dataclasses import dataclass

from simulacion.estrategias.comprar_sueltas import CompraSuelta
from simulacion.estrategias.parada_optima import ReglaUnPasoAdelante
from simulacion.estrategias.solo_cajas import SoloCajas
from simulacion.estrategias.solo_sobres import SoloSobres
from simulacion.modelo.mercado import Mercado
from simulacion.modelo.probabilidades_sobre import calcular_probabilidades_por_sobre
from simulacion.modelo.motor import simular

TOLERANCIA_DOLARES = 1e-6
PRECIO_IMPOSIBLE = 1e9


@dataclass(frozen=True)
class PruebaConsistencia:
    prueba: str
    casos: int
    fallas: int

    @property
    def aprobada(self):
        return self.fallas == 0


def contar_fallas(nombre, casos, condicion):
    return PruebaConsistencia(nombre, len(casos), sum(not condicion(caso) for caso in casos))


def revisar_conservacion(resultados, catalogo):
    def balance_correcto(resultado):
        esperado = resultado.gasto_en_sobres_y_cajas + resultado.costo_cartas_sueltas - resultado.ingreso_venta_neta
        return abs(resultado.costo_neto - esperado) < TOLERANCIA_DOLARES

    def gasto_correcto(resultado):
        sobres_sueltos = resultado.sobres_abiertos - resultado.cajas_abiertas * catalogo.caja.cantidad_sobres
        esperado = resultado.cajas_abiertas * catalogo.caja.precio + sobres_sueltos * catalogo.sobre.precio
        return sobres_sueltos >= 0 and abs(resultado.gasto_en_sobres_y_cajas - esperado) < TOLERANCIA_DOLARES

    solo_sellado = [
        resultado for resultado in resultados if resultado.estrategia in (SoloSobres.nombre, SoloCajas.nombre)
    ]
    return [
        contar_fallas("costo neto igual a sellado más sueltas menos venta", resultados, balance_correcto),
        contar_fallas("gasto en sellado igual a cajas y sobres abiertos", resultados, gasto_correcto),
        contar_fallas(
            "solo sobres y solo cajas no compran sueltas", solo_sellado,
            lambda resultado: resultado.cartas_compradas_sueltas == 0,
        ),
    ]


def simular_parada_con_precios(catalogo, mercado, semillas):
    mercado_nuevo = Mercado(catalogo, mercado.parametros)
    regla = ReglaUnPasoAdelante(calcular_probabilidades_por_sobre(catalogo), mercado_nuevo, catalogo)
    return [simular(regla, catalogo, mercado_nuevo, semilla) for semilla in semillas]


def revisar_casos_limite(catalogo, mercado, semillas):
    costo_set_completo = mercado.costo_comprar_set_completo()
    compra_suelta = [simular(CompraSuelta(), catalogo, mercado, semilla) for semilla in semillas]

    con_caja_imposible = simular_parada_con_precios(
        catalogo.con_precios(precio_caja=PRECIO_IMPOSIBLE), mercado, semillas
    )
    con_todo_imposible = simular_parada_con_precios(
        catalogo.con_precios(precio_sobre=PRECIO_IMPOSIBLE, precio_caja=PRECIO_IMPOSIBLE), mercado, semillas
    )

    return [
        contar_fallas(
            "comprar sueltas cuesta el set base completo suelto", compra_suelta,
            lambda resultado: resultado.sobres_abiertos == 0
            and abs(resultado.costo_neto - costo_set_completo) < TOLERANCIA_DOLARES,
        ),
        contar_fallas(
            "con la caja a precio imposible la parada óptima no abre cajas", con_caja_imposible,
            lambda resultado: resultado.cajas_abiertas == 0,
        ),
        contar_fallas(
            "con todo el sellado a precio imposible la parada óptima es comprar sueltas", con_todo_imposible,
            lambda resultado: resultado.sobres_abiertos == 0
            and abs(resultado.costo_neto - costo_set_completo) < TOLERANCIA_DOLARES,
        ),
    ]
