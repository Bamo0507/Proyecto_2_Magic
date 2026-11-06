# Exporta para la web la corrida de demostración, la parada óptima con la semilla de ejemplo, sobre por sobre. La web
# no simula nada, solo anima lo que pasó aquí, así que lo que se ve en pantalla es exactamente lo que dio el modelo.
#
# Se abre cada sobre con abrir_sobre_por_pozo en el mismo orden que el motor, de modo que el azar se consume igual y la
# corrida es idéntica a la de simular con la misma semilla; al final se comprueba que el costo neto coincida. Las cartas
# se anotan una por una para marcar como nueva solo la primera copia de cada carta del set base.
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
from simulacion.modelo.motor import cerrar_cuentas, simular
from simulacion.modelo.probabilidades_sobre import calcular_probabilidades_por_sobre
from simulacion.semillas import SEMILLA_EJEMPLO

TOLERANCIA_DOLARES = 1e-6
ACCION_EN_WEB = {Accion.SOBRE: "pack", Accion.CAJA: "box", Accion.PARAR: "stop"}


def dinero(monto):
    return round(float(monto), 2)


def anotar_carta(carta, nombre_pozo, coleccion, catalogo):
    posicion = catalogo.posicion_en_set_base.get(carta.identificador)
    es_nueva = posicion is not None and not coleccion.cartas_conseguidas[posicion]
    coleccion.agregar_cartas([carta])
    return {"id": carta.identificador, "foil": carta.es_foil, "slot": nombre_pozo, "isNew": bool(es_nueva)}


def abrir_sobre_anotado(generador_sobres, coleccion, catalogo):
    cartas = [
        anotar_carta(carta, nombre_pozo, coleccion, catalogo)
        for nombre_pozo, cartas_del_pozo in generador_sobres.abrir_sobre_por_pozo().items()
        for carta in cartas_del_pozo
    ]
    return {"cards": cartas, "missingAfter": coleccion.cantidad_faltantes}


def correr_demostracion(catalogo, mercado, regla, semilla):
    generador_sobres = GeneradorSobres(catalogo, np.random.default_rng(semilla))
    coleccion = Coleccion(catalogo)
    productos_por_accion = {Accion.SOBRE: catalogo.sobre, Accion.CAJA: catalogo.caja}
    pasos = []
    while True:
        ganancias = regla.ganancias_esperadas_por_accion(coleccion)
        accion = regla.decidir(coleccion)
        paso = {
            "action": ACCION_EN_WEB[accion],
            "missingBefore": coleccion.cantidad_faltantes,
            "packsOpenedBefore": coleccion.sobres_abiertos,
            "expectedGain": {ACCION_EN_WEB[opcion]: dinero(ganancia) for opcion, ganancia in ganancias.items()},
            "packs": [],
        }
        pasos.append(paso)
        if accion is Accion.PARAR:
            return pasos, coleccion
        producto = productos_por_accion[accion]
        for numero_sobre in range(producto.cantidad_sobres):
            paso["packs"].append(abrir_sobre_anotado(generador_sobres, coleccion, catalogo))
        coleccion.registrar_compra(producto)


def datos_de_carta(identificador, catalogo, mercado):
    carta = catalogo.cartas[identificador]
    posicion = catalogo.posicion_en_set_base.get(identificador)
    return {
        "name": carta["nombre"],
        "rarity": carta["rareza"],
        "price": dinero(catalogo.precio(identificador, es_foil=False)),
        "foilPrice": dinero(catalogo.precio(identificador, es_foil=True)),
        "buyPrice": dinero(mercado.precio_compra_base[posicion]) if posicion is not None else None,
        "inBaseSet": catalogo.es_carta_del_set_base(identificador),
        "imageSmall": carta.get("imagen_pequena"),
        "imageNormal": carta.get("imagen_normal"),
    }


def exportar_demostracion(catalogo, mercado, semilla):
    regla = ReglaUnPasoAdelante(calcular_probabilidades_por_sobre(catalogo), mercado, catalogo)
    pasos, coleccion = correr_demostracion(catalogo, mercado, regla, semilla)
    cierre = cerrar_cuentas(coleccion, mercado, catalogo)
    costo_neto = coleccion.gasto_en_sobres_y_cajas + cierre.costo_cartas_sueltas - cierre.ingreso_venta_neta

    esperado = simular(regla, catalogo, mercado, semilla).costo_neto
    if abs(costo_neto - esperado) > TOLERANCIA_DOLARES:
        raise RuntimeError(f"La corrida exportada da ${costo_neto:.2f} y el motor ${esperado:.2f} con la semilla {semilla}")

    faltantes = [catalogo.identificadores_base[posicion] for posicion in np.flatnonzero(coleccion.cartas_faltantes)]
    vistas = {carta["id"] for paso in pasos for sobre in paso["packs"] for carta in sobre["cards"]}
    return {
        "seed": semilla,
        "setName": catalogo.nombre_set,
        "pricesDate": catalogo.fecha_precios,
        "baseSetSize": catalogo.cantidad_cartas_base,
        "products": {
            "pack": {"price": catalogo.sobre.precio, "packs": catalogo.sobre.cantidad_sobres, "image": catalogo.sobre.imagen},
            "box": {"price": catalogo.caja.precio, "packs": catalogo.caja.cantidad_sobres, "image": catalogo.caja.imagen},
        },
        "expectedSalePerPack": dinero(regla.venta_esperada_por_sobre),
        "cardBack": {
            "imageSmall": (catalogo.dorso or {}).get("imagen_pequena"),
            "imageNormal": (catalogo.dorso or {}).get("imagen_normal"),
        },
        "steps": pasos,
        "closing": {
            "missingCards": faltantes,
            "looseCost": dinero(cierre.costo_cartas_sueltas),
            "sealedSpend": dinero(coleccion.gasto_en_sobres_y_cajas),
            "saleIncome": dinero(cierre.ingreso_venta_neta),
            "netCost": dinero(costo_neto),
            "buyAllLooseCost": dinero(mercado.costo_comprar_set_completo()),
        },
        "cards": {identificador: datos_de_carta(identificador, catalogo, mercado) for identificador in sorted(vistas | set(faltantes))},
    }


catalogo = Catalogo(CARPETA_SET_ACTIVO)
mercado = Mercado(catalogo)
demostracion = exportar_demostracion(catalogo, mercado, SEMILLA_EJEMPLO)
CARPETA_DATOS_WEB.mkdir(parents=True, exist_ok=True)
ruta = CARPETA_DATOS_WEB / "simulation-run.json"
ruta.write_text(json.dumps(demostracion, ensure_ascii=False, separators=(",", ":")))

sobres = sum(len(paso["packs"]) for paso in demostracion["steps"])
print(f"Corrida de demostración con la semilla {SEMILLA_EJEMPLO}, {len(demostracion['steps'])} decisiones y {sobres} sobres")
print(f"  costo neto ${demostracion['closing']['netCost']:.2f}, igual al del motor")
print(f"  {len(demostracion['cards'])} cartas distintas, {ruta.stat().st_size / 1024:.0f} KB en {ruta}")
