# Carpeta del set con el que se trabaja; para simular otro set basta con crear su carpeta de datos y apuntar aquí.
# Las salidas en CSV quedan en una carpeta con el mismo nombre que la del set dentro de resultados/.
from pathlib import Path

CARPETA_SET_ACTIVO = Path(__file__).parent / "datos" / "mh3_play"
CARPETA_RESULTADOS = Path(__file__).parent.parent / "resultados" / CARPETA_SET_ACTIVO.name
