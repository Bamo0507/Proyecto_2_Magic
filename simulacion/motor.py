# Ciclo de simulación, aplica una estrategia hasta que decide parar, compra sueltas las cartas que faltan y vende lo
# que sobra.
from dataclasses import dataclass

import numpy as np

from simulacion.estrategias.base import Accion
from simulacion.modelo.coleccion import Coleccion
from simulacion.modelo.generador_sobres import GeneradorSobres

LIMITE_SOBRES_POR_SIMULACION = 50_000


@dataclass(frozen=True)
class Cierre:
    costo_cartas_sueltas: float
    ingreso_venta_neta: float
    valor_mercado_sobrantes: float
    valor_mercado_coleccion: float


@dataclass(frozen=True)
class Resultado:
    estrategia: str
    semilla: int
    sobres_abiertos: int
    cajas_abiertas: int
    gasto_en_sobres_y_cajas: float
    cartas_compradas_sueltas: int
    costo_cartas_sueltas: float
    ingreso_venta_neta: float
    costo_neto: float
    valor_mercado_sobrantes: float
    valor_mercado_coleccion: float
    historial_faltantes: tuple[tuple[int, int], ...]


def elegir_copia_a_guardar_foil(coleccion, mercado):
    # De cada carta se guarda la copia que menos se recuperaría al venderla, para que lo vendido rinda lo más posible.
    # Se guarda la foil solo si no salió ninguna normal o si la foil se vende por menos.
    tiene_normal = coleccion.copias_normales > 0
    tiene_foil = coleccion.copias_foil > 0
    foil_vale_menos = mercado.venta_neta_foil_base < mercado.venta_neta_normal_base
    return tiene_foil & (~tiene_normal | foil_vale_menos)


def valor_cartas_fuera_del_set(cartas_fuera_del_set, precio_de_carta):
    return sum(
        cantidad * precio_de_carta(identificador, es_foil)
        for (identificador, es_foil), cantidad in cartas_fuera_del_set.items()
    )


def cerrar_cuentas(coleccion, mercado, catalogo):
    guarda_foil = elegir_copia_a_guardar_foil(coleccion, mercado)
    conseguidas = coleccion.cartas_conseguidas
    guarda_normal = conseguidas & ~guarda_foil
    # Las repetidas son todas las copias de cada acabado menos la que se queda en la colección
    repetidas_normales = coleccion.copias_normales - guarda_normal.astype(int)
    repetidas_foil = coleccion.copias_foil - guarda_foil.astype(int)

    ingreso_venta = (
        (repetidas_normales * mercado.venta_neta_normal_base).sum()
        + (repetidas_foil * mercado.venta_neta_foil_base).sum()
        + valor_cartas_fuera_del_set(coleccion.cartas_fuera_del_set, mercado.venta_neta_carta)
    )
    valor_sobrantes = (
        (repetidas_normales * catalogo.precios_normales_base).sum()
        + (repetidas_foil * catalogo.precios_foil_base).sum()
        + valor_cartas_fuera_del_set(coleccion.cartas_fuera_del_set, catalogo.precio)
    )
    # Las cartas que faltaban se valoran a precio normal, porque así se compran sueltas al final
    precio_copia_guardada = np.where(guarda_foil, catalogo.precios_foil_base, catalogo.precios_normales_base)
    valor_coleccion = (
        precio_copia_guardada[conseguidas].sum()
        + catalogo.precios_normales_base[coleccion.cartas_faltantes].sum()
    )
    return Cierre(
        costo_cartas_sueltas=mercado.costo_comprar_sueltas(coleccion.cartas_faltantes),
        ingreso_venta_neta=float(ingreso_venta),
        valor_mercado_sobrantes=float(valor_sobrantes),
        valor_mercado_coleccion=float(valor_coleccion),
    )


def abrir_producto(accion, generador_sobres, coleccion, catalogo):
    productos_por_accion = {Accion.SOBRE: catalogo.sobre, Accion.CAJA: catalogo.caja}
    producto = productos_por_accion[accion]
    coleccion.agregar_cartas(generador_sobres.abrir_producto(producto))
    coleccion.registrar_compra(producto)


def simular(estrategia, catalogo, mercado, semilla, limite_sobres=LIMITE_SOBRES_POR_SIMULACION):
    generador_sobres = GeneradorSobres(catalogo, np.random.default_rng(semilla))
    coleccion = Coleccion(catalogo)
    historial_faltantes = [(0, coleccion.cantidad_faltantes)]

    while (accion := estrategia.decidir(coleccion)) is not Accion.PARAR:
        abrir_producto(accion, generador_sobres, coleccion, catalogo)
        historial_faltantes.append((coleccion.sobres_abiertos, coleccion.cantidad_faltantes))
        if coleccion.sobres_abiertos > limite_sobres:
            raise RuntimeError(f"La estrategia {estrategia.nombre} superó el límite de {limite_sobres} sobres")

    cierre = cerrar_cuentas(coleccion, mercado, catalogo)
    return Resultado(
        estrategia=estrategia.nombre,
        semilla=semilla,
        sobres_abiertos=coleccion.sobres_abiertos,
        cajas_abiertas=coleccion.compras_por_producto[catalogo.caja.tipo],
        gasto_en_sobres_y_cajas=coleccion.gasto_en_sobres_y_cajas,
        cartas_compradas_sueltas=coleccion.cantidad_faltantes,
        costo_cartas_sueltas=cierre.costo_cartas_sueltas,
        ingreso_venta_neta=cierre.ingreso_venta_neta,
        costo_neto=coleccion.gasto_en_sobres_y_cajas + cierre.costo_cartas_sueltas - cierre.ingreso_venta_neta,
        valor_mercado_sobrantes=cierre.valor_mercado_sobrantes,
        valor_mercado_coleccion=cierre.valor_mercado_coleccion,
        historial_faltantes=tuple(historial_faltantes),
    )
