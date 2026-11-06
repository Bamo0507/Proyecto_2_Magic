# Semillas fijas de los experimentos, las 30 de 0 a 29 de las primeras pruebas más la 2026 de la corrida de ejemplo.
# La verificación usa semillas aparte, para que sus réplicas no se mezclen con las de los experimentos.
SEMILLA_EJEMPLO = 2026

SEMILLAS_EXPERIMENTOS = (*range(30), SEMILLA_EJEMPLO)

SEMILLAS_VERIFICACION_COLECCIONISTA = tuple(range(10_000, 12_000))
SEMILLA_VERIFICACION_RAREZA = 20_000
SOBRES_VERIFICACION_RAREZA = 500_000

SEMILLA_VERIFICACION_POR_CARTA = 40_000
SOBRES_VERIFICACION_POR_CARTA = 200_000
SEMILLAS_CONSISTENCIA = tuple(range(50_000, 50_031))
# Sobres para estimar qué tan seguido sale una carta repetida dentro de un mismo sobre, que muestra la sección Modelo
SEMILLA_MODELO_REPETIDAS = 60_000
SOBRES_MODELO_REPETIDAS = 100_000
