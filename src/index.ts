// src/index.ts

type Point = {
  x: number;
  y: number;
};

//아래도 유효한 표현
//type Point = {x: number, y: number};

function logPoint(point: Point) {
  console.log(`x: ${point.x}, y: ${point.y}`);
}

logPoint({ x: 100, y: 200 });
