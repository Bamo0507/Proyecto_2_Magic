# Precios de compra y venta de cartas sueltas en TCGplayer, para un comprador y vendedor en Estados Unidos.
from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class ParametrosMercado:
    # TCGplayer Direct cobra al menos este precio por carta, aunque su precio de mercado sea menor
    precio_minimo_compra_por_carta: float = 0.40
    # Los pedidos de Direct desde este monto tienen envío gratis, por debajo se paga el costo de envío
    umbral_envio_gratis: float = 50.0
    costo_envio: float = 3.99
    # Comisión del vendedor sobre el precio de cada carta, con un tope por carta
    comision_venta: float = 0.1075
    tope_comision: float = 75.0
    # Tarifa de procesamiento de pago, un porcentaje del precio más un monto fijo por pedido
    tarifa_transaccion: float = 0.025
    tarifa_fija_por_pedido: float = 0.30
    # Con 1 se supone que cada carta se vende en un pedido distinto, que es el caso más caro para el vendedor
    cartas_por_pedido: int = 1


class Mercado:
    def __init__(self, catalogo, parametros=ParametrosMercado()):
        self.catalogo = catalogo
        self.parametros = parametros
        self.precio_compra_base = np.maximum(catalogo.precios_normales_base, parametros.precio_minimo_compra_por_carta)
        self.venta_neta_normal_base = self.venta_neta(catalogo.precios_normales_base)
        self.venta_neta_foil_base = self.venta_neta(catalogo.precios_foil_base)

    def venta_neta(self, precios):
        # Lo que recibe el vendedor después de comisiones; si las tarifas superan el precio, no conviene vender
        precios = np.asarray(precios, dtype=float)
        comision = np.minimum(precios * self.parametros.comision_venta, self.parametros.tope_comision)
        tarifa_porcentual = precios * self.parametros.tarifa_transaccion
        tarifa_fija_por_carta = self.parametros.tarifa_fija_por_pedido / self.parametros.cartas_por_pedido
        return np.maximum(precios - comision - tarifa_porcentual - tarifa_fija_por_carta, 0.0)

    def venta_neta_carta(self, identificador, es_foil):
        return float(self.venta_neta(self.catalogo.precio(identificador, es_foil)))

    def costo_comprar_sueltas(self, cartas_faltantes):
        subtotal = float(self.precio_compra_base[cartas_faltantes].sum())
        if 0 < subtotal < self.parametros.umbral_envio_gratis:
            return subtotal + self.parametros.costo_envio
        return subtotal

    def costo_comprar_set_completo(self):
        return self.costo_comprar_sueltas(np.ones(self.catalogo.cantidad_cartas_base, dtype=bool))
