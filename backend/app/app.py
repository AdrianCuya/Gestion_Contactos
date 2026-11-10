from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId
from datetime import datetime
import requests

# Importar la base de datos y colecciones conectadas a MongoDB Atlas
from config import db, users_collection, contacts_collection

app = Flask(__name__)
# Habilitar CORS para permitir peticiones desde el frontend web
CORS(app)


# ==================== RUTA: REGISTRO DE USUARIOS ====================
@app.route('/api/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data.get('name', 'Usuario')
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"message": "Correo y contraseña son requeridos"}), 400

        if users_collection.find_one({"email": email}):
            return jsonify({"message": "El correo ya está registrado"}), 400

        hashed_password = generate_password_hash(password)
        new_user = {
            "name": name,
            "email": email,
            "password": hashed_password
        }
        
        resultado = users_collection.insert_one(new_user)
        print(f"[OK] Usuario guardado en Atlas con ID: {resultado.inserted_id}")

        return jsonify({"message": "Usuario creado con éxito"}), 201

    except Exception as e:
        print(f"[ERROR EN REGISTRO]: {e}")
        return jsonify({"message": f"Error interno: {str(e)}"}), 500


# ==================== RUTA: INICIO DE SESIÓN (LOGIN) ====================
@app.route('/api/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = users_collection.find_one({"email": email})

        if user and check_password_hash(user["password"], password):
            return jsonify({
                "message": "Inicio de sesión exitoso",
                "user": {
                    "name": user.get("name", "Usuario"),
                    "email": user["email"]
                }
            }), 200

        return jsonify({"message": "Correo o contraseña incorrectos"}), 401

    except Exception as e:
        print(f"[ERROR EN LOGIN]: {e}")
        return jsonify({"message": f"Error interno: {str(e)}"}), 500


# ==================== RUTA: GESTIONAR CONTACTOS (GET / POST) ====================
@app.route('/api/contacts', methods=['GET', 'POST', 'OPTIONS'])
def handle_contacts():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    # 1. OBTENER / LEER CONTACTOS (GET)
    if request.method == 'GET':
        try:
            contactos = list(contacts_collection.find())
            
            # Convertir el ObjectId de MongoDB a String para JSON
            for c in contactos:
                c['_id'] = str(c['_id'])

            return jsonify(contactos), 200

        except Exception as e:
            print(f"[ERROR AL LEER CONTACTOS]: {e}")
            return jsonify({"message": f"Error interno: {str(e)}"}), 500

    # 2. CREAR / GUARDAR CONTACTO (POST)
    if request.method == 'POST':
        try:
            data = request.get_json()

            if not data.get('nombre') and not data.get('nombre_completo'):
                return jsonify({"message": "El nombre del contacto es requerido"}), 400

            # Garantizar que siempre se guarde la fecha de creación y el origen
            if 'fecha_creacion' not in data:
                data['fecha_creacion'] = datetime.now().isoformat()
            if 'origen_registro' not in data and 'origen' not in data:
                data['origen_registro'] = 'MANUAL'

            # Guardar en la colección 'contacts' de MongoDB Atlas
            resultado = contacts_collection.insert_one(data)
            print(f"[OK] Contacto guardado en Atlas con ID: {resultado.inserted_id}")

            return jsonify({"message": "Contacto guardado correctamente", "id": str(resultado.inserted_id)}), 201

        except Exception as e:
            print(f"[ERROR EN CONTACTO]: {e}")
            return jsonify({"message": f"Error al guardar contacto: {str(e)}"}), 500


# ==================== RUTA: HISTORIAL DE REGISTROS ====================
@app.route('/api/historial', methods=['GET', 'OPTIONS'])
def get_historial():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        # Obtener todos los contactos ordenados del más reciente al más antiguo
        contactos_cursor = list(contacts_collection.find().sort("_id", -1))

        contactos = []
        totales = {"todos": 0, "ocr": 0, "manual": 0}

        for c in contactos_cursor:
            totales["todos"] += 1
            
            # Normalizar el origen (OCR o MANUAL)
            origen_raw = str(c.get("origen_registro") or c.get("origen") or "MANUAL").upper()
            origen = "OCR" if "OCR" in origen_raw else "MANUAL"

            if origen == "OCR":
                totales["ocr"] += 1
            else:
                totales["manual"] += 1

            # Mapeo flexible de nombres de campos para evitar datos vacíos
            nombre = c.get("nombre_completo") or c.get("nombre") or "Contacto sin nombre"
            empresa = c.get("empresa_rubro") or c.get("empresa") or "Sin empresa / rubro"
            fecha = c.get("fecha_creacion") or datetime.now().isoformat()

            contactos.append({
                "id": str(c["_id"]),
                "nombre_completo": nombre,
                "empresa_rubro": empresa,
                "origen_registro": origen,
                "fecha_creacion": fecha
            })

        return jsonify({
            "totales": totales,
            "contactos": contactos
        }), 200

    except Exception as e:
        print(f"[ERROR EN HISTORIAL]: {e}")
        return jsonify({"message": f"Error interno al obtener historial: {str(e)}"}), 500


# ==================== RUTA: ELIMINAR CONTACTO ====================
@app.route('/api/contacts/<id>', methods=['DELETE', 'OPTIONS'])
def delete_contact(id):
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        resultado = contacts_collection.delete_one({"_id": ObjectId(id)})

        if resultado.deleted_count > 0:
            print(f"[OK] Contacto eliminado ID: {id}")
            return jsonify({"message": "Contacto eliminado correctamente"}), 200
        else:
            return jsonify({"message": "No se encontró el contacto"}), 404

    except Exception as e:
        print(f"[ERROR AL ELIMINAR CONTACTO]: {e}")
        return jsonify({"message": f"Error interno: {str(e)}"}), 500
    
import requests

# ==================== RUTA: ASISTENTE IA (LLAMA 3 + OLLAMA) ====================
@app.route('/api/chat-ia', methods=['POST', 'OPTIONS'])
def chat_ia():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'}), 200

    try:
        data = request.get_json() or {}
        user_message = data.get('message', '')

        if not user_message:
            return jsonify({"message": "El mensaje no puede estar vacío"}), 400

        # Obtener datos de MongoDB Atlas para dar contexto
        total_contactos = contacts_collection.count_documents({})
        contactos_cursor = list(contacts_collection.find().limit(10))

        resumen_contactos = []
        for c in contactos_cursor:
            nombre = c.get("nombre") or c.get("nombre_completo") or "Sin nombre"
            empresa = c.get("empresa") or c.get("empresa_rubro") or "Sin empresa"
            resumen_contactos.append(f"- {nombre} ({empresa})")

        lista_texto = "\n".join(resumen_contactos) if resumen_contactos else "No hay contactos registrados."

        # Prompt estructurado para Llama 3
        system_prompt = f"""Eres el Asistente IA del sistema Duckworth.
Información del sistema:
- Total contactos registrados: {total_contactos}
- Muestra de contactos:
{lista_texto}

REGLA ACLARATORIA: En este sistema, el campo "Nota" o "Notas" se refiere a OBSERVACIONES DE TEXTO o comentarios sobre el contacto (por ejemplo: "", "Llamar por la tarde", etc.), NO a calificaciones numéricas o notas de exámenes.

Responde a la consulta del usuario de forma concisa y precisa.

Consulta: {user_message}"""

        # Enviar solicitud a la API local de Ollama (puerto 11434)
        payload = {
            "model": "llama3.2",  # Cambiado a la versión ultra rápida
            "prompt": system_prompt,
            "stream": False
        }

        response = requests.post("http://localhost:11434/api/generate", json=payload, timeout=60)

        if response.status_code == 200:
            res_json = response.json()
            return jsonify({"reply": res_json.get("response", "Sin respuesta.")}), 200
        else:
            return jsonify({"message": f"Ollama devolvió código {response.status_code}. Revisa si el modelo 'llama3' está descargado."}), 500

    except requests.exceptions.ConnectionError:
        return jsonify({"message": "No se pudo conectar a Ollama en http://localhost:11434. Asegúrate de tener Ollama corriendo."}), 500

    except Exception as e:
        print(f"[ERROR EN API CHAT IA]: {e}")
        return jsonify({"message": f"Error interno: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)



