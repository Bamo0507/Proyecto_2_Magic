# Regla de parada óptima de mirar un paso adelante (one-step look-ahead), elige entre abrir un sobre, abrir una caja
# o parar y comprar sueltas las cartas que faltan.
#
# La idea viene de la teoría de parada óptima (Ferguson, Optimal Stopping and Applications, capítulo 5). En cada
# momento se compara parar ahora contra abrir un producto más y parar justo después. Si ninguna opción le gana a
# parar, se para. Esta regla es la mejor posible cuando el problema es monótono, es decir, cuando conseguir más cartas
# nunca hace que abrir otro producto valga más que antes. Aquí se cumple porque comprar una carta siempre cuesta al
# menos lo que se recupera al venderla, así que cada carta que se consigue solo puede bajar la ganancia esperada, y una
# vez que parar es lo mejor, lo sigue siendo en cualquier estado futuro.
#
# La monotonía tiene un límite. Si un producto cuesta menos de lo que se espera recuperar al vender todas sus cartas,
# abrirlo conviene aunque el set ya esté completo, y la regla no pararía nunca. El objetivo es completar el set y no
# revender sin fin (el mercado tampoco absorbería tantas cartas a su precio), así que con el set completo se para
# siempre. El precio a partir del cual pasa esto se reporta como precio_umbral.
#
# La regla es óptima para decidir cuándo parar. Para elegir entre sobre y caja toma la de mayor ganancia esperada, que
# es una heurística, porque no toma en cuenta que abrir sobres de a uno deja la opción de parar a medio camino.
import numpy as np

from simulacion.estrategias.base import Accion


class ReglaUnPasoAdelante:
    def __init__(self, probabilidades, mercado, catalogo, permitir_cajas=True):
        self.nombre = "parada_optima" if permitir_cajas else "parada_optima_sin_cajas"
        self.nombre_legible = "Parada óptima" if permitir_cajas else "Parada óptima sin cajas"
        self.productos_por_accion = {Accion.SOBRE: catalogo.sobre}
        if permitir_cajas:
            self.productos_por_accion[Accion.CAJA] = catalogo.caja
        self.probabilidad_por_sobre = probabilidades.probabilidad_al_menos_una_copia
        self.venta_esperada_por_sobre = self.calcular_venta_esperada_por_sobre(probabilidades, mercado)
        # La copia que se guarda es la que menos se recuperaría al venderla, así que conseguir una carta que falta
        # ahorra su precio de compra menos la venta neta más baja entre su versión normal y su versión foil
        venta_neta_copia_guardada = np.minimum(mercado.venta_neta_normal_base, mercado.venta_neta_foil_base)
        self.ahorro_por_conseguir_faltante = mercado.precio_compra_base - venta_neta_copia_guardada

    @staticmethod
    def calcular_venta_esperada_por_sobre(probabilidades, mercado):
        venta_set_base = (
            (probabilidades.copias_normales_esperadas * mercado.venta_neta_normal_base).sum()
            + (probabilidades.copias_foil_esperadas * mercado.venta_neta_foil_base).sum()
        )
        venta_fuera_del_set = sum(
            copias_esperadas * mercado.venta_neta_carta(identificador, es_foil)
            for (identificador, es_foil), copias_esperadas in probabilidades.copias_esperadas_fuera_del_set.items()
        )
        return float(venta_set_base + venta_fuera_del_set)

    def precio_umbral(self, producto):
        # Por debajo de este precio el producto tiene ganancia esperada positiva solo por la reventa de sus cartas
        return producto.cantidad_sobres * self.venta_esperada_por_sobre

    def probabilidad_al_menos_una_copia(self, cantidad_sobres):
        # Como los sobres son independientes, la probabilidad de no ver una carta en ningún sobre es la de no verla en
        # uno, multiplicada por sí misma tantas veces como sobres se abran
        return 1 - (1 - self.probabilidad_por_sobre) ** cantidad_sobres

    def ganancia_esperada_de_abrir(self, cartas_faltantes, producto):
        # Toda copia que sale se puede vender a su precio neto, y la primera copia de una carta que falta vale además
        # el ahorro de no tener que comprarla suelta. Se ignora el costo de envío por compras pequeñas (ver
        # ParametrosMercado), porque solo afecta la compra final.
        probabilidad = self.probabilidad_al_menos_una_copia(producto.cantidad_sobres)
        ahorro = float((probabilidad[cartas_faltantes] * self.ahorro_por_conseguir_faltante[cartas_faltantes]).sum())
        return producto.cantidad_sobres * self.venta_esperada_por_sobre + ahorro - producto.precio

    def ganancias_esperadas_por_accion(self, coleccion):
        ganancias = {Accion.PARAR: 0.0}
        for accion, producto in self.productos_por_accion.items():
            ganancias[accion] = self.ganancia_esperada_de_abrir(coleccion.cartas_faltantes, producto)
        return ganancias

    def decidir(self, coleccion):
        # Si dos opciones empatan gana parar, porque es la primera del diccionario
        if coleccion.esta_completa:
            return Accion.PARAR
        ganancias = self.ganancias_esperadas_por_accion(coleccion)
        return max(ganancias, key=ganancias.get)
