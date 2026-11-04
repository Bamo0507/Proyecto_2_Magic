# Descarga la composición de los sobres del set activo y el precio de cada carta, y los congela con la fecha
# de consulta.
import datetime
import json
import time
import urllib.parse
import urllib.request

from simulacion.configuracion import CARPETA_SET_ACTIVO
from simulacion.modelo.catalogo import es_carta_del_set_base

URL_COMPOSICION_SOBRES = "https://raw.githubusercontent.com/taw/magic-sealed-data/master/sealed_basic_data.json"
URL_BUSQUEDA_SCRYFALL = "https://api.scryfall.com/cards/search"
ENCABEZADOS = {"User-Agent": "proyecto-2-magic-uvg/1.0", "Accept": "application/json"}
SEGUNDOS_MAXIMOS_DE_ESPERA = 60
# Scryfall pide esperar entre 50 y 100 milisegundos entre consultas
PAUSA_ENTRE_PAGINAS_SEGUNDOS = 0.1


def descargar_json(url):
    pedido = urllib.request.Request(url, headers=ENCABEZADOS)
    with urllib.request.urlopen(pedido, timeout=SEGUNDOS_MAXIMOS_DE_ESPERA) as respuesta:
        return json.loads(respuesta.read())


def guardar_json(ruta, contenido):
    ruta.write_text(json.dumps(contenido, ensure_ascii=False, indent=1))


def normalizar_identificador(identificador):
    # magic-sealed-data marca con "a" la cara frontal de las cartas de dos caras, Scryfall usa solo el número
    es_foil = identificador.endswith(":foil")
    codigo_set, numero = identificador.removesuffix(":foil").split(":")
    if numero.endswith("a") and numero[:-1].isdigit():
        numero = numero[:-1]
    return f"{codigo_set}:{numero}" + (":foil" if es_foil else "")


def descargar_composicion(codigo_sobre):
    todos_los_sobres = descargar_json(URL_COMPOSICION_SOBRES)
    sobre = next((sobre for sobre in todos_los_sobres if sobre["code"] == codigo_sobre), None)
    if sobre is None:
        raise ValueError(f"No se encontró el sobre {codigo_sobre} en {URL_COMPOSICION_SOBRES}")
    return sobre


def traducir_composicion(sobre, fecha_consulta):
    pozos = {
        nombre_pozo: {
            "cartas": {normalizar_identificador(identificador): peso for identificador, peso in pozo["cards"].items()}
        }
        for nombre_pozo, pozo in sobre["sheets"].items()
    }
    composiciones = [
        {"cartas_por_pozo": composicion["sheets"], "peso": composicion["weight"]}
        for composicion in sobre["boosters"]
    ]
    return {
        "fecha_consulta": fecha_consulta,
        "fuente": URL_COMPOSICION_SOBRES,
        "nombre": sobre["name"],
        "composiciones": composiciones,
        "pozos": pozos,
    }


def identificadores_usados(pozos):
    return {
        identificador.removesuffix(":foil")
        for pozo in pozos.values()
        for identificador in pozo["cartas"]
    }


def buscar_en_scryfall(codigo_set):
    parametros = {"q": f"set:{codigo_set}", "unique": "prints", "include_extras": "true", "include_variations": "true"}
    url = URL_BUSQUEDA_SCRYFALL + "?" + urllib.parse.urlencode(parametros)
    cartas = []
    while url:
        pagina = descargar_json(url)
        cartas.extend(pagina["data"])
        url = pagina.get("next_page")
        time.sleep(PAUSA_ENTRE_PAGINAS_SEGUNDOS)
    return cartas


def descargar_cartas_scryfall(codigos_set, carpeta_crudos):
    cartas_por_identificador = {}
    for codigo_set in codigos_set:
        cartas = buscar_en_scryfall(codigo_set)
        guardar_json(carpeta_crudos / f"scryfall_{codigo_set}.json", cartas)
        for carta in cartas:
            cartas_por_identificador[f"{carta['set']}:{carta['collector_number']}"] = carta
    return cartas_por_identificador


def precio_a_numero(texto_precio):
    return float(texto_precio) if texto_precio is not None else None


def congelar_precios(identificadores, cartas_scryfall):
    sin_encontrar = sorted(identificador for identificador in identificadores if identificador not in cartas_scryfall)
    if sin_encontrar:
        raise ValueError(f"Estas cartas de los sobres no aparecen en Scryfall {sin_encontrar}")
    return {
        identificador: {
            "nombre": cartas_scryfall[identificador]["name"],
            "rareza": cartas_scryfall[identificador]["rarity"],
            "precio_normal": precio_a_numero(cartas_scryfall[identificador]["prices"]["usd"]),
            "precio_foil": precio_a_numero(cartas_scryfall[identificador]["prices"]["usd_foil"]),
            "tcgplayer_id": cartas_scryfall[identificador].get("tcgplayer_id"),
        }
        for identificador in sorted(identificadores)
    }


def reportar_resumen(fecha_consulta, cartas, configuracion):
    codigo_set_base = configuracion["codigo_set_base"]
    numero_maximo_set_base = configuracion["numero_maximo_set_base"]
    cartas_base = [
        identificador for identificador in cartas
        if es_carta_del_set_base(identificador, codigo_set_base, numero_maximo_set_base)
    ]
    print(f"Fecha de consulta {fecha_consulta}")
    print(f"Cartas con precio guardadas {len(cartas)}, del set base {len(cartas_base)}")


def descargar_y_congelar(carpeta_set):
    configuracion = json.loads((carpeta_set / "configuracion_set.json").read_text())
    fecha_consulta = datetime.date.today().isoformat()
    carpeta_crudos = carpeta_set / "crudos"
    carpeta_crudos.mkdir(exist_ok=True)

    composicion = traducir_composicion(descargar_composicion(configuracion["codigo_sobre_fuente"]), fecha_consulta)
    guardar_json(carpeta_set / "composicion_sobres.json", composicion)

    identificadores = identificadores_usados(composicion["pozos"])
    codigos_set = sorted({identificador.split(":")[0] for identificador in identificadores})
    cartas = congelar_precios(identificadores, descargar_cartas_scryfall(codigos_set, carpeta_crudos))
    guardar_json(
        carpeta_set / "cartas.json",
        {
            "fecha_consulta": fecha_consulta,
            "fuente": "Scryfall (precio USD = TCGplayer Market Price)",
            "cartas": cartas,
        },
    )
    reportar_resumen(fecha_consulta, cartas, configuracion)


descargar_y_congelar(CARPETA_SET_ACTIVO)
