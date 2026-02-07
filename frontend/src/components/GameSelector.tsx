import React, { useState, useEffect } from 'react';
import { Game, fetchGames } from '@/api/websocket';

interface GameSelectorProps {
  onGameSelect: (game: Game) => void;
  currentGameId?: string;
}

const GameSelector: React.FC<GameSelectorProps> = ({ onGameSelect, currentGameId }) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGames = async () => {
      try {
        setLoading(true);
        const gamesData = await fetchGames();
        setGames(gamesData);
        setError(null);
      } catch (err) {
        setError('Error al cargar los partidos');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  if (loading) {
    return <div className="text-slate-400 text-sm">Cargando partidos...</div>;
  }

  if (error) {
    return <div className="text-red-400 text-sm">{error}</div>;
  }

  return (
    <select
      value={currentGameId || ''}
      onChange={(e) => {
        const game = games.find((g) => g.id === e.target.value);
        if (game) onGameSelect(game);
      }}
      className="px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white text-sm hover:border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
    >
      <option value="">Selecciona un partido...</option>
      {games.map((game) => (
        <option key={game.id} value={game.id}>
          {game.homeTeam} vs {game.awayTeam} ({game.id})
        </option>
      ))}
    </select>
  );
};

export default GameSelector;
