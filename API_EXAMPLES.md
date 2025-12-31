# 🔗 Guia de Uso da API de Link

## 🎯 Como Funciona

Agora você pode adicionar números ao sistema **simplesmente acessando uma URL**! 

Não é mais necessário usar a interface web - basta colar o link no navegador ou usar em automações.

---

## 📍 URLs Prontas para Usar

### Adicionar Números (0-36)

Copie e cole diretamente no seu navegador:

```
Número 0:  https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/0
Número 1:  https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/1
Número 2:  https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/2
Número 3:  https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/3
...
Número 17: https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/17
Número 25: https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/25
Número 32: https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/32
...
Número 36: https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/36
```

### Outros Endpoints

```
📊 Ver histórico completo:
https://ola-rides-24.preview.emergentagent.com/api/roulette/history

🎯 Ver sugestões atuais:
https://ola-rides-24.preview.emergentagent.com/api/roulette/suggestions

📖 Ver documentação da API:
https://ola-rides-24.preview.emergentagent.com/api/
```

---

## 📱 Criar Bookmarks no Navegador

**Método 1: Bookmarks Individuais**

Crie um bookmark para cada número que você usa frequentemente:

1. Acesse: `https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/17`
2. Adicione aos favoritos
3. Renomeie para "🎰 Add 17"
4. Repita para outros números

**Método 2: Pasta de Favoritos**

Crie uma pasta "Roleta ML" com bookmarks:
- 🎰 Add 0
- 🎰 Add 17
- 🎰 Add 25
- 🎰 Add 32
- 📊 Ver Histórico
- 🎯 Ver Sugestões

Assim você adiciona números com **apenas 1 clique**!

---

## 🤖 Automação com Scripts

### Script Bash

```bash
#!/bin/bash
# add_numbers.sh - Adiciona múltiplos números automaticamente

BASE_URL="https://ola-rides-24.preview.emergentagent.com/api/roulette"

# Números que caíram na roleta
NUMBERS=(17 34 6 27 13 36 11 30 8 23 10)

echo "🎰 Adicionando números ao sistema..."
echo ""

for num in "${NUMBERS[@]}"; do
    echo "Adicionando: $num"
    
    # Fazer requisição
    response=$(curl -s "$BASE_URL/add-number/$num")
    
    # Extrair informações
    is_hit=$(echo $response | jq -r '.is_hit')
    
    if [ "$is_hit" = "true" ]; then
        echo "  ✅ ACERTO! Número estava nas sugestões!"
    else
        echo "  ➕ Adicionado"
    fi
    
    sleep 1
done

echo ""
echo "📊 Buscando estatísticas finais..."
curl -s "$BASE_URL/history" | jq '{
    total: .history | length,
    acertos: .history | map(select(.is_hit)) | length,
    taxa: (.history | map(select(.is_hit)) | length / (.history | length - 1) * 100 | floor)
}'
```

**Uso:**
```bash
chmod +x add_numbers.sh
./add_numbers.sh
```

---

### Script Python

```python
#!/usr/bin/env python3
# add_numbers.py - Cliente Python para API

import requests
import time
from typing import List

BASE_URL = "https://ola-rides-24.preview.emergentagent.com/api/roulette"

def add_number(number: int) -> dict:
    """Adiciona um número via API"""
    response = requests.get(f"{BASE_URL}/add-number/{number}")
    return response.json()

def get_statistics() -> dict:
    """Obtém estatísticas do histórico"""
    response = requests.get(f"{BASE_URL}/history")
    history = response.json()['history']
    
    total = len(history)
    hits = sum(1 for h in history if h['is_hit'])
    accuracy = (hits / (total - 1) * 100) if total > 1 else 0
    
    return {
        'total': total,
        'hits': hits,
        'accuracy': accuracy
    }

def main():
    # Números para adicionar
    numbers = [17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10]
    
    print("🎰 Adicionando números ao sistema...\n")
    
    for num in numbers:
        result = add_number(num)
        status = "✅ ACERTO!" if result['is_hit'] else "➕ Adicionado"
        print(f"{status} Número {num}")
        print(f"   Sugestões: {result['suggestions']['main_numbers']}")
        time.sleep(1)
    
    print("\n📊 Estatísticas Finais:")
    stats = get_statistics()
    print(f"   Total: {stats['total']} números")
    print(f"   Acertos: {stats['hits']}")
    print(f"   Taxa: {stats['accuracy']:.1f}%")

if __name__ == "__main__":
    main()
```

**Uso:**
```bash
python3 add_numbers.py
```

---

### Script Node.js

```javascript
// add_numbers.js - Cliente Node.js para API

const axios = require('axios');

const BASE_URL = 'https://ola-rides-24.preview.emergentagent.com/api/roulette';

async function addNumber(number) {
    const response = await axios.get(`${BASE_URL}/add-number/${number}`);
    return response.data;
}

async function getStatistics() {
    const response = await axios.get(`${BASE_URL}/history`);
    const history = response.data.history;
    
    const total = history.length;
    const hits = history.filter(h => h.is_hit).length;
    const accuracy = total > 1 ? (hits / (total - 1) * 100) : 0;
    
    return { total, hits, accuracy };
}

async function main() {
    const numbers = [17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10];
    
    console.log('🎰 Adicionando números ao sistema...\n');
    
    for (const num of numbers) {
        const result = await addNumber(num);
        const status = result.is_hit ? '✅ ACERTO!' : '➕ Adicionado';
        console.log(`${status} Número ${num}`);
        console.log(`   Sugestões: ${result.suggestions.main_numbers}`);
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n📊 Estatísticas Finais:');
    const stats = await getStatistics();
    console.log(`   Total: ${stats.total} números`);
    console.log(`   Acertos: ${stats.hits}`);
    console.log(`   Taxa: ${stats.accuracy.toFixed(1)}%`);
}

main().catch(console.error);
```

**Uso:**
```bash
npm install axios
node add_numbers.js
```

---

## 🔌 Integração com Webhooks

Você pode configurar webhooks para enviar números automaticamente quando eventos ocorrerem.

**Exemplo com Zapier/Make:**
1. Crie um trigger (ex: novo email, mensagem, etc)
2. Configure uma ação HTTP GET
3. URL: `https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/{{numero}}`
4. Pronto! Números serão adicionados automaticamente

---

## 📊 Resposta da API

Quando você acessa um link, recebe um JSON com:

```json
{
  "success": true,
  "message": "Número 17 adicionado com sucesso!",
  "number": 17,
  "is_hit": false,
  "suggestions": {
    "main_numbers": [35, 31, 25],
    "regions": [
      [0, 3, 7, 12, 26, 28, 35],
      [1, 9, 14, 18, 20, 22, 31],
      [2, 4, 6, 17, 21, 25, 34]
    ],
    "probabilities": [0.3, 0.23, 0.17]
  },
  "stats": {
    "total": 10,
    "last_added": 17
  }
}
```

**Campos:**
- `success`: Se a operação foi bem-sucedida
- `message`: Mensagem de confirmação
- `number`: Número adicionado
- `is_hit`: Se estava nas sugestões anteriores (acerto)
- `suggestions`: Novas sugestões baseadas em ML
- `stats`: Estatísticas do sistema

---

## 🎯 Casos de Uso

1. **Bookmarks Rápidos**: Adicione números com 1 clique
2. **Automação**: Scripts que monitoram e adicionam números
3. **Integração**: Conecte com outros sistemas via webhooks
4. **Mobile**: Acesse direto do celular sem interface
5. **Sharing**: Compartilhe links com outras pessoas

---

## ⚡ Dicas Avançadas

**1. Adicionar múltiplos números rapidamente:**
- Abra várias abas do navegador
- Cole um link diferente em cada aba
- Pressione Enter em sequência

**2. Criar atalhos de teclado:**
- Configure atalhos do navegador para bookmarks
- Ex: Ctrl+Shift+1 para adicionar número 17

**3. Usar com QR Codes:**
- Gere QR codes para links
- Escaneie para adicionar números via mobile

---

## 🆘 Suporte

Se tiver dúvidas ou problemas:
1. Acesse a documentação: https://ola-rides-24.preview.emergentagent.com/api/
2. Verifique o histórico: https://ola-rides-24.preview.emergentagent.com/api/roulette/history
3. Teste com número simples: https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/0

---

**Made with ❤️ using Emergent AI Platform**
