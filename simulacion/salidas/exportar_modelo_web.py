# Exporta para la sección Modelo de la web cómo se arma un sobre, de dónde salen las probabilidades y cómo funciona
# el mercado, todo calculado a partir de los datos congelados del set para que la web no tenga cifras escritas a mano.
#
# Incluye la composición del sobre y cada pozo con su mezcla de rarezas, el reparto de la ranura rara contra las tasas
# de Wizards, la probabilidad promedio de que salga una carta de cada rareza por sobre, una estimación de qué tan seguido
# se repite una carta dentro de un mismo sobre, los ejemplos de compra y venta, y las fuentes de cada dato.
#
# Las claves del JSON van en inglés porque son el contrato con el código de la web.
import json
from collections import Counter, defaultdict

import numpy as np

from simulacion.configuracion import CARPETA_DATOS_WEB, CARPETA_SET_ACTIVO
from simulacion.modelo.catalogo import Catalogo, leer_json
from simulacion.modelo.generador_sobres import GeneradorSobres
from simulacion.modelo.mercado import Mercado
from simulacion.modelo.probabilidades_sobre import calcular_probabilidades_por_sobre
from simulacion.semillas import SEMILLA_MODELO_REPETIDAS, SOBRES_MODELO_REPETIDAS
from simulacion.verificacion.frecuencias_rareza import leer_ranura_rara, tasas_segun_pesos

URL_ARTICULO_WIZARDS = "https://magic.wizards.com/en/news/feature/collecting-modern-horizons-3"
URL_REPOSITORIO_COMPOSICION = "https://github.com/taw/magic-sealed-data"
URL_SET_SCRYFALL = "https://scryfall.com/sets/mh3"
PRECIOS_DE_EJEMPLO = (10.0, 0.20)
CARTA_DE_EJEMPLO = "mh3:10"
FUERA_DEL_SET = "outOfSet"


def redondear(valor, decimales=4):
    return round(float(valor), decimales)


def categoria_de_carta(catalogo, identificador):
    if not catalogo.es_carta_del_set_base(identificador):
        return FUERA_DEL_SET
    return catalogo.cartas[identificador]["rareza"]


def datos_de_pozo(catalogo, nombre_pozo, pozo, cartas_por_sobre):
    mezcla = defaultdict(float)
    for identificador, probabilidad in zip(pozo.identificadores, pozo.probabilidades):
        mezcla[categoria_de_carta(catalogo, identificador)] += float(probabilidad)
    distintas = set(pozo.identificadores)
    del_set = {identificador for identificador in distintas if catalogo.es_carta_del_set_base(identificador)}
    return {
        "name": nombre_pozo,
        "entries": len(pozo.identificadores),
        "distinctCards": len(distintas),
        "baseSetCards": len(del_set),
        "outOfSetCards": len(distintas - del_set),
        "allFoil": bool(np.all(pozo.es_foil_por_carta)),
        "averagePerPack": redondear(cartas_por_sobre),
        "categoryMix": {categoria: redondear(probabilidad) for categoria, probabilidad in sorted(mezcla.items())},
    }


def cartas_por_sobre_de_cada_pozo(catalogo):
    promedio = defaultdict(float)
    for composicion in catalogo.composiciones:
        for nombre_pozo, cantidad in composicion.cartas_por_pozo.items():
            promedio[nombre_pozo] += composicion.probabilidad * cantidad
    return promedio


def probabilidad_por_rareza(catalogo):
    probabilidad = calcular_probabilidades_por_sobre(catalogo).probabilidad_al_menos_una_copia
    por_rareza = defaultdict(list)
    for posicion, identificador in enumerate(catalogo.identificadores_base):
        por_rareza[catalogo.cartas[identificador]["rareza"]].append(probabilidad[posicion])
    return {
        rareza: {
            "cards": len(valores),
            "probabilityPerPack": redondear(np.mean(valores), 5),
            "packsPerCopy": round(1 / float(np.mean(valores)), 1),
        }
        for rareza, valores in por_rareza.items()
    }


def estimar_repetidas(catalogo, cantidad_sobres, semilla):
    # Una carta repetida dentro de un mismo sobre solo puede venir de pozos distintos, por ejemplo la ranura comodín
    # coincidiendo con una común; se cuenta aparte el caso en que las dos copias son normales
    generador_sobres = GeneradorSobres(catalogo, np.random.default_rng(semilla))
    con_repetida = 0
    con_repetida_normal = 0
    for numero_sobre in range(cantidad_sobres):
        cartas = generador_sobres.abrir_sobre()
        copias = Counter(carta.identificador for carta in cartas)
        copias_normales = Counter(carta.identificador for carta in cartas if not carta.es_foil)
        con_repetida += any(cantidad > 1 for cantidad in copias.values())
        con_repetida_normal += any(cantidad > 1 for cantidad in copias_normales.values())
    return {
        "packsSimulated": cantidad_sobres,
        "anyFinishShare": redondear(con_repetida / cantidad_sobres),
        "bothNormalShare": redondear(con_repetida_normal / cantidad_sobres),
    }


def ejemplo_de_mercado(mercado, precio):
    parametros = mercado.parametros
    comision = min(precio * parametros.comision_venta, parametros.tope_comision)
    procesamiento = precio * parametros.tarifa_transaccion
    tarifa_fija = parametros.tarifa_fija_por_pedido / parametros.cartas_por_pedido
    venta_neta = float(mercado.venta_neta(precio))
    return {
        "marketPrice": precio,
        "buyPrice": round(max(precio, parametros.precio_minimo_compra_por_carta), 2),
        "commission": round(comision, 3),
        "processing": round(procesamiento, 3),
        "fixedFee": round(tarifa_fija, 2),
        "saleNet": round(venta_neta, 3),
        "sells": venta_neta > 0,
    }


def exportar_modelo(catalogo, mercado):
    cartas_por_sobre = cartas_por_sobre_de_cada_pozo(catalogo)
    ranura_rara = leer_ranura_rara(CARPETA_SET_ACTIVO)
    tasas_datos = tasas_segun_pesos(catalogo, ranura_rara.pozo)
    pozo_raro = catalogo.pozos[ranura_rara.pozo]
    peso_total_raro = sum(leer_json(CARPETA_SET_ACTIVO / "composicion_sobres.json")["pozos"][ranura_rara.pozo]["cartas"].values())
    posicion_ejemplo = pozo_raro.identificadores.index(CARTA_DE_EJEMPLO)
    peso_ejemplo = round(float(pozo_raro.probabilidades[posicion_ejemplo]) * peso_total_raro)
    precios_sellados = leer_json(CARPETA_SET_ACTIVO / "precios_sellados.json")
    parametros = mercado.parametros

    return {
        "setName": catalogo.nombre_set,
        "pricesDate": catalogo.fecha_precios,
        "baseSetSize": catalogo.cantidad_cartas_base,
        "baseSetByRarity": dict(Counter(catalogo.cartas[identificador]["rareza"] for identificador in catalogo.identificadores_base)),
        "compositions": [
            {"cardsBySlot": composicion.cartas_por_pozo, "probability": redondear(composicion.probabilidad)}
            for composicion in sorted(catalogo.composiciones, key=lambda composicion: -composicion.probabilidad)
        ],
        "slots": [
            datos_de_pozo(catalogo, nombre_pozo, pozo, cartas_por_sobre[nombre_pozo])
            for nombre_pozo, pozo in catalogo.pozos.items()
        ],
        "rareSlot": {
            "slot": ranura_rara.pozo,
            "totalWeight": peso_total_raro,
            "categories": [
                {"key": categoria, "dataRate": redondear(tasas_datos[categoria]), "officialRate": tasa_oficial}
                for categoria, tasa_oficial in ranura_rara.tasas_oficiales.items()
            ],
            "officialSource": ranura_rara.fuente,
            "example": {
                "id": CARTA_DE_EJEMPLO,
                "name": catalogo.cartas[CARTA_DE_EJEMPLO]["nombre"],
                "weight": peso_ejemplo,
                "probability": redondear(peso_ejemplo / peso_total_raro, 5),
                "image": catalogo.cartas[CARTA_DE_EJEMPLO].get("imagen_normal"),
            },
        },
        "probabilityByRarity": probabilidad_por_rareza(catalogo),
        "duplicates": estimar_repetidas(catalogo, SOBRES_MODELO_REPETIDAS, SEMILLA_MODELO_REPETIDAS),
        "products": {
            tipo: {
                "price": producto.precio,
                "packs": producto.cantidad_sobres,
                "pricePerPack": round(producto.precio / producto.cantidad_sobres, 2),
                "url": precios_sellados["productos"][tipo_json]["url"],
            }
            for tipo, tipo_json, producto in (("pack", "sobre", catalogo.sobre), ("box", "caja", catalogo.caja))
        },
        "market": {
            "minimumBuyPrice": parametros.precio_minimo_compra_por_carta,
            "freeShippingFrom": parametros.umbral_envio_gratis,
            "shippingCost": parametros.costo_envio,
            "commissionRate": parametros.comision_venta,
            "commissionCap": parametros.tope_comision,
            "processingRate": parametros.tarifa_transaccion,
            "fixedFeePerOrder": parametros.tarifa_fija_por_pedido,
            "cardsPerOrder": parametros.cartas_por_pedido,
            "examples": [ejemplo_de_mercado(mercado, precio) for precio in PRECIOS_DE_EJEMPLO],
        },
        "sources": {
            "scryfall": URL_SET_SCRYFALL,
            "composition": URL_REPOSITORIO_COMPOSICION,
            "wizards": URL_ARTICULO_WIZARDS,
            "tcgplayerPack": precios_sellados["productos"]["sobre"]["url"],
            "tcgplayerBox": precios_sellados["productos"]["caja"]["url"],
            "sealedPricesDate": precios_sellados["fecha_consulta"],
        },
    }


catalogo = Catalogo(CARPETA_SET_ACTIVO)
mercado = Mercado(catalogo)
modelo = exportar_modelo(catalogo, mercado)
CARPETA_DATOS_WEB.mkdir(parents=True, exist_ok=True)
ruta = CARPETA_DATOS_WEB / "model.json"
ruta.write_text(json.dumps(modelo, ensure_ascii=False, separators=(",", ":")))

print(f"Modelo exportado a {ruta}, {ruta.stat().st_size / 1024:.1f} KB")
print(f"  {len(modelo['compositions'])} composiciones, {len(modelo['slots'])} pozos")
print(f"  ranura rara {modelo['rareSlot']['categories']}")
print(f"  ejemplo {modelo['rareSlot']['example']}")
print(f"  por rareza {modelo['probabilityByRarity']}")
print(f"  repetidas {modelo['duplicates']}")
print(f"  mercado {modelo['market']['examples']}")
