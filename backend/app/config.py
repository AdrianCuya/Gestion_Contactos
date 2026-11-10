import os
import certifi
from pathlib import Path
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, OperationFailure
from dotenv import load_dotenv

# 1. Cargar las variables de entorno (.env)
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(dotenv_path=BASE_DIR / '.env')

MONGO_URI = os.getenv('MONGO_URI')
DB_NAME = os.getenv('DB_NAME', 'Gestion_Contactos')

def conectar_db():
    if not MONGO_URI:
        print("[ERROR] La variable MONGO_URI no está configurada en el archivo .env")
        return None, None

    try:
        # certifi.where() asegura que la conexión SSL con MongoDB Atlas sea válida en Windows
        client = MongoClient(
            MONGO_URI, 
            serverSelectionTimeoutMS=5000,
            tlsCAFile=certifi.where()
        )
        
        # Probar la conexión mediante un ping al servidor
        client.admin.command('ping')
        print("==================================================")
        print(" [OK] Conexión establecida con MongoDB Atlas")
        print("==================================================")
        
        db = client[DB_NAME]
        return client, db

    except ConnectionFailure:
        print("[ERROR] No se pudo conectar a MongoDB Atlas. Revisa tu IP en Atlas (Network Access) o el URI.")
        return None, None
    except OperationFailure as e:
        print(f"[ERROR] Autenticación fallida en MongoDB (Usuario/Contraseña incorrectos): {e}")
        return None, None
    except Exception as e:
        print(f"[ERROR] Ocurrió un error inesperado al conectar: {e}")
        return None, None

# Inicialización
client, db = conectar_db()

# Colecciones estandarizadas 
if db is not None:
    users_collection = db['usuarios']
    contacts_collection = db['contactos']
else:
    users_collection = None
    contacts_collection = None


if __name__ == '__main__':
    print("\nEjecutando script de verificación de la base de datos...")
    if db is not None:
        doc_prueba = {"telefono": "123456", "nombre": "juan"}
        resultado = db['test_conexion'].insert_one(doc_prueba)
        print(f" Documento insertado con ID: {resultado.inserted_id}")
    else:
        print(" Error: No hay conexión a la base de datos.")