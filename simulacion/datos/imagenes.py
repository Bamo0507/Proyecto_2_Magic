# Links a las imágenes de cada carta, tomados de los datos de Scryfall. Las cartas de dos caras no traen las imágenes
# arriba sino en cada cara, y de esas se usa la cara frontal. También se guarda el dorso que comparten las cartas, que
# Scryfall publica aparte por su identificador. Las imágenes no se descargan; la web las pide directo a Scryfall.
#
# Corrido como script, agrega los links a cartas.json leyendo las respuestas crudas que ya se guardaron, sin volver a
# consultar Scryfall, así que los precios y la fecha de consulta no cambian.
import json
from collections import Counter

from simulacion.configuracion import CARPETA_SET_ACTIVO

TAMANOS_IMAGEN = {"imagen_pequena": "small", "imagen_normal": "normal"}
URL_DORSO_SCRYFALL = "https://backs.scryfall.io/{tamano}/{primero}/{segundo}/{identificador}.jpg"


def imagenes_de_carta(carta_scryfall):
    imagenes = carta_scryfall.get("image_uris")
    if imagenes is None and carta_scryfall.get("card_faces"):
        imagenes = carta_scryfall["card_faces"][0].get("image_uris")
    imagenes = imagenes or {}
    return {campo: imagenes.get(tamano) for campo, tamano in TAMANOS_IMAGEN.items()}


def dorso_de_cartas(cartas_scryfall):
    # Las cartas de dos caras no tienen dorso, por eso se toma el que más se repite entre las demás
    identificadores = Counter(carta["card_back_id"] for carta in cartas_scryfall if carta.get("card_back_id"))
    if not identificadores:
        return None
    identificador = identificadores.most_common(1)[0][0]
    return {
        campo: URL_DORSO_SCRYFALL.format(
            tamano=tamano, primero=identificador[0], segundo=identificador[1], identificador=identificador
        )
        for campo, tamano in TAMANOS_IMAGEN.items()
    }


def cartas_crudas_por_identificador(carpeta_crudos):
    cartas = {}
    for ruta in sorted(carpeta_crudos.glob("scryfall_*.json")):
        for carta in json.loads(ruta.read_text()):
            cartas[f"{carta['set']}:{carta['collector_number']}"] = carta
    return cartas


def agregar_imagenes(carpeta_set):
    ruta_cartas = carpeta_set / "cartas.json"
    datos_cartas = json.loads(ruta_cartas.read_text())
    crudas = cartas_crudas_por_identificador(carpeta_set / "crudos")
    sin_imagen = []
    for identificador, carta in datos_cartas["cartas"].items():
        carta.update(imagenes_de_carta(crudas.get(identificador, {})))
        if carta["imagen_normal"] is None:
            sin_imagen.append(identificador)
    datos_cartas["dorso"] = dorso_de_cartas(crudas.values())
    ruta_cartas.write_text(json.dumps(datos_cartas, ensure_ascii=False, indent=1))
    print(f"Imágenes agregadas a {len(datos_cartas['cartas'])} cartas, sin imagen {len(sin_imagen)} {sin_imagen}")
    print(f"Dorso {datos_cartas['dorso']}")


if __name__ == "__main__":
    agregar_imagenes(CARPETA_SET_ACTIVO)
