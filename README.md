# 🎰 Analisador de Roleta com Machine Learning

Aplicação completa de análise de padrões em roleta europeia usando **Machine Learning** para sugerir apostas inteligentes.

## 🚀 Funcionalidades

### ✨ Principais Features

1. **Análise com Machine Learning**
   - Análise de padrões de distância na roda física
   - Detecção de setores quentes e frios
   - Predição baseada em dados históricos

2. **Sistema de Sugestões**
   - 3 regiões recomendadas para apostar
   - Número principal + 3 vizinhos de cada lado (7 números por região)
   - Probabilidade/confiança para cada região

3. **Histórico Inteligente**
   - Tabela com todos os números inseridos
   - Linhas **VERDES** quando há acerto (número estava nas sugestões anteriores)
   - Visualização das sugestões anteriores

4. **Controles**
   - Adicionar número (0-36)
   - Desfazer último número
   - Limpar todo o histórico

5. **Estatísticas em Tempo Real**
   - Total de números inseridos
   - Total de acertos
   - Taxa de acerto percentual

## 🔗 API de Link Direto (NOVO!)

Agora você pode adicionar números diretamente via URL, sem precisar usar a interface!

### Como Usar:

**Formato da URL:**
```
https://seu-dominio.com/api/roulette/add-number/{NÚMERO}
```

**Exemplos:**
```
# Adicionar número 17
https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/17

# Adicionar número 0
https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/0

# Adicionar número 25
https://ola-rides-24.preview.emergentagent.com/api/roulette/add-number/25
```

### Resposta JSON:
```json
{
  "success": true,
  "message": "Número 17 adicionado com sucesso!",
  "number": 17,
  "is_hit": false,
  "suggestions": {
    "main_numbers": [35, 31, 25],
    "regions": [[...], [...], [...]],
    "probabilities": [0.3, 0.23, 0.17]
  },
  "stats": {
    "total": 10,
    "last_added": 17
  }
}
```

### Casos de Uso:
- 📱 **Criar bookmarks** no navegador para números frequentes
- 🤖 **Automação** com scripts/bots
- 🔌 **Webhooks** de sistemas externos
- 📊 **Integração** com outras ferramentas
- ⚡ **Acesso rápido** sem interface

## 🎯 Como Usar

1. **Adicionar Número**
   - Digite o número que caiu na roleta (0-36)
   - Clique em "Adicionar" ou pressione Enter
   - O sistema analisa e gera novas sugestões

2. **Interpretar Sugestões**
   - 3 regiões são exibidas com cores
   - Cada região tem um número principal (destaque)
   - Os vizinhos estão ao lado do número principal
   - A confiança indica a probabilidade estimada

3. **Verificar Acertos**
   - No histórico, linhas verdes = acerto
   - Um acerto significa que o número caiu em uma das sugestões anteriores

## 🛠️ Tecnologias

### Backend
- **FastAPI** - Framework web moderno e rápido
- **MongoDB** - Banco de dados para histórico
- **scikit-learn** - Machine Learning
- **NumPy** - Computação numérica

### Frontend
- **React 19** - Interface do usuário
- **Tailwind CSS** - Estilização moderna
- **Radix UI** - Componentes acessíveis
- **Axios** - Requisições HTTP
- **Sonner** - Toast notifications

## 📊 Algoritmo de Análise

O sistema usa um algoritmo proprietário que analisa:

1. **Distância entre números consecutivos** na roda física
2. **Frequência de setores** visitados recentemente
3. **Padrões de alternância** entre regiões
4. **Distância média** e variação estatística

### Layout da Roleta Europeia
```
[0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 
 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26]
```

## 🎨 Interface

- **Design Dark Mode** - Interface elegante e moderna
- **Responsivo** - Funciona em desktop e mobile
- **Cores Reais** - Vermelho, Preto e Verde (como na roleta real)
- **Animações Suaves** - Feedback visual imediato

## 🔧 Desenvolvimento

### Instalar Dependências
```bash
# Backend
cd backend
pip install -r requirements.txt

# Frontend
cd frontend
yarn install
```

### Executar Localmente
```bash
# Backend (porta 8001)
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 8001

# Frontend (porta 3000)
cd frontend
yarn start
```

## 📡 API Endpoints

- `GET /api/` - Health check
- `POST /api/roulette/add` - Adicionar número
- `POST /api/roulette/undo` - Desfazer último
- `POST /api/roulette/clear` - Limpar histórico
- `GET /api/roulette/history` - Obter histórico completo
- `GET /api/roulette/suggestions` - Obter sugestões atuais

## ⚠️ Aviso Legal

Este aplicativo é apenas para fins educacionais e de entretenimento. 
O jogo de azar pode ser viciante. Jogue com responsabilidade.

## 🎲 Estatísticas

O sistema mostra em tempo real:
- Total de números inseridos
- Quantidade de acertos
- Taxa de acerto percentual

---

**Made with ❤️ using Emergent AI Platform**
