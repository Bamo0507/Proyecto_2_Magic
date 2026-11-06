# Exporta para la sección Técnica de la web la regla de parada óptima desarmada en sus partes, con los números de la
# corrida de ejemplo, para que la web no tenga cifras escritas a mano.
#
# Para cada decisión de la corrida con la semilla de ejemplo se guarda el desglose de la ganancia esperada de abrir un
# sobre y de abrir una caja: la venta promedio de lo que salga, el ahorro por las cartas faltantes que salgan y el precio.
# Los productos se abren en el mismo orden que en el motor, así que las decisiones son las mismas que anima la sección
# Simulación. También van el ejemplo de una carta (su probabilidad por sobre, su ahorro y cómo se arma) y el precio de
# caja por debajo del cual la regla dejaría de parar.
#
# Las claves del JSON van en inglés porque son el contrato con el código de la web.
import json

import numpy as np

from simulacion.configuracion import CARPETA_DATOS_WEB, CARPETA_SET_ACTIVO
from simulacion.estrategias.base import Accion
from simulacion.estrategias.parada_optima import ReglaUnPasoAdelante
from simulacion.modelo.catalogo import Catalogo
from simulacion.modelo.coleccion import Coleccion
from simulacion.modelo.generador_sobres import GeneradorSobres
from simulacion.modelo.mercado import Mercado
from simulacion.modelo.motor import simular
from simulacion.modelo.probabilidades_sobre import calcular_probabilidades_por_sobre
from simulacion.semillas import SEMILLA_EJEMPLO

CARTA_DE_EJEMPLO = "mh3:15"
ACCION_EN_WEB = {Accion.SOBRE: "pack", Accion.CAJA: "box", Accion.PARAR: "stop"}


def dinero(monto):
    return round(float(monto), 2)


def desglose_de_abrir(regla, coleccion, producto):
    probabilidad = regla.probabilidad_al_menos_una_copia(producto.cantidad_sobres)
    faltantes = coleccion.cartas_faltantes
    venta = producto.cantidad_sobres * regla.venta_esperada_por_sobre
    ahorro = float((probabilidad[faltantes] * regla.ahorro_por_conseguir_faltante[faltantes]).sum())
    ganancia = dinero(venta + ahorro - producto.precio)
    # La web muestra la suma término por término, así que el ahorro se ajusta al centavo para que la suma cuadre
    return {
        "expectedSale": dinero(venta),
        "missingSavings": round(ganancia - dinero(venta) + dinero(producto.precio), 2),
        "price": dinero(producto.precio),
        "gain": ganancia,
    }


def decisiones_de_la_corrida(catalogo, regla, semilla):
    generador_sobres = GeneradorSobres(catalogo, np.random.default_rng(semilla))
    coleccion = Coleccion(catalogo)
    productos_por_accion = {Accion.SOBRE: catalogo.sobre, Accion.CAJA: catalogo.caja}
    decisiones = []
    while True:
        accion = regla.decidir(coleccion)
        decisiones.append(
            {
                "missingBefore": coleccion.cantidad_faltantes,
                "packsOpenedBefore": coleccion.sobres_abiertos,
                "pack": desglose_de_abrir(regla, coleccion, catalogo.sobre),
                "box": desglose_de_abrir(regla, coleccion, catalogo.caja),
                "action": ACCION_EN_WEB[accion],
            }
        )
        if accion is Accion.PARAR:
            return decisiones, coleccion
        producto = productos_por_accion[accion]
        coleccion.agregar_cartas(generador_sobres.abrir_producto(producto))
        coleccion.registrar_compra(producto)


def ejemplo_de_carta(catalogo, mercado, regla, identificador):
    posicion = catalogo.posicion_en_set_base[identificador]
    probabilidad_por_sobre = float(regla.probabilidad_por_sobre[posicion])
    venta_normal = float(mercado.venta_neta_normal_base[posicion])
    venta_foil = float(mercado.venta_neta_foil_base[posicion])
    return {
        "id": identificador,
        "name": catalogo.cartas[identificador]["nombre"],
        "image": catalogo.cartas[identificador].get("imagen_normal"),
        "probabilityPerPack": round(probabilidad_por_sobre, 5),
        "probabilityPerBox": round(float(regla.probabilidad_al_menos_una_copia(catalogo.caja.cantidad_sobres)[posicion]), 4),
        "buyPrice": dinero(mercado.precio_compra_base[posicion]),
        "keptCopySale": dinero(min(venta_normal, venta_foil)),
        "savings": dinero(regla.ahorro_por_conseguir_faltante[posicion]),
    }


def probabilidad_promedio_por_rareza(catalogo, regla):
    por_rareza = {}
    for rareza in ("common", "mythic"):
        posiciones = [
            posicion
            for posicion, identificador in enumerate(catalogo.identificadores_base)
            if catalogo.cartas[identificador]["rareza"] == rareza
        ]
        por_rareza[rareza] = round(float(np.mean(regla.probabilidad_por_sobre[posiciones])), 5)
    return por_rareza


def exportar_tecnica(catalogo, mercado, semilla):
    regla = ReglaUnPasoAdelante(calcular_probabilidades_por_sobre(catalogo), mercado, catalogo)
    decisiones, coleccion = decisiones_de_la_corrida(catalogo, regla, semilla)

    # Las decisiones salen de los mismos productos que abre el motor; si la corrida terminara distinto, algo se desfasó
    resultado = simular(regla, catalogo, mercado, semilla)
    if resultado.sobres_abiertos != coleccion.sobres_abiertos or resultado.cartas_compradas_sueltas != coleccion.cantidad_faltantes:
        raise RuntimeError(f"Las decisiones exportadas no coinciden con la corrida del motor con la semilla {semilla}")

    return {
        "seed": semilla,
        "baseSetSize": catalogo.cantidad_cartas_base,
        "expectedSalePerPack": round(regla.venta_esperada_por_sobre, 3),
        "products": {
            "pack": {"price": catalogo.sobre.precio, "packs": catalogo.sobre.cantidad_sobres},
            "box": {"price": catalogo.caja.precio, "packs": catalogo.caja.cantidad_sobres},
        },
        "boxThresholdPrice": dinero(regla.precio_umbral(catalogo.caja)),
        "decisions": decisiones,
        "exampleCard": ejemplo_de_carta(catalogo, mercado, regla, CARTA_DE_EJEMPLO),
        "averageProbabilityPerPack": probabilidad_promedio_por_rareza(catalogo, regla),
    }


catalogo = Catalogo(CARPETA_SET_ACTIVO)
mercado = Mercado(catalogo)
tecnica = exportar_tecnica(catalogo, mercado, SEMILLA_EJEMPLO)
CARPETA_DATOS_WEB.mkdir(parents=True, exist_ok=True)
ruta = CARPETA_DATOS_WEB / "technique.json"
ruta.write_text(json.dumps(tecnica, ensure_ascii=False, separators=(",", ":")))

print(f"Técnica exportada a {ruta}, {ruta.stat().st_size / 1024:.1f} KB")
for decision in tecnica["decisions"]:
    print(f"  faltan {decision['missingBefore']}: sobre {decision['pack']}, caja {decision['box']} -> {decision['action']}")
print(f"  ejemplo {tecnica['exampleCard']}")
print(f"  umbral de la caja ${tecnica['boxThresholdPrice']}, promedio por rareza {tecnica['averageProbabilityPerPack']}")
