import { useEffect, useRef, useState } from 'react';
import './ping-pong.css';

const GameInstructions = () => (
  <div className="instructions">
    <h2>How to Play</h2>
    <ul>
      <li>Use ← → arrow keys to move the paddle</li>
      <li>Keep the ball bouncing to score points</li>
      <li>Ball changes direction based on where it hits the paddle</li>
      <li>Ball gradually slows down due to friction</li>
      <li>Game ends if ball hits bottom or stops moving</li>
    </ul>
  </div>
);

const PingPong = () => {
  const canvasRef = useRef(null);
  const [showPlayAgain, setShowPlayAgain] = useState(false);
  const gameRef = useRef({
    paddle: {
      width: 100,
      height: 10,
      x: 350,
      y: 580,
      speed: 8,
      dx: 0,
    },
    ball: {
      x: 400,
      y: 300,
      radius: 8,
      speed: 6,
      dx: 6,
      dy: 6,
      friction: 0.99,
      minSpeed: 0.5,
    },
    score: 0,
    isGameOver: false,
    showPlayAgain: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    const game = gameRef.current;

    // Handle keyboard controls
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        game.paddle.dx = -game.paddle.speed;
      }
      if (e.key === 'ArrowRight') {
        game.paddle.dx = game.paddle.speed;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        game.paddle.dx = 0;
      }
    };

    // Draw game objects
    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw paddle
      ctx.fillStyle = '#fff';
      ctx.fillRect(
        game.paddle.x,
        game.paddle.y,
        game.paddle.width,
        game.paddle.height
      );

      // Draw ball
      ctx.beginPath();
      ctx.arc(game.ball.x, game.ball.y, game.ball.radius, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
      ctx.closePath();

      // Draw score
      ctx.font = '24px Arial';
      ctx.fillStyle = '#fff';
      ctx.fillText(`Score: ${game.score}`, 20, 30);

      // Draw game over or ball stopped message
      if (game.isGameOver) {
        const currentSpeed = Math.sqrt(
          game.ball.dx * game.ball.dx + game.ball.dy * game.ball.dy
        );

        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';

        const message =
          currentSpeed < game.ball.minSpeed ? 'Ball Stopped!' : 'Game Over!';

        ctx.fillText(message, canvas.width / 2 - 120, canvas.height / 2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText(
          `Final Score: ${game.score}`,
          canvas.width / 2 - 70,
          canvas.height / 2
        );

        setShowPlayAgain(true);
      }
    };

    // Update game state
    const update = () => {
      if (game.isGameOver) return;

      // Move paddle
      game.paddle.x += game.paddle.dx;

      // Keep paddle within bounds
      if (game.paddle.x < 0) game.paddle.x = 0;
      if (game.paddle.x + game.paddle.width > canvas.width) {
        game.paddle.x = canvas.width - game.paddle.width;
      }

      // Apply friction to ball movement
      game.ball.dx *= game.ball.friction;
      game.ball.dy *= game.ball.friction;

      // Move ball with current velocity
      game.ball.x += game.ball.dx;
      game.ball.y += game.ball.dy;

      // Check if ball has slowed down enough to stop
      const currentSpeed = Math.sqrt(
        game.ball.dx * game.ball.dx + game.ball.dy * game.ball.dy
      );
      if (currentSpeed < game.ball.minSpeed) {
        game.isGameOver = true;
        return;
      }

      // Wall collision detection
      if (
        game.ball.x + game.ball.radius > canvas.width ||
        game.ball.x - game.ball.radius < 0
      ) {
        game.ball.dx *= -1;
      }
      if (game.ball.y - game.ball.radius < 0) {
        game.ball.dy *= -1;
      }

      // Paddle collision detection with improved bounce physics
      if (
        game.ball.y + game.ball.radius > game.paddle.y &&
        game.ball.x > game.paddle.x &&
        game.ball.x < game.paddle.x + game.paddle.width
      ) {
        // Calculate relative position of ball hit on paddle (between -1 and 1)
        const hitPosition =
          (game.ball.x - (game.paddle.x + game.paddle.width / 2)) /
          (game.paddle.width / 2);

        // Change angle based on where the ball hits the paddle
        game.ball.dx = hitPosition * game.ball.speed * 1.5; // Multiply by 1.5 for more pronounced angle
        game.ball.dy = -Math.abs(game.ball.dy); // Always bounce up

        // Add a slight boost to counteract friction
        const boostFactor = 1.1;
        game.ball.dx *= boostFactor;
        game.ball.dy *= boostFactor;

        game.score += 1;
      }

      // Game over if ball hits bottom
      if (game.ball.y + game.ball.radius > canvas.height) {
        game.isGameOver = true;
      }
    };

    // Game loop
    const gameLoop = () => {
      update();
      draw();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    // Start game
    canvas.width = 800;
    canvas.height = 600;
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    gameLoop();

    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const resetGame = () => {
    const game = gameRef.current;
    game.ball.x = 400;
    game.ball.y = 300;
    game.ball.speed = 6;
    game.ball.dx = 6;
    game.ball.dy = 6;
    game.paddle.x = 350;
    game.score = 0;
    game.isGameOver = false;
    setShowPlayAgain(false);
  };

  return (
    <div className="ping-pong-container">
      <GameInstructions />
      <div className="ping-pong">
        <canvas ref={canvasRef} />
        {showPlayAgain && (
          <button className="play-again-button" onClick={resetGame}>
            Play Again
          </button>
        )}
      </div>
    </div>
  );
};

export default PingPong;
