"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Printer, Download, Home, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getRandomWord, CategoryName } from "@/lib/spy-game-data";
import QRCode from "qrcode";

interface GameConfig {
  numPlayers: number;
  numSpies: number;
  timerMinutes: number;
  category: CategoryName;
  playerNames: string[];
}

interface PlayerCard {
  name: string;
  isSpy: boolean;
  qrData: string;
  word?: string;
}

export default function SpyGamePrint() {
  const router = useRouter();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [cards, setCards] = useState<PlayerCard[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Load game config and generate cards
  useEffect(() => {
    const configStr = localStorage.getItem("spyGameConfig");
    if (!configStr) {
      router.push("/party/spy-game/setup");
      return;
    }

    const config: GameConfig = JSON.parse(configStr);
    setGameConfig(config);

    // Generate secret word
    const word = getRandomWord(config.category);

    // Assign roles randomly
    const spyIndices = new Set<number>();
    while (spyIndices.size < config.numSpies) {
      const randomIndex = Math.floor(Math.random() * config.numPlayers);
      spyIndices.add(randomIndex);
    }

    // Create cards
    const playerCards: PlayerCard[] = config.playerNames.map((name, index) => {
      const isSpy = spyIndices.has(index);
      return {
        name,
        isSpy,
        qrData: isSpy ? "YOU ARE A SPY" : `WORD: ${word}`,
        word: isSpy ? undefined : word,
      };
    });

    setCards(playerCards);
  }, [router]);

  // Generate printable image strip
  const generatePrintableStrip = async () => {
    if (!canvasRef.current || cards.length === 0) return;

    setIsGenerating(true);

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context not available");

      // Thermal printer standard width: 384px
      const cardWidth = 384;
      const cardHeight = 500;
      const totalHeight = cardHeight * cards.length;

      // Set canvas dimensions
      canvas.width = cardWidth;
      canvas.height = totalHeight;

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cardWidth, totalHeight);

      // Generate each card
      for (let i = 0; i < cards.length; i++) {
        const card = cards[i];
        const yOffset = i * cardHeight;

        // Card background
        ctx.fillStyle = "#f8f9fa";
        ctx.fillRect(0, yOffset, cardWidth, cardHeight);

        // Border
        ctx.strokeStyle = "#000000";
        ctx.lineWidth = 2;
        ctx.strokeRect(5, yOffset + 5, cardWidth - 10, cardHeight - 10);

        // Player name (top)
        ctx.fillStyle = "#000000";
        ctx.font = "bold 28px Arial";
        ctx.textAlign = "center";
        ctx.fillText(`PLAYER: ${card.name}`, cardWidth / 2, yOffset + 50);

        // Separator line
        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(20, yOffset + 70);
        ctx.lineTo(cardWidth - 20, yOffset + 70);
        ctx.stroke();

        // Generate QR Code
        const qrCodeDataUrl = await QRCode.toDataURL(card.qrData, {
          width: 280,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });

        // Draw QR Code
        const qrImage = new Image();
        await new Promise<void>((resolve) => {
          qrImage.onload = () => {
            const qrSize = 280;
            const qrX = (cardWidth - qrSize) / 2;
            const qrY = yOffset + 90;
            ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);
            resolve();
          };
          qrImage.src = qrCodeDataUrl;
        });

        // Bottom text
        ctx.font = "bold 20px Arial";
        ctx.fillStyle = "#dc2626";
        ctx.fillText("⚠️ DON'T SCAN UNTIL", cardWidth / 2, yOffset + 410);
        ctx.fillText("GAME STARTS!", cardWidth / 2, yOffset + 440);

        // Small instruction
        ctx.font = "14px Arial";
        ctx.fillStyle = "#666666";
        ctx.fillText("Scan with camera to reveal your role", cardWidth / 2, yOffset + 475);
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL("image/png");
      setImageUrl(dataUrl);

      toast({
        title: "✅ Cards Generated!",
        description: "Ready to download or print",
      });
    } catch (error) {
      console.error("Error generating cards:", error);
      toast({
        title: "Error",
        description: "Failed to generate cards",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Download image
  const handleDownload = () => {
    if (!imageUrl) return;

    const link = document.createElement("a");
    link.download = `spy-game-cards-${Date.now()}.png`;
    link.href = imageUrl;
    link.click();

    toast({
      title: "📥 Downloading",
      description: "Cards saved to your device",
    });
  };

  // Share to print app
  const handleShare = async () => {
    if (!imageUrl) return;

    try {
      // Convert data URL to Blob
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "spy-game-cards.png", { type: "image/png" });

      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: "Spy Game Cards",
          text: "Print these cards for your spy game!",
          files: [file],
        });

        toast({
          title: "📤 Shared!",
          description: "Open in FunPrint or another printing app",
        });
      } else {
        // Fallback: just download
        handleDownload();
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast({
        title: "Error",
        description: "Could not share. Try downloading instead.",
        variant: "destructive",
      });
    }
  };

  if (!gameConfig) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">🖨️ Print Cards</h1>
            <p className="text-purple-200">Physical gameplay mode</p>
          </div>
          <Button
            onClick={() => router.push("/party/spy-game/setup")}
            variant="outline"
            size="icon"
            className="bg-slate-800 border-slate-600 text-white"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-3">📋 How It Works</h3>
          <ol className="space-y-2 text-slate-300">
            <li>1️⃣ Click "Generate Cards" to create QR codes for all players</li>
            <li>2️⃣ Download the image strip (384px wide for thermal printers)</li>
            <li>3️⃣ Share to your "FunPrint" app or print directly</li>
            <li>4️⃣ Cut the paper into individual cards</li>
            <li>5️⃣ Each player draws a card and scans it to see their role</li>
            <li>6️⃣ No phone passing required! 🎉</li>
          </ol>
        </Card>

        {/* Player Preview */}
        <Card className="bg-slate-800/50 border-slate-700 p-6 mb-6">
          <h3 className="text-xl font-semibold text-white mb-3">Players</h3>
          <div className="space-y-2">
            {cards.map((card, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-700 p-3 rounded-lg"
              >
                <span className="text-white font-medium">{card.name}</span>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    card.isSpy
                      ? "bg-red-600 text-white"
                      : "bg-green-600 text-white"
                  }`}
                >
                  {card.isSpy ? "🕵️ Spy" : "✅ Civilian"}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Generate Button */}
        {!imageUrl && (
          <Button
            onClick={generatePrintableStrip}
            disabled={isGenerating}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white h-16 text-xl font-bold"
          >
            <Printer className="w-6 h-6 mr-2" />
            {isGenerating ? "Generating..." : "Generate Cards"}
          </Button>
        )}

        {/* Action Buttons (after generation) */}
        {imageUrl && (
          <div className="space-y-4">
            <div className="flex gap-4">
              <Button
                onClick={handleDownload}
                size="lg"
                className="flex-1 bg-green-600 hover:bg-green-700 text-white h-16"
              >
                <Download className="w-6 h-6 mr-2" />
                Download
              </Button>
              <Button
                onClick={handleShare}
                size="lg"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-16"
              >
                <Share2 className="w-6 h-6 mr-2" />
                Share to Print
              </Button>
            </div>

            <Button
              onClick={generatePrintableStrip}
              variant="outline"
              className="w-full bg-slate-800 border-slate-600 text-white hover:bg-slate-700"
            >
              Regenerate Cards
            </Button>
          </div>
        )}

        {/* Preview */}
        {imageUrl && (
          <Card className="bg-slate-800/50 border-slate-700 p-6 mt-6">
            <h3 className="text-xl font-semibold text-white mb-3">Preview</h3>
            <div className="bg-white rounded-lg p-4 overflow-auto max-h-96">
              <img
                src={imageUrl}
                alt="Generated cards"
                className="w-full"
              />
            </div>
          </Card>
        )}

        {/* Hidden Canvas */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Instructions */}
        <div className="mt-6 text-center text-purple-200 text-sm space-y-1">
          <p>📏 Print size: 384px width (thermal printer standard)</p>
          <p>✂️ Cut along the borders to separate cards</p>
          <p>📱 Players scan QR codes with phone camera</p>
          <p>🎮 Start the game when everyone has scanned!</p>
        </div>
      </div>
    </div>
  );
}
