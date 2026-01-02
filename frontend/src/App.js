import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Undo, Plus, TrendingUp, RefreshCw, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [number, setNumber] = useState("");
  const [history, setHistory] = useState([]);
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Buscar dados iniciais
  useEffect(() => {
    fetchHistory();
    fetchSuggestions();
  }, []);

  // Auto-refresh a cada 3 segundos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchHistoryQuietly();
      fetchSuggestionsQuietly();
    }, 3000); // 3 segundos

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const fetchHistory = async () => {
    try {
      setSyncing(true);
      const response = await axios.get(`${API}/roulette/history`);
      setHistory(response.data.history || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setSyncing(false);
    }
  };

  const fetchHistoryQuietly = async () => {
    try {
      setSyncing(true);
      const response = await axios.get(`${API}/roulette/history`);
      setHistory(response.data.history || []);
      setLastUpdate(new Date());
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setSyncing(false);
    }
  };

  const fetchSuggestions = async () => {
    try {
      const response = await axios.get(`${API}/roulette/suggestions`);
      setSuggestions(response.data);
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
    }
  };

  const fetchSuggestionsQuietly = async () => {
    try {
      const response = await axios.get(`${API}/roulette/suggestions`);
      setSuggestions(response.data);
    } catch (error) {
      console.error("Erro ao buscar sugestões:", error);
    }
  };

  const addNumber = async () => {
    const num = parseInt(number);
    if (isNaN(num) || num < 0 || num > 36) {
      toast.error("Por favor, insira um número válido entre 0 e 36");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/roulette/add`, { number: num });
      toast.success(`Número ${num} adicionado!`);
      setNumber("");
      await fetchHistory();
      await fetchSuggestions();
    } catch (error) {
      toast.error("Erro ao adicionar número");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const undoLast = async () => {
    if (history.length === 0) {
      toast.error("Nenhum número para desfazer");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API}/roulette/undo`);
      toast.success(`Número ${response.data.number} removido`);
      await fetchHistory();
      await fetchSuggestions();
    } catch (error) {
      toast.error("Erro ao desfazer");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = async () => {
    if (history.length === 0) {
      toast.error("Histórico já está vazio");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/roulette/clear`);
      toast.success("Histórico limpo!");
      await fetchHistory();
      await fetchSuggestions();
    } catch (error) {
      toast.error("Erro ao limpar histórico");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      addNumber();
    }
  };

  const getNumberColor = (num) => {
    if (num === 0) return "bg-green-600";
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num) ? "bg-red-600" : "bg-gray-900";
  };

  const calculateStats = () => {
    if (history.length === 0) return { total: 0, hits: 0, accuracy: 0 };
    const hits = history.filter(h => h.is_hit).length;
    const total = history.length - 1; // Primeiro número não tem sugestão anterior
    const accuracy = total > 0 ? ((hits / total) * 100).toFixed(1) : 0;
    return { total, hits, accuracy };
  };

  const stats = calculateStats();

  const formatLastUpdate = () => {
    if (!lastUpdate) return "Nunca";
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000);
    if (diff < 5) return "Agora mesmo";
    if (diff < 60) return `${diff}s atrás`;
    return lastUpdate.toLocaleTimeString("pt-BR");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center justify-center gap-3">
            <span className="text-5xl">🎰</span>
            Analisador de Roleta ML
          </h1>
          <p className="text-gray-400 text-lg">Análise inteligente de padrões com Machine Learning</p>
          
          {/* API Info */}
          <Card className="bg-blue-900/20 border-blue-600/30 mt-4">
            <CardContent className="pt-4">
              <div className="flex items-start gap-2 text-left">
                <span className="text-2xl">🔗</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-blue-300 font-semibold">API de Link Direto</p>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={autoRefresh ? "outline" : "default"}
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={autoRefresh ? "border-green-500 text-green-400" : ""}
                        data-testid="auto-refresh-toggle"
                      >
                        {autoRefresh ? (
                          <>
                            <RefreshCw className={`w-3 h-3 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                            Auto-sync ON
                          </>
                        ) : (
                          <>
                            <Pause className="w-3 h-3 mr-1" />
                            Pausado
                          </>
                        )}
                      </Button>
                      {autoRefresh && (
                        <span className="text-xs text-gray-400">
                          {syncing ? "Sincronizando..." : `Atualizado ${formatLastUpdate()}`}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-2">
                    Adicione números via URL (perfeito para automação):
                  </p>
                  <div className="bg-gray-900/50 p-2 rounded border border-gray-700">
                    <code className="text-green-400 text-xs break-all">
                      {BACKEND_URL}/api/roulette/add-number/NÚMERO
                    </code>
                  </div>
                  <p className="text-gray-400 text-xs mt-2">
                    Exemplo: .../add-number/17 para adicionar o número 17
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Total de Números</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{history.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Acertos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{stats.hits}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-gray-400">Taxa de Acerto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-500">{stats.accuracy}%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Section */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Adicionar Número</CardTitle>
              <CardDescription className="text-gray-400">Digite o número que caiu na roleta (0-36)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0"
                  max="36"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ex: 17"
                  className="bg-gray-700 border-gray-600 text-white text-xl"
                  disabled={loading}
                  data-testid="number-input"
                />
                <Button
                  onClick={addNumber}
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700"
                  data-testid="add-number-button"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={undoLast}
                  disabled={loading || history.length === 0}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  data-testid="undo-button"
                >
                  <Undo className="w-4 h-4 mr-2" />
                  Desfazer
                </Button>
                <Button
                  onClick={clearAll}
                  disabled={loading || history.length === 0}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                  data-testid="clear-button"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar Tudo
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Suggestions */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sugestões de Apostas
              </CardTitle>
              <CardDescription className="text-gray-400">3 regiões recomendadas com vizinhos</CardDescription>
            </CardHeader>
            <CardContent>
              {suggestions && suggestions.regions ? (
                <div className="space-y-3">
                  {suggestions.regions.map((region, idx) => (
                    <div key={idx} className="p-3 bg-gray-700 rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-semibold">Região {idx + 1}</span>
                        <Badge variant="outline" className="bg-blue-600/20 text-blue-400 border-blue-500">
                          {suggestions.probabilities[idx] * 100}% confiança
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-gray-400">Principal:</span>
                          <div className={`${getNumberColor(suggestions.main_numbers[idx])} text-white px-3 py-1 rounded-full text-sm font-bold`}>
                            {suggestions.main_numbers[idx]}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-wrap">
                          <span className="text-xs text-gray-400">Vizinhos:</span>
                          {region.filter(n => n !== suggestions.main_numbers[idx]).map((num) => (
                            <div key={num} className={`${getNumberColor(num)} text-white px-2 py-1 rounded-full text-xs`}>
                              {num}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">Adicione números para gerar sugestões</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Histórico</CardTitle>
            <CardDescription className="text-gray-400">
              Linhas verdes indicam acertos (número estava nas sugestões anteriores)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="history-table">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">#</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Número</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 text-gray-300 font-semibold">Sugestões Anteriores</th>
                  </tr>
                </thead>
                <tbody>
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-gray-400">
                        Nenhum número adicionado ainda
                      </td>
                    </tr>
                  ) : (
                    [...history].reverse().map((item, idx) => {
                      const isHit = item.is_hit;
                      const rowNum = history.length - idx;
                      return (
                        <tr
                          key={item.id}
                          className={`border-b border-gray-700 transition-colors ${
                            isHit ? "bg-green-900/30" : "hover:bg-gray-700/30"
                          }`}
                          data-testid={`history-row-${isHit ? 'hit' : 'miss'}`}
                        >
                          <td className="py-3 px-4 text-gray-400">{rowNum}</td>
                          <td className="py-3 px-4">
                            <div className={`${getNumberColor(item.number)} text-white px-3 py-1 rounded-full text-sm font-bold inline-block`}>
                              {item.number}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {isHit ? (
                              <Badge className="bg-green-600 hover:bg-green-700">✓ Acerto</Badge>
                            ) : rowNum === history.length ? (
                              <Badge variant="outline" className="border-gray-600 text-gray-400">Primeiro</Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-600 text-gray-400">-</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {rowNum === history.length ? (
                              <span className="text-gray-500 text-sm">N/A</span>
                            ) : history[history.length - idx].suggestions ? (
                              <div className="flex flex-wrap gap-1">
                                {history[history.length - idx].suggestions.slice(0, 10).map((num) => (
                                  <span
                                    key={num}
                                    className={`${getNumberColor(num)} text-white px-2 py-0.5 rounded text-xs`}
                                  >
                                    {num}
                                  </span>
                                ))}
                                {history[history.length - idx].suggestions.length > 10 && (
                                  <span className="text-gray-400 text-xs">+{history[history.length - idx].suggestions.length - 10}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-500 text-sm">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default App;