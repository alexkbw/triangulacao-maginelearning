import { useState, useEffect } from "react";
import "@/App.css";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Undo, Plus, TrendingUp, RefreshCw, Pause } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

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
    }, 3000);

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

  const calculateStats = (hitField) => {
    if (history.length === 0) return { total: 0, hits: 0, accuracy: 0 };
    const hits = history.filter(h => h[hitField]).length;
    const total = history.length - 1;
    const accuracy = total > 0 ? ((hits / total) * 100).toFixed(1) : 0;
    return { total, hits, accuracy };
  };

  const formatLastUpdate = () => {
    if (!lastUpdate) return "Nunca";
    const now = new Date();
    const diff = Math.floor((now - lastUpdate) / 1000);
    if (diff < 5) return "Agora mesmo";
    if (diff < 60) return `${diff}s atrás`;
    return lastUpdate.toLocaleTimeString("pt-BR");
  };

  const statsML = calculateStats('is_hit_ml');
  const statsP2 = calculateStats('is_hit_p2');
  const statsP3 = calculateStats('is_hit_p3');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <Toaster position="top-right" richColors />
      
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center justify-center gap-3">
            <span className="text-5xl">🎰</span>
            Analisador de Roleta - 3 Análises
          </h1>
          <p className="text-gray-400 text-lg">ML + P2 + P3 - Comparação em Tempo Real</p>
          
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
                    Adicione números via URL: {BACKEND_URL}/api/roulette/add-number/NÚMERO
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
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

        {/* Suggestions Summary */}
        {suggestions && history.length > 0 && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Sugestões Atuais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-blue-900/20 border border-blue-600/30 rounded-lg">
                  <p className="text-blue-300 font-semibold mb-1">ML (Aprendizado de Máquina)</p>
                  <p className="text-gray-300 text-sm">
                    {history[history.length - 1]?.suggestions_ml?.join(", ") || "Aguardando..."}
                  </p>
                </div>
                <div className="p-3 bg-purple-900/20 border border-purple-600/30 rounded-lg">
                  <p className="text-purple-300 font-semibold mb-1">P2 (Grupo Fixo)</p>
                  <p className="text-gray-300 text-sm">
                    0, 1, 2, 5, 6, 8, 9, 10, 12, 13, 14, 16, 17, 19, 20, 23, 24, 26, 27, 28, 30, 31, 32, 34, 35
                  </p>
                </div>
                <div className="p-3 bg-green-900/20 border border-green-600/30 rounded-lg">
                  <p className="text-green-300 font-semibold mb-1">P3 (Grupo Fixo)</p>
                  <p className="text-gray-300 text-sm">
                    0, 3, 4, 5, 6, 9, 11, 13, 14, 15, 18, 20, 21, 23, 24, 25, 28, 29, 30, 33, 34, 35
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 3 History Tables Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* ML Table */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-blue-400">ML - Machine Learning</CardTitle>
              <CardDescription className="text-gray-400">
                Taxa: {statsML.accuracy}% ({statsML.hits}/{statsML.total})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="history-table-ml">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-2 text-gray-300 font-semibold">#</th>
                      <th className="text-left py-2 px-2 text-gray-300 font-semibold">Nº</th>
                      <th className="text-left py-2 px-2 text-gray-300 font-semibold">Sugestões Anteriores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-gray-400 text-xs">
                          Nenhum número ainda
                        </td>
                      </tr>
                    ) : (
                      [...history].reverse().map((item, idx) => {
                        const isHit = item.is_hit_ml;
                        const rowNum = history.length - idx;
                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-gray-700 ${isHit ? "bg-green-900/30" : ""}`}
                            data-testid={`history-row-ml-${isHit ? 'hit' : 'miss'}`}
                          >
                            <td className="py-2 px-2 text-gray-400 text-xs">{rowNum}</td>
                            <td className="py-2 px-2">
                              <div className={`${getNumberColor(item.number)} text-white px-2 py-0.5 rounded-full text-xs font-bold inline-block`}>
                                {item.number}
                              </div>
                            </td>
                            <td className="py-2 px-2 text-gray-300 text-xs">
                              {rowNum === history.length ? "N/A" : 
                                history[history.length - idx].suggestions_ml?.join(", ") || "-"}
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

          {/* P2 Table */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-purple-400">P2 - Grupo Fixo</CardTitle>
              <CardDescription className="text-gray-400">
                Taxa: {statsP2.accuracy}% ({statsP2.hits}/{statsP2.total})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="history-table-p2">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-2 text-gray-300 font-semibold">#</th>
                      <th className="text-left py-2 px-2 text-gray-300 font-semibold">Nº</th>
                      <th className="text-left py-2 px-2 text-gray-300 font-semibold">Sugestões Anteriores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-gray-400 text-xs">
                          Nenhum número ainda
                        </td>
                      </tr>
                    ) : (
                      [...history].reverse().map((item, idx) => {
                        const isHit = item.is_hit_p2;
                        const rowNum = history.length - idx;
                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-gray-700 ${isHit ? "bg-green-900/30" : ""}`}
                            data-testid={`history-row-p2-${isHit ? 'hit' : 'miss'}`}
                          >
                            <td className="py-2 px-2 text-gray-400 text-xs">{rowNum}</td>
                            <td className="py-2 px-2">
                              <div className={`${getNumberColor(item.number)} text-white px-2 py-0.5 rounded-full text-xs font-bold inline-block`}>
                                {item.number}
                              </div>
                            </td>
                            <td className="py-2 px-2 text-gray-300 text-xs">
                              {rowNum === history.length ? "N/A" : 
                                history[history.length - idx].suggestions_p2?.join(", ") || "-"}
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

          {/* P3 Table */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-green-400">P3 - Grupo Fixo</CardTitle>
              <CardDescription className="text-gray-400">
                Taxa: {statsP3.accuracy}% ({statsP3.hits}/{statsP3.total})
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" data-testid="history-table-p3">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 px-2 text-gray-300 font-semibold">#</th>
                      <th className="text-left py-2 px-2 text-gray-300 font-semibold">Nº</th>
                      <th className="text-left py-2 px-2 text-gray-300 font-semibold">Sugestões Anteriores</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="text-center py-4 text-gray-400 text-xs">
                          Nenhum número ainda
                        </td>
                      </tr>
                    ) : (
                      [...history].reverse().map((item, idx) => {
                        const isHit = item.is_hit_p3;
                        const rowNum = history.length - idx;
                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-gray-700 ${isHit ? "bg-green-900/30" : ""}`}
                            data-testid={`history-row-p3-${isHit ? 'hit' : 'miss'}`}
                          >
                            <td className="py-2 px-2 text-gray-400 text-xs">{rowNum}</td>
                            <td className="py-2 px-2">
                              <div className={`${getNumberColor(item.number)} text-white px-2 py-0.5 rounded-full text-xs font-bold inline-block`}>
                                {item.number}
                              </div>
                            </td>
                            <td className="py-2 px-2 text-gray-300 text-xs">
                              {rowNum === history.length ? "N/A" : 
                                history[history.length - idx].suggestions_p3?.join(", ") || "-"}
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
    </div>
  );
}

export default App;
