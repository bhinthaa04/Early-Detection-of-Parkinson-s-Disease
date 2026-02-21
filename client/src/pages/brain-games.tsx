import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Target, Timer, Trophy, RotateCcw, ArrowLeft,
  Brain, Zap, Eye, Hand, Activity
} from "lucide-react";
import { useLocation } from "wouter";

interface GameStats {
  score: number;
  time: number;
  accuracy: number;
  level: number;
}

const games = [
  {
    id: 'aim-trainer',
    name: 'Aim Trainer',
    description: 'Click targets as fast as possible',
    icon: Target,
    color: 'bg-red-500'
  },
  {
    id: 'reaction-time',
    name: 'Reaction Time',
    description: 'Test your reflexes',
    icon: Zap,
    color: 'bg-yellow-500'
  },
  {
    id: 'memory',
    name: 'Memory Game',
    description: 'Remember the sequence',
    icon: Brain,
    color: 'bg-purple-500'
  }
];

export default function BrainGames() {
  const [, setLocation] = useLocation();
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'finished'>('menu');
  const [stats, setStats] = useState<GameStats>({ score: 0, time: 0, accuracy: 0, level: 1 });
  const [timeLeft, setTimeLeft] = useState(30);
  const [targets, setTargets] = useState<Array<{ id: number; x: number; y: number; size: number }>>([]);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      endGame();
    }
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
    };
  }, [gameState, timeLeft]);

  const startGame = (gameId: string) => {
    setSelectedGame(gameId);
    setGameState('playing');
    setTimeLeft(30);
    setStats({ score: 0, time: 0, accuracy: 0, level: 1 });
    setHits(0);
    setMisses(0);

    if (gameId === 'aim-trainer') {
      spawnTarget();
    }
  };

  const spawnTarget = () => {
    if (!gameAreaRef.current) return;

    const rect = gameAreaRef.current.getBoundingClientRect();
    const newTarget = {
      id: Date.now(),
      x: Math.random() * (rect.width - 60) + 30,
      y: Math.random() * (rect.height - 60) + 30,
      size: Math.max(30, 60 - stats.level * 5)
    };

    setTargets([newTarget]);
  };

  const handleTargetClick = (targetId: number) => {
    setHits(hits + 1);
    setStats(prev => ({
      ...prev,
      score: prev.score + 10 * prev.level,
      accuracy: ((hits + 1) / (hits + misses + 1)) * 100
    }));

    setTargets([]);
    setTimeout(spawnTarget, 500);
  };

  const handleMiss = () => {
    setMisses(misses + 1);
    setStats(prev => ({
      ...prev,
      accuracy: (hits / (hits + misses + 1)) * 100
    }));
  };

  const endGame = () => {
    setGameState('finished');
    setStats(prev => ({
      ...prev,
      time: 30 - timeLeft,
      accuracy: hits > 0 ? (hits / (hits + misses)) * 100 : 0
    }));
  };

  const resetGame = () => {
    setGameState('menu');
    setSelectedGame(null);
    setTimeLeft(30);
    setTargets([]);
    setHits(0);
    setMisses(0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>

          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary rounded-xl text-black">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brain Games</h1>
              <p className="text-gray-600">Exercise your mind with fun coordination games</p>
            </div>
          </div>
        </motion.div>

        {gameState === 'menu' && (
          <div className="grid md:grid-cols-3 gap-6">
            {games.map((game) => (
              <motion.div
                key={game.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => startGame(game.id)}
                >
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 ${game.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <game.icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{game.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-4">{game.description}</p>
                    <Button className="w-full">Play Now</Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {gameState === 'playing' && selectedGame === 'aim-trainer' && (
          <div className="grid lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      Aim Trainer - Level {stats.level}
                    </CardTitle>
                    <Button variant="outline" onClick={resetGame}>
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Pause
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4" />
                      <span className="font-semibold">{timeLeft}s</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      <span className="font-semibold">{stats.score}</span>
                    </div>
                  </div>

                  <div
                    ref={gameAreaRef}
                    className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
                    onClick={handleMiss}
                  >
                    {targets.map((target) => (
                      <motion.div
                        key={target.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute bg-red-500 rounded-full cursor-pointer hover:bg-red-600 transition-colors"
                        style={{
                          left: target.x - target.size / 2,
                          top: target.y - target.size / 2,
                          width: target.size,
                          height: target.size,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTargetClick(target.id);
                        }}
                      />
                    ))}
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Hits</p>
                      <p className="text-2xl font-bold text-green-600">{hits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Misses</p>
                      <p className="text-2xl font-bold text-red-600">{misses}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Accuracy</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.accuracy.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Game Stats</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Time Left</span>
                      <span>{timeLeft}s</span>
                    </div>
                    <Progress value={(30 - timeLeft) / 30 * 100} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <Trophy className="w-6 h-6 mx-auto mb-1 text-blue-600" />
                      <p className="text-xs text-gray-600">Score</p>
                      <p className="text-lg font-bold">{stats.score}</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <Target className="w-6 h-6 mx-auto mb-1 text-green-600" />
                      <p className="text-xs text-gray-600">Accuracy</p>
                      <p className="text-lg font-bold">{stats.accuracy.toFixed(1)}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Benefits</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <Hand className="w-4 h-4 text-primary" />
                      Improves hand-eye coordination
                    </li>
                    <li className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      Enhances cognitive function
                    </li>
                    <li className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-primary" />
                      Supports motor skill development
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {gameState === 'finished' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  Game Complete!
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Trophy className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">Final Score</p>
                    <p className="text-2xl font-bold">{stats.score}</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Target className="w-6 h-6 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-gray-600">Accuracy</p>
                    <p className="text-2xl font-bold">{stats.accuracy.toFixed(1)}%</p>
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <Timer className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                  <p className="text-sm text-gray-600">Time Played</p>
                  <p className="text-2xl font-bold">{stats.time}s</p>
                </div>

                <div className="flex gap-3">
                  <Button onClick={() => startGame(selectedGame!)} className="flex-1">
                    Play Again
                  </Button>
                  <Button variant="outline" onClick={resetGame} className="flex-1">
                    Main Menu
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
