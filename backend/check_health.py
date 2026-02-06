"""
Script para verificar que el servidor backend está funcionando correctamente.
"""
import requests
import time

def check_backend_health():
    """Verifica que el backend esté respondiendo"""
    try:
        print("🔍 Verificando salud del backend...")
        response = requests.get("http://localhost:8000/", timeout=5)
        if response.status_code == 200:
            print("✅ Backend está funcionando correctamente")
            print(f"📄 Respuesta: {response.json()}")
            return True
        else:
            print(f"⚠️  Backend respondió con código: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ No se pudo conectar al backend. ¿Está el servidor ejecutándose?")
        return False
    except requests.exceptions.Timeout:
        print("❌ Timeout al conectar con el backend")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def check_websocket_stats():
    """Verifica las estadísticas de WebSocket"""
    try:
        print("\n🔍 Verificando estadísticas de WebSocket...")
        response = requests.get("http://localhost:8000/ws/stats", timeout=5)
        if response.status_code == 200:
            stats = response.json()
            print("✅ Estadísticas de WebSocket:")
            print(f"   - Total de rooms: {stats.get('total_rooms', 0)}")
            print(f"   - Total de clientes: {stats.get('total_clients', 0)}")
            print(f"   - Rooms activos: {stats.get('rooms', {})}")
            return True
        else:
            print(f"⚠️  Error obteniendo stats: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def check_games_endpoint():
    """Verifica el endpoint de juegos"""
    try:
        print("\n🔍 Verificando endpoint de juegos...")
        response = requests.get("http://localhost:8000/games", timeout=5)
        if response.status_code == 200:
            games = response.json()
            print(f"✅ Juegos disponibles: {len(games)}")
            for game in games:
                print(f"   - Game ID: {game.get('game_id')}")
            return True
        else:
            print(f"⚠️  Error obteniendo juegos: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


if __name__ == "__main__":
    print("=" * 60)
    print("🏥 DIAGNÓSTICO DE SALUD DEL BACKEND")
    print("=" * 60)
    
    results = []
    results.append(check_backend_health())
    time.sleep(0.5)
    results.append(check_websocket_stats())
    time.sleep(0.5)
    results.append(check_games_endpoint())
    
    print("\n" + "=" * 60)
    if all(results):
        print("✅ TODOS LOS CHECKS PASARON - El backend está funcionando correctamente")
    else:
        print("⚠️  ALGUNOS CHECKS FALLARON - Revisa los errores arriba")
    print("=" * 60)
