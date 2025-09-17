import React, { useEffect, useRef, useState } from "react";

export default function PaddleBallGame() {
  const canvasRef = useRef(null);
  const animationIdRef = useRef(null);

  const width = 600;
  const height = 400;

  const scoreRef = useRef(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const ball = useRef({
    x: width / 2,
    y: height / 2,
    dx: 2,
    dy: -2,
    radius: 10,
  });

  const paddle = useRef({
    x: (width - 100) / 2,
    y: height - 20,
    width: 100,
    height: 12,
    speed: 6,
    movingLeft: false,
    movingRight: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function clear() {
      ctx.clearRect(0, 0, width, height);
    }
    function drawBall() {
      const b = ball.current;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.closePath();
    }
    function drawPaddle() {
      const p = paddle.current;
      ctx.fillStyle = "blue";
      ctx.fillRect(p.x, p.y, p.width, p.height);
    }
    function drawScore() {
      ctx.font = "20px Arial";
      ctx.fillStyle = "black";
      ctx.textAlign = "center";
      ctx.fillText(`Score: ${scoreRef.current}`, width / 2, 30);
    }
    function drawGameOver() {
      ctx.font = "48px Arial";
      ctx.fillStyle = "red";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", width / 2, height / 2 - 10);
      ctx.font = "22px Arial";
      ctx.fillStyle = "black";
      ctx.fillText(`Final Score: ${scoreRef.current}`, width / 2, height / 2 + 30);
    }

    function update() {
      clear();

      if (gameOver) {
        drawGameOver();
        cancelAnimationFrame(animationIdRef.current);
        return;
      }

      if (paddle.current.movingLeft) {
        paddle.current.x = Math.max(0, paddle.current.x - paddle.current.speed);
      } else if (paddle.current.movingRight) {
        paddle.current.x = Math.min(width - paddle.current.width, paddle.current.x + paddle.current.speed);
      }

      ball.current.x += ball.current.dx;
      ball.current.y += ball.current.dy;

      if (ball.current.x - ball.current.radius < 0) {
        ball.current.x = ball.current.radius;
        ball.current.dx *= -1;
      } else if (ball.current.x + ball.current.radius > width) {
        ball.current.x = width - ball.current.radius;
        ball.current.dx *= -1;
      }
      if (ball.current.y - ball.current.radius < 0) {
        ball.current.y = ball.current.radius;
        ball.current.dy *= -1;
      }

      const p = paddle.current;
      const b = ball.current;
      const ballBottom = b.y + b.radius;
      const paddleTop = p.y;
      if (b.dy > 0 && ballBottom >= paddleTop && b.x >= p.x && b.x <= p.x + p.width) {
        b.y = paddleTop - b.radius - 0.5;
        b.dy = -Math.abs(b.dy);
        scoreRef.current += 1;
        setScore(scoreRef.current);
      }

      drawBall();
      drawPaddle();
      drawScore();

      if (b.y - b.radius > height) {
        setGameOver(true);
      } else {
        animationIdRef.current = requestAnimationFrame(update);
      }
    }

    animationIdRef.current = requestAnimationFrame(update);

    function keyDownHandler(e) {
      if (e.key === "ArrowLeft" || e.key === "Left") {
        paddle.current.movingLeft = true;
      } else if (e.key === "ArrowRight" || e.key === "Right") {
        paddle.current.movingRight = true;
      }
    }
    function keyUpHandler(e) {
      if (e.key === "ArrowLeft" || e.key === "Left") {
        paddle.current.movingLeft = false;
      } else if (e.key === "ArrowRight" || e.key === "Right") {
        paddle.current.movingRight = false;
      }
    }
    function mouseMoveHandler(e) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      paddle.current.x = Math.min(Math.max(0, mouseX - paddle.current.width / 2), width - paddle.current.width);
    }

    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
    canvas.addEventListener("mousemove", mouseMoveHandler);

    return () => {
      cancelAnimationFrame(animationIdRef.current);
      document.removeEventListener("keydown", keyDownHandler);
      document.removeEventListener("keyup", keyUpHandler);
      canvas.removeEventListener("mousemove", mouseMoveHandler);
    };
  }, [gameOver]);

  function restart() {
    ball.current = { x: width / 2, y: height / 2, dx: 2, dy: -2, radius: 10 };
    paddle.current.x = (width - paddle.current.width) / 2;
    scoreRef.current = 0;
    setScore(0);
    setGameOver(false);
  }

  return (
    <div style={{ textAlign: "center", paddingTop: 12 }}>
      <h2 style={{ marginBottom: 10 }}>🏓 Paddle Ball Game</h2>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          border: "2px solid black",
          background: "#f9f9f9",
          display: "block",
          margin: "0 auto",
        }}
      />
      <div style={{ marginTop: 10 }}>
        <strong>Score: </strong>
        {score}
      </div>
      {gameOver && (
        <div style={{ marginTop: 10 }}>
          <button onClick={restart}>Restart</button>
        </div>
      )}
    </div>
  );
}
