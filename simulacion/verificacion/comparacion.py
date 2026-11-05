# Medidas comunes para comparar lo que da la simulación contra un valor de referencia.
import numpy as np

# Valor de la normal estándar que deja 2.5% en cada cola, para intervalos de confianza del 95%
Z_95 = 1.959963984540054


def error_relativo(valor_simulado, valor_de_referencia):
    return abs(valor_simulado - valor_de_referencia) / abs(valor_de_referencia)


def intervalo_confianza_media(muestras):
    muestras = np.asarray(muestras, dtype=float)
    media = float(muestras.mean())
    error_estandar = float(muestras.std(ddof=1) / np.sqrt(len(muestras)))
    return media - Z_95 * error_estandar, media + Z_95 * error_estandar


def intervalo_confianza_proporcion(exitos, intentos):
    proporcion = exitos / intentos
    error_estandar = np.sqrt(proporcion * (1 - proporcion) / intentos)
    return proporcion - Z_95 * error_estandar, proporcion + Z_95 * error_estandar
