from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import numpy as np
from collections import Counter

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Layout físico da roleta europeia (ordem na roda)
ROULETTE_WHEEL = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
]

# Mapa de posição de cada número na roda
WHEEL_POSITION = {num: idx for idx, num in enumerate(ROULETTE_WHEEL)}

# Cores dos números
RED_NUMBERS = {1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36}
BLACK_NUMBERS = {2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35}

# Grupos fixos P2 e P3
P2_NUMBERS = {0, 1, 2, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 19, 20, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35}
P3_NUMBERS = {0, 3, 4, 5, 6, 9, 11, 13, 14, 15, 18, 20, 21, 23, 24, 25, 28, 29, 30, 33, 34, 35}


# Define Models
class RouletteNumber(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    number: int
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    suggestions: Optional[List[int]] = None
    is_hit: bool = False


class RouletteNumberInput(BaseModel):
    number: int = Field(..., ge=0, le=36)


class Suggestion(BaseModel):
    main_numbers: List[int]
    regions: List[List[int]]
    probabilities: List[float]


def get_wheel_distance(num1: int, num2: int) -> int:
    """Calcula a distância entre dois números na roda (sentido horário)"""
    pos1 = WHEEL_POSITION[num1]
    pos2 = WHEEL_POSITION[num2]
    distance = (pos2 - pos1) % len(ROULETTE_WHEEL)
    return distance


def get_neighbors(number: int, count: int = 3) -> List[int]:
    """Retorna os vizinhos de um número na roda"""
    pos = WHEEL_POSITION[number]
    neighbors = []
    
    for i in range(1, count + 1):
        # Vizinhos à esquerda
        left_pos = (pos - i) % len(ROULETTE_WHEEL)
        neighbors.append(ROULETTE_WHEEL[left_pos])
        
        # Vizinhos à direita
        right_pos = (pos + i) % len(ROULETTE_WHEEL)
        neighbors.append(ROULETTE_WHEEL[right_pos])
    
    return neighbors


def analyze_patterns(numbers: List[int]) -> Suggestion:
    """Analisa padrões e sugere 3 regiões baseado em ML"""
    if len(numbers) < 3:
        # Sugestão inicial baseada em setores quentes padrão
        main_numbers = [17, 25, 0]  # Setores clássicos
    else:
        # Análise de distâncias recentes
        recent_distances = []
        for i in range(len(numbers) - 1):
            dist = get_wheel_distance(numbers[i], numbers[i + 1])
            recent_distances.append(dist)
        
        # Análise de setores mais frequentes
        sector_frequency = Counter(numbers[-10:])  # Últimos 10 números
        
        # Análise de distâncias médias
        if len(recent_distances) >= 3:
            avg_distance = np.mean(recent_distances[-5:])  # Média das últimas 5 distâncias
            std_distance = np.std(recent_distances[-5:]) if len(recent_distances) >= 5 else 10
        else:
            avg_distance = 10
            std_distance = 5
        
        # Predição baseada em padrões
        last_number = numbers[-1]
        last_pos = WHEEL_POSITION[last_number]
        
        # Sugerir 3 posições baseadas em:
        # 1. Distância média observada
        # 2. Setores menos visitados recentemente (opostos)
        # 3. Padrão de alternância
        
        predictions = []
        
        # Previsão 1: Baseada na distância média
        pred1_pos = int((last_pos + avg_distance) % len(ROULETTE_WHEEL))
        predictions.append(ROULETTE_WHEEL[pred1_pos])
        
        # Previsão 2: Setor oposto (180 graus)
        pred2_pos = (last_pos + len(ROULETTE_WHEEL) // 2) % len(ROULETTE_WHEEL)
        predictions.append(ROULETTE_WHEEL[pred2_pos])
        
        # Previsão 3: Baseada em distância média + variação
        pred3_pos = int((last_pos + avg_distance + std_distance) % len(ROULETTE_WHEEL))
        predictions.append(ROULETTE_WHEEL[pred3_pos])
        
        # Ajustar para números únicos
        main_numbers = list(dict.fromkeys(predictions))[:3]
        
        # Se não temos 3 únicos, adicionar números populares
        if len(main_numbers) < 3:
            popular = [num for num, _ in sector_frequency.most_common(5) if num not in main_numbers]
            main_numbers.extend(popular[:3 - len(main_numbers)])
        
        # Garantir sempre 3 números
        if len(main_numbers) < 3:
            available = [n for n in range(37) if n not in main_numbers]
            main_numbers.extend(available[:3 - len(main_numbers)])
    
    # Criar regiões com vizinhos
    regions = []
    for num in main_numbers[:3]:
        neighbors = get_neighbors(num, 3)
        region = [num] + neighbors
        regions.append(sorted(set(region)))
    
    # Calcular probabilidades (simuladas baseadas em confiança)
    if len(numbers) < 5:
        probabilities = [0.25, 0.20, 0.15]
    else:
        confidence = min(len(numbers) / 20, 1.0)  # Confiança aumenta com mais dados
        probabilities = [
            round(0.20 + confidence * 0.10, 2),
            round(0.15 + confidence * 0.08, 2),
            round(0.12 + confidence * 0.05, 2)
        ]
    
    return Suggestion(
        main_numbers=main_numbers[:3],
        regions=regions[:3],
        probabilities=probabilities[:3]
    )


# Endpoints
@api_router.get("/")
async def root():
    return {
        "message": "Roulette ML Analyzer API",
        "version": "1.0",
        "endpoints": {
            "add_via_link": "/api/roulette/add-number/{number}",
            "add_via_post": "/api/roulette/add",
            "undo": "/api/roulette/undo",
            "clear": "/api/roulette/clear",
            "history": "/api/roulette/history",
            "suggestions": "/api/roulette/suggestions"
        },
        "examples": {
            "add_number_17": f"/api/roulette/add-number/17",
            "add_number_0": f"/api/roulette/add-number/0"
        }
    }


async def _add_number_logic(number: int):
    """Lógica compartilhada para adicionar número"""
    # Buscar histórico existente
    history = await db.roulette_history.find({}, {"_id": 0}).sort("timestamp", 1).to_list(1000)
    
    # Verificar se o número anterior tinha sugestões
    if history and history[-1].get('suggestions'):
        # Verificar se o novo número está nas sugestões anteriores
        previous_suggestions = history[-1]['suggestions']
        is_hit = number in previous_suggestions
    else:
        is_hit = False
    
    # Gerar novas sugestões baseadas no histórico + novo número
    all_numbers = [h['number'] for h in history] + [number]
    suggestions = analyze_patterns(all_numbers)
    
    # Criar lista flat de todos os números sugeridos
    all_suggested_numbers = []
    for region in suggestions.regions:
        all_suggested_numbers.extend(region)
    all_suggested_numbers = list(set(all_suggested_numbers))
    
    # Criar objeto
    roulette_obj = RouletteNumber(
        number=number,
        suggestions=all_suggested_numbers,
        is_hit=is_hit
    )
    
    # Salvar no banco
    doc = roulette_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    await db.roulette_history.insert_one(doc)
    
    return roulette_obj, suggestions


@api_router.post("/roulette/add", response_model=RouletteNumber)
async def add_number(input: RouletteNumberInput):
    """Adiciona um novo número à sequência via POST"""
    roulette_obj, _ = await _add_number_logic(input.number)
    return roulette_obj


@api_router.get("/roulette/add-number/{number}")
async def add_number_via_link(number: int):
    """
    Adiciona um novo número à sequência via GET (link direto)
    
    Exemplo: /api/roulette/add-number/17
    
    Retorna o número adicionado e as novas sugestões
    """
    # Validar número
    if number < 0 or number > 36:
        raise HTTPException(status_code=400, detail="Número deve estar entre 0 e 36")
    
    # Adicionar número
    roulette_obj, suggestions = await _add_number_logic(number)
    
    # Retornar resposta completa com sugestões
    return {
        "success": True,
        "message": f"Número {number} adicionado com sucesso!",
        "number": number,
        "is_hit": roulette_obj.is_hit,
        "suggestions": {
            "main_numbers": suggestions.main_numbers,
            "regions": suggestions.regions,
            "probabilities": suggestions.probabilities
        },
        "stats": {
            "total": len(await db.roulette_history.find({}, {"_id": 0}).to_list(1000)),
            "last_added": number
        }
    }


@api_router.post("/roulette/undo")
async def undo_last():
    """Remove o último número adicionado"""
    # Buscar o último registro
    last = await db.roulette_history.find_one(
        {},
        {"_id": 0},
        sort=[("timestamp", -1)]
    )
    
    if not last:
        raise HTTPException(status_code=404, detail="Nenhum número para desfazer")
    
    # Remover do banco
    await db.roulette_history.delete_one({"id": last['id']})
    
    return {"message": "Último número removido", "number": last['number']}


@api_router.post("/roulette/clear")
async def clear_all():
    """Limpa todo o histórico"""
    result = await db.roulette_history.delete_many({})
    return {"message": "Histórico limpo", "deleted_count": result.deleted_count}


@api_router.get("/roulette/history")
async def get_history():
    """Retorna o histórico completo com sugestões"""
    history = await db.roulette_history.find({}, {"_id": 0}).sort("timestamp", 1).to_list(1000)
    
    # Converter timestamps
    for item in history:
        if isinstance(item.get('timestamp'), str):
            item['timestamp'] = datetime.fromisoformat(item['timestamp'])
    
    return {"history": history}


@api_router.get("/roulette/suggestions", response_model=Suggestion)
async def get_suggestions():
    """Retorna as sugestões atuais baseadas no histórico"""
    history = await db.roulette_history.find({}, {"_id": 0}).sort("timestamp", 1).to_list(1000)
    
    if not history:
        # Sugestões iniciais
        numbers = []
    else:
        numbers = [h['number'] for h in history]
    
    suggestions = analyze_patterns(numbers)
    return suggestions


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
