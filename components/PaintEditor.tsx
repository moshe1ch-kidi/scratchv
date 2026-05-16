import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { Sprite } from '../types';

// --- Type Definitions ---
interface ShapeBase {
  id: string;
  fill: string;
  stroke: string;
  strokeWidth: number;
  transform?: string;
}

interface RectShape extends ShapeBase {
  type: 'rect';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CircleShape extends ShapeBase {
  type: 'circle';
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}

interface LineShape extends ShapeBase {
  type: 'line';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

interface PathShape extends ShapeBase {
  type: 'path';
  d: string;
}

interface TriangleShape extends ShapeBase {
  type: 'triangle';
  x: number;
  y: number;
  width: number;
  height: number;
}

interface TextShape extends ShapeBase {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontSize: number;
  fontFamily: string;
}

type Shape = RectShape | CircleShape | LineShape | PathShape | TriangleShape | TextShape;
type Tool = 'select' | 'rect' | 'circle' | 'line' | 'freehand' | 'triangle' | 'text';


// --- Shape Data for Gallery ---
const SHAPES_DATA = [
    // New shapes from publicdomainvectors.org
    { name: 'Banana', viewBox: '0 0 500 500', path: 'M 235.34,31.24 C 218.34,51.08 200.25,71.22 179.31,93.58 135.9,140.23 83.08,189.75 42.1,250.05 32.48,264.49 25.13,280.44 20.4,296.88 17.03,308.84 15.11,321.2 15.68,333.61 17.2,365.92 34.61,395.27 61.64,414.75 80.61,428.2 103.8,435.59 128.05,435.85 244.75,436.91 323.51,379.77 375.44,307.96 422.31,242.34 445.87,171.72 447.8,99.93 448.21,80.12 444.6,60.59 436.72,42.58 416.79,14.61 381.08,5.43 345.56,8.23 318.5,12.78 293.18,24.4 265.41,41.43 252.89,37.89 243.68,34.34 235.34,31.24 Z' },
    { name: 'Scissors', viewBox: '0 0 64 64', path: 'M62.4,50.2l-22-22l22-22c1.3-1.3,1.3-3.4,0-4.7l-1-1c-1.3-1.3-3.4-1.3-4.7,0L34.6,22.6l-8.3-8.3c-2.7-2.7-7-2.7-9.7,0 l-2.3,2.3c-2.7,2.7-2.7,7,0,9.7l13.7,13.7l-13.7,13.7c-2.7,2.7-2.7,7,0,9.7l2.3,2.3c2.7,2.7,7,2.7,9.7,0l8.3-8.3l22.1,22.1 c1.3,1.3,3.4,1.3,4.7,0l1,1C63.7,53.6,63.7,51.5,62.4,50.2z M21.9,49.8c-1,1-2.7,1-3.7,0l-2.3-2.3c-1-1-1-2.7,0-3.7l11-11l6,6 L21.9,49.8z M28,32l-6-6l11-11c1-1,2.7-1,3.7,0l2.3,2.3c1,1,1,2.7,0,3.7L28,32z' },
    { name: 'Antique Key', viewBox: '0 0 100 100', path: 'm 83.8,16.2 c -12,-12 -31.4,-12 -43.4,0 -9.4,9.4 -11.7,23.1 -6.8,34.2 L 14.2,69.8 10,74.1 10,81.4 17.3,81.4 17.3,85.6 21.4,85.6 21.4,81.4 25.6,81.4 25.6,89.9 30.2,89.9 30.2,69.8 34.3,65.6 53.7,46.2 c 11,4.9 24.8,2.6 34.2,-6.8 12,-12 12,-31.5 0,-43.5 z m -8.5,35 c -9.4,9.4 -24.6,9.4 -34,0 -9.4,-9.4 -9.4,-24.6 0,-34 9.4,-9.4 24.6,-9.4 34,0 9.4,9.4 9.4,24.6 0,34 z' },
    
    // Existing shapes
    { name: 'Heart', viewBox: '0 0 24 24', path: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' },
    { name: 'Star', viewBox: '0 0 24 24', path: 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' },
    { name: 'Sun', viewBox: '0 0 24 24', path: 'M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zm-8-9c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1V4zm0 16c0-.55.45-1 1-1s1 .45 1 1v2c0 .55-.45 1-1 1s-1-.45-1-1v-2zM4.22 5.64l1.42 1.42c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L5.64 4.22c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.42zm14.14 14.14l1.42 1.42c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41l-1.42-1.42c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41zM19.78 5.64c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.42 1.42c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.42-1.42zM5.64 19.78c.39-.39.39-1.02 0-1.41-.39-.39-1.02-.39-1.41 0l-1.42 1.42c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.42-1.42z' },
    { name: 'Cloud', viewBox: '0 0 24 24', path: 'M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z' },
    { name: 'Lightning', viewBox: '0 0 24 24', path: 'M7 2v11h3v9l7-12h-4l4-8z' },
    { name: 'Moon', viewBox: '0 0 24 24', path: 'M21.93 15.28c-.28.14-2.42.96-4.57.1-1.89-.73-3.07-2.3-3.4-3.83-.33-1.53.03-3.17.65-4.52.19-.42.01-.93-.4-1.13-1.31-.63-2.82-.78-4.29-.42-2.07.51-3.79 2.08-4.67 4.1-1.34 3.07-.36 6.65 2.4 8.68 2.76 2.03 6.51 2.08 9.32.12.43-.3.53-.9.26-1.32z' },
    { name: 'House', viewBox: '0 0 24 24', path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z' },
    { name: 'Tree', viewBox: '0 0 24 24', path: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8h5zM4 22h16v-2H4v2zm10-14.59V10h-4V7.41L12 5.41l2 2z' },
    { name: 'Car', viewBox: '0 0 24 24', path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z' },
    { name: 'Person', viewBox: '0 0 24 24', path: 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' },
    { name: 'Flower', viewBox: '0 0 24 24', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z' },
    { name: 'Speech Bubble', viewBox: '0 0 24 24', path: 'M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z' },
    { name: 'Arrow Right', viewBox: '0 0 24 24', path: 'M10 17l5-5-5-5v10z' },
    { name: 'Triangle', viewBox: '0 0 24 24', path: 'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z' },
    { name: 'Diamond', viewBox: '0 0 24 24', path: 'M12.23 1.15L2.31 8.85a2.5 2.5 0 000 3.54l9.92 7.7a2.5 2.5 0 003.54 0l9.92-7.7a2.5 2.5 0 000-3.54L15.77 1.15a2.5 2.5 0 00-3.54 0z' },
    { name: 'Hexagon', viewBox: '0 0 24 24', path: 'M17.2 3H6.8l-5.2 9 5.2 9h10.4l5.2-9z' },
    { name: 'Fish', viewBox: '0 0 24 24', path: 'M21 9.9c-.1-.5-.4-.9-.8-1.2L12.7 3c-.5-.4-1.2-.4-1.7 0L4.3 8.3c-.6.5-1 1.3-1 2.1v3.2c0 .8.4 1.6 1 2.1l6.7 5.3c.5.4 1.2.4 1.7 0l7.5-6c.4-.3.6-.7.7-1.2l.1-3.5zM12 5.1l5.5 4.4L12 13.9 6.5 9.5 12 5.1z' },
    { name: 'Butterfly', viewBox: '0 0 24 24', path: 'M12 2c-3.31 0-6 2.69-6 6 0 2.24 1.24 4.2 3.01 5.2V17c0 .55.45 1 1 1h.5c.28 0 .5.22.5.5V22h2v-3.5c0-.28.22-.5.5-.5H14c.55 0 1-.45 1-1v-3.8c1.77-1 3.01-2.96 3.01-5.2 0-3.31-2.69-6-6-6zm-4 6c0-2.21 1.79-4 4-4s4 1.79 4 4H8z' },
    { name: 'Key', viewBox: '0 0 24 24', path: 'M12.65 10A5.5 5.5 0 107.15 4.5a5.5 5.5 0 005.5 5.5zm-5.5-9a3.5 3.5 0 110 7 3.5 3.5 0 010-7zm12.35 8.5L14 15v9h-2v-5l-4-4 1.5-1.5L14 18l5-5-1.5-1.5z' },
    { name: 'Stick Figure', viewBox: '0 0 24 24', path: 'M12 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM12 7c-1.93 0-3.5 1.57-3.5 3.5V13h1v6h1v-5h1v5h1v-6h1v-2.5C15.5 8.57 13.93 7 12 7z' },
    { name: 'Cat Face', viewBox: '0 0 24 24', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-3.5 7c.83 0 1.5.67 1.5 1.5S9.33 12 8.5 12 7 11.33 7 10.5 7.67 9 8.5 9zm7 0c.83 0 1.5.67 1.5 1.5S16.33 12 15.5 12 14 11.33 14 10.5 14.67 9 15.5 9zm-3.5 5c-1.66 0-3 1.34-3 3h6c0-1.66-1.34-3-3-3z' },
    { name: 'Dog Paw', viewBox: '0 0 24 24', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3 13.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-6 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3-4c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-4.5-3c-.83 0-1.5-.67-1.5-1.5S5.67 6 6.5 6s1.5.67 1.5 1.5S7.33 8.5 6.5 8.5zm11 0c-.83 0-1.5-.67-1.5-1.5S16.67 6 17.5 6s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z' },
    { name: 'Crown', viewBox: '0 0 24 24', path: 'M19.14,6.28,15.21,8.1,12,2,8.79,8.1,4.86,6.28,4,10.72l4.47,1.85-2.2,6.43,5.73-3.48,5.73,3.48-2.2-6.43L20,10.72Z' },
    { name: 'Ghost', viewBox: '0 0 24 24', path: 'M12,2A10,10,0,0,0,2,12v8a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V12A10,10,0,0,0,12,2Zm3.5,12A1.5,1.5,0,1,1,17,12.5,1.5,1.5,0,0,1,15.5,14Zm-7,0A1.5,1.5,0,1,1,10,12.5,1.5,1.5,0,0,1,8.5,14Z' },
    { name: 'Anchor', viewBox: '0 0 24 24', path: 'M12,2A4.5,4.5,0,0,0,7.5,6.5,4.5,4.5,0,0,0,12,11a4.5,4.5,0,0,0,4.5-4.5A4.5,4.5,0,0,0,12,2Zm0,7A2.5,2.5,0,1,1,14.5,6.5,2.5,2.5,0,0,1,12,9ZM20,11H17.27a8,8,0,0,0-10.54,0H4a2,2,0,0,0-2,2v3a1,1,0,0,0,1,1,3,3,0,0,1,6,0,1,1,0,0,0,1,1h4a1,1,0,0,0,1-1,3,3,0,0,1,6,0,1,1,0,0,0,1-1V13A2,2,0,0,0,20,11Z' },
    { name: 'Music Note', viewBox: '0 0 24 24', path: 'M17,3H7A2,2,0,0,0,5,5V15.35A3.5,3.5,0,1,0,8.5,18,3.44,3.44,0,0,0,12,15.39V7h5a1,1,0,0,0,0-2H12V5h5a1,1,0,0,0,0-2Z' },
    { name: 'Camera', viewBox: '0 0 24 24', path: 'M20,6H16.42L14.84,3.34A2,2,0,0,0,13.1,2H10.9A2,2,0,0,0,9.16,3.34L7.58,6H4A2,2,0,0,0,2,8V20a2,2,0,0,0,2,2H20a2,2,0,0,0,2-2V8A2,2,0,0,0,20,6ZM12,18a6,6,0,1,1,6-6A6,6,0,0,1,12,18Zm4-6a4,4,0,1,1-4-4A4,4,0,0,1,16,12Z' },
    { name: 'Lightbulb', viewBox: '0 0 24 24', path: 'M12,2A9,9,0,0,0,5.2,16.59V19a1,1,0,0,0,1,1H17.8a1,1,0,0,0,1-1V16.59A9,9,0,0,0,12,2Zm4.58,15H7.42a7,7,0,1,1,9.16,0ZM9,21a1,1,0,0,0,1,1h4a1,1,0,0,0,0-2H10A1,1,0,0,0,9,21Z' },
    { name: 'Airplane', viewBox: '0 0 24 24', path: 'M21.71,12.71,18,11.84V6.5a1.5,1.5,0,0,0-1.5-1.5h-1a1.5,1.5,0,0,0-1.5,1.5V9.45L9.69,3.41A1.5,1.5,0,0,0,8.21,3l-1,.5A1.5,1.5,0,0,0,6.5,5V10.7L3.43,8.42a1.5,1.5,0,0,0-2.14,2.14l4,4.25a1.5,1.5,0,0,0,1.16.48h8.05l4.28,3.75a1.5,1.5,0,0,0,2.14-2.14Z' },
    { name: 'Mountain', viewBox: '0 0 24 24', path: 'M16,6.04l-2.5,3.33L11,5,6,11.67V18H18V11.5Z' },
    { name: 'Puzzle Piece', viewBox: '0 0 24 24', path: 'M20.5,11H19V7.5a1,1,0,0,0-1-1H14V5.5a2.5,2.5,0,0,0-5,0V6.5H5a1,1,0,0,0-1,1V11H2.5a2.5,2.5,0,0,0,0,5H4v3.5a1,1,0,0,0,1,1H9V21.5a2.5,2.5,0,0,0,5,0V20.5h4a1,1,0,0,0,1-1V16h1.5a2.5,2.5,0,0,0,0-5Z' },
    { name: 'Shield', viewBox: '0 0 24 24', path: 'M12,2,4,5v6.09c0,5.05,3.41,9.76,8,10.91,4.59-1.15,8-5.86,8-10.91V5Z' },
    { name: 'Trophy', viewBox: '0 0 24 24', path: 'M20.5,2H3.5a1,1,0,0,0,0,2H5.32a9.49,9.49,0,0,0,1.69,4.43,8.5,8.5,0,0,0,3.61,3.25,1,1,0,0,0,1.13-.24L12,11.2l.25.24a1,1,0,0,0,1.13.24,8.5,8.5,0,0,0,3.61-3.25,9.49,9.49,0,0,0,1.69-4.43H20.5a1,1,0,0,0,0-2ZM12,10,9.5,8H14.5ZM7.14,6a7.48,7.48,0,0,1,9.72,0,1,1,0,0,0,1.27-1.5,9.5,9.5,0,0,0-12.26,0A1,1,0,1,0,7.14,6ZM14,14H10a1,1,0,0,0,0,2h4a1,1,0,0,0,0-2Zm-2,4a3,3,0,0,0-3,3,1,1,0,0,0,1,1h4a1,1,0,0,0,1-1A3,3,0,0,0,12,18Z' },
    { name: 'Umbrella', viewBox: '0 0 24 24', path: 'M20.12,10.26a1,1,0,0,0-1.21.09A7,7,0,0,1,5.09,10.35a1,1,0,1,0-1.3-1.51,9,9,0,0,0,16.55.2A1,1,0,0,0,20.12,10.26ZM12,13a1,1,0,0,0-1,1v5a2,2,0,0,0,4,0,1,1,0,0,0-2-2V14A1,1,0,0,0,12,13Z' },
    { name: 'Gift', viewBox: '0 0 24 24', path: 'M20,7.55V19a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V7.55a2,2,0,0,1,.51-1.33l7-5.46a1.14,1.14,0,0,1,1,0l7,5.46A2,2,0,0,1,20,7.55ZM11,10H6v8h5Zm2,8h5V10H13Zm-1-8.62L5.22,6.5,12,1.38,18.78,6.5Z' },
    { name: 'Fire', viewBox: '0 0 24 24', path: 'M18.5,9.5c0,3.48-2.3,6.54-5.5,7.74-0.45,0.17-0.91,0.26-1.37,0.26-1.42,0-2.83-0.56-4-1.58-1.55-1.35-2.63-3.41-2.63-5.42,0-2.85,2.15-5.36,5-5.89v-2.1C5,2.52,2,6.15,2,9.5,2,14.07,5.43,18,10.5,18c2.61,0,5-1,6.5-3.08,1.48,1,3,1.08,4,1V11.5C21,10.84,18.5,9.5,18.5,9.5Z' },
    { name: 'Ice Cream', viewBox: '0 0 24 24', path: 'M17.43,11.12a5.94,5.94,0,0,0-10.86,0,1,1,0,0,0,.37,1.37L12,16.27l5.06-3.78A1,1,0,0,0,17.43,11.12ZM12,21.5l-6.19-9.17A3,3,0,0,1,5.2,8.5a4,4,0,0,1,8,0,3,3,0,0,1-.61,3.83Z' },
    { name: 'Pizza', viewBox: '0 0 24 24', path: 'M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Zm6,10.5a.5.5,0,0,1-.5.5h-5a.5.5,0,0,1-.5-.5v-5a.5.5,0,0,1,.5-.5H12a.5.5,0,0,1,.35.15L18,11.29V12.5ZM9,7a1.5,1.5,0,1,1,1.5,1.5A1.5,1.5,0,0,1,9,7Zm4.5,3.5a1.5,1.5,0,1,1,1.5,1.5A1.5,1.5,0,0,1,13.5,10.5ZM9,14a1.5,1.5,0,1,1,1.5,1.5A1.5,1.5,0,0,1,9,14Z' },
    { name: 'Rocket', viewBox: '0 0 24 24', path: 'M18.7,5.3a2.37,2.37,0,0,0-3.2-.12L13,7.54V4.5a1.5,1.5,0,0,0-3,0v3L7.5,5.18a2.37,2.37,0,0,0-3.2.12,2.37,2.37,0,0,0,.12,3.2L7,11v6.5a1.5,1.5,0,0,0,3,0V11l2.56,2.56a2.37,2.37,0,0,0,3.32,0,2.37,2.37,0,0,0,0-3.32ZM7,20a1,1,0,0,0,1,1h8a1,1,0,0,0,0-2H8A1,1,0,0,0,7,20Z' },
    { name: 'Robot', viewBox: '0 0 24 24', path: 'M19,6H15V4a2,2,0,0,0-2-2H9A2,2,0,0,0,7,4V6H5A2,2,0,0,0,3,8V19a2,2,0,0,0,2,2H7v1a1,1,0,0,0,2,0V21h4v1a1,1,0,0,0,2,0V21h2a2,2,0,0,0,2-2V8A2,2,0,0,0,19,6ZM8.5,15A1.5,1.5,0,1,1,10,13.5,1.5,1.5,0,0,1,8.5,15Zm7,0A1.5,1.5,0,1,1,17,13.5,1.5,1.5,0,0,1,15.5,15ZM16,10H8V8h8Z' },
    // Improved Anatomical/Body Part Shapes (Standardized Path Styles)
    { name: 'Body', viewBox: '0 0 100 100', path: 'M 30,20 C 30,10 70,10 70,20 L 75,70 C 75,85 25,85 25,70 Z', defaultColor: '#F59E0B' },
    { name: 'Arm', viewBox: '0 0 100 100', path: 'M 10,10 C 20,40 20,60 10,90 L 30,90 C 40,60 40,40 30,10 Z', defaultColor: '#D97706' },
    { name: 'Leg', viewBox: '0 0 100 100', path: 'M 10,10 C 20,50 20,70 10,90 L 30,90 C 40,70 40,50 30,10 Z', defaultColor: '#D97706' },
    { name: 'Eye', viewBox: '0 0 100 100', path: 'M 20,50 C 20,30 80,30 80,50 C 80,70 20,70 20,50 M 50,50 A 10,10 0 1,0 50,51 Z', defaultColor: '#FFFFFF' },
    { name: 'Nose', viewBox: '0 0 100 100', path: 'M 50,20 C 45,60 55,60 50,80 Z', defaultColor: '#BE185D' },
    { name: 'Mouth', viewBox: '0 0 100 100', path: 'M 30,60 C 40,75 60,75 70,60', defaultColor: '#EF4444' },
    { name: 'Man Template', viewBox: '0 0 100 200', path: 'M 50,20 A 15,15 0 1,0 50,50 A 15,15 0 1,0 50,20 M 50,50 L 50,110 M 50,70 L 30,90 M 50,70 L 70,90 M 50,110 L 35,170 M 50,110 L 65,170', defaultColor: '#3B82F6' },
    { name: 'Woman Template', viewBox: '0 0 100 200', path: 'M 50,20 A 15,15 0 1,0 50,50 A 15,15 0 1,0 50,20 M 50,50 L 50,110 M 30,80 L 70,80 M 50,110 L 35,170 M 50,110 L 65,170', defaultColor: '#EC4899' }
];

const BACKGROUNDS_INITIAL = [
    { name: 'Landscape', viewBox: '0 0 100 100', path: 'M 0 50 L 50 10 L 100 50 L 100 100 L 0 100 Z', defaultColor: '#A7F3D0', isEditable: false },
    { name: 'Room', viewBox: '0 0 100 100', path: 'M 0 0 L 100 0 L 100 100 L 0 100 Z', defaultColor: '#FED7AA', isEditable: false },
];


// --- Helper Components ---

const ToolButton: React.FC<{ icon: string, label: string, title?: string, active?: boolean, onClick: () => void, disabled?: boolean, iconColor?: string }> = 
  ({ icon, label, title, active, onClick, disabled, iconColor }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      className={`w-14 h-14 flex flex-col items-center justify-center rounded-2xl transition-all duration-300 relative border-2
        ${active ? 'bg-linear-to-br from-blue-500 to-indigo-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] border-blue-400 scale-110' : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-100 shadow-sm'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
        hover:scale-110 active:scale-95
      `}
    >
      <i className={`fas ${icon} text-2xl ${!active && !disabled ? iconColor : ''}`}></i>
    </button>
);

const TopToolButton: React.FC<{ 
  icon: string, 
  title: string, 
  onClick: () => void, 
  disabled?: boolean, 
  iconColor?: string,
  label?: string
}> = ({ icon, title, onClick, disabled, iconColor, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`group flex flex-col items-center justify-center p-1.5 rounded-xl transition-all duration-200
      ${disabled 
        ? 'opacity-30 cursor-not-allowed' 
        : 'hover:bg-indigo-100 active:scale-95 text-slate-600'
      }
    `}
  >
    <div className={`w-11 h-11 flex items-center justify-center rounded-2xl bg-white border-2 border-slate-100 shadow-sm group-hover:border-indigo-400 group-hover:shadow-md transition-all ${disabled ? '' : iconColor}`}>
       <i className={`fas ${icon} text-lg`}></i>
    </div>
    {label && <span className="text-[10px] font-bold text-slate-500 mt-1">{label}</span>}
  </button>
);


const Separator: React.FC = () => <div className="w-px h-8 bg-slate-300 mx-1"></div>;

const ColorSwatch: React.FC<{ color: string, active?: boolean, onClick: () => void }> = 
  ({ color, active, onClick }) => (
    <button 
      onClick={onClick}
      className={`w-5 h-5 rounded-full border transition-all transform hover:scale-125 active:scale-95 shadow-sm relative overflow-hidden
        ${active ? 'border-indigo-600 ring-2 ring-indigo-300 ring-offset-1 scale-125 z-10' : 'border-slate-200 hover:border-slate-400'}
        ${color === 'transparent' ? 'bg-white' : ''}
      `}
      style={color !== 'transparent' ? { backgroundColor: color } : {}}
      title={color === 'transparent' ? 'None' : color}
    >
      {color === 'transparent' && (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-red-500 opacity-50">
            <line x1="0" y1="100" x2="100" y2="0" stroke="currentColor" strokeWidth="10" />
            <line x1="0" y1="0" x2="100" y2="100" stroke="currentColor" strokeWidth="10" />
        </svg>
      )}
    </button>
  );

const COLORS = [
  'transparent', '#000000', '#475569', '#94a3b8', '#cbd5e1', '#FFFFFF',
  '#ef4444', '#dc2626', '#b91c1c', '#f97316', '#ea580c', '#c2410c',
  '#f59e0b', '#d97706', '#b45309', '#facc15', '#eab308', '#ca8a04',
  '#84cc16', '#65a30d', '#4d7c0f', '#22c55e', '#16a34a', '#15803d',
  '#10b981', '#059669', '#047857', '#14b8a6', '#0d9488', '#0f766e',
  '#06b6d4', '#0891b2', '#0e7490', '#0ea5e9', '#0284c7', '#0369a1',
  '#3b82f6', '#2563eb', '#1d4ed8', '#6366f1', '#4f46e5', '#4338ca',
  '#8b5cf6', '#7c3aed', '#6d28d9', '#a855f7', '#9333ea', '#7e22ce',
  '#d946ef', '#c026d3', '#a21caf', '#ec4899', '#db2777', '#be185d'
];

// --- Shape Gallery Component ---
interface ShapeGalleryProps {
  onClose: () => void;
  onSelect: (shape: { name: string; path: string; viewBox: string; defaultColor?: string }) => void;
  title: string;
  data: { name: string; path: string; viewBox: string; defaultColor?: string }[];
}
const ShapeGallery: React.FC<ShapeGalleryProps> = ({ onClose, onSelect, title, data }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-700">{title}</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-2xl">
                        <i className="fas fa-times-circle"></i>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {data.map((shape, idx) => (
                            <div 
                                key={shape.name + idx} 
                                onClick={() => onSelect(shape)}
                                title={shape.name}
                                className="bg-white p-2 rounded-lg border border-slate-200 cursor-pointer aspect-square flex items-center justify-center transition-all hover:shadow-md hover:border-blue-400 hover:scale-105 relative"
                            >
                                <svg viewBox={shape.viewBox} className="w-full h-full text-slate-700" fill="currentColor">
                                    <path d={shape.path} />
                                </svg>
                                {'isEditable' in shape && shape.isEditable && (
                                    <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm">
                                        <i className="fas fa-paint-brush text-[10px] text-blue-500"></i>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- SVG Parsing Logic ---
const parseTransform = (transformString: string | null): { tx: number; ty: number } => {
    if (!transformString) return { tx: 0, ty: 0 };
    let totalTx = 0;
    let totalTy = 0;
    
    // Support translate(x, y), translate(x y), and translate(x)
    const translateRegex = /translate\s*\(\s*([0-9-.]+)\s*[, ]*\s*([0-9-.]+)?\s*\)/g;
    let match;
    while ((match = translateRegex.exec(transformString)) !== null) {
        const x = parseFloat(match[1] || '0');
        const yPart = match[2] ? match[2].trim() : '';
        const y = yPart ? parseFloat(yPart) : 0;
        if (!isNaN(x)) totalTx += x;
        if (!isNaN(y)) totalTy += y;
    }
    return { tx: totalTx, ty: totalTy };
};

const parseSvgString = (svgText: string): Shape[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const svgNode = doc.documentElement;
    if (!svgNode || svgNode.tagName.toLowerCase() !== 'svg') {
        return [];
    }
    
    const finalShapes: Shape[] = [];

    const traverse = (node: Element, parentTransform: string) => {
        for (const child of Array.from(node.children)) {
            const tagName = child.tagName.toLowerCase();
            
            // Ignore the background rect
            if (tagName === 'rect' && child.id === 'canvas-background') {
                continue;
            }

            // Accumulate hierarchy transform
            const ownTransform = child.getAttribute('transform') || '';
            const combinedTransform = (parentTransform + ' ' + ownTransform).trim();

            if (tagName === 'g') {
                traverse(child, combinedTransform);
                continue;
            }

            const id = `s-${Date.now()}-${Math.random()}`;
            const el = child as any;
            const fill = child.getAttribute('fill') || el.style?.fill || 'none';
            const stroke = child.getAttribute('stroke') || el.style?.stroke || 'none';
            const sWidth = child.getAttribute('stroke-width') || el.style?.strokeWidth || '0';
            const strokeWidth = parseFloat(sWidth);

            let shape: Shape | null = null;
            
            switch (tagName) {
                case 'rect':
                    shape = {
                        id, type: 'rect',
                        x: parseFloat(child.getAttribute('x') || '0'),
                        y: parseFloat(child.getAttribute('y') || '0'),
                        width: parseFloat(child.getAttribute('width') || '0'),
                        height: parseFloat(child.getAttribute('height') || '0'),
                        fill, stroke, strokeWidth,
                        transform: combinedTransform || undefined
                    };
                    break;
                case 'circle':
                case 'ellipse':
                    shape = {
                        id, type: 'circle',
                        cx: parseFloat(child.getAttribute('cx') || '0'),
                        cy: parseFloat(child.getAttribute('cy') || '0'),
                        rx: parseFloat(child.getAttribute('r') || child.getAttribute('rx') || '0'),
                        ry: parseFloat(child.getAttribute('r') || child.getAttribute('ry') || '0'),
                        fill, stroke, strokeWidth,
                        transform: combinedTransform || undefined
                    };
                    break;
                case 'line':
                     shape = {
                        id, type: 'line',
                        x1: parseFloat(child.getAttribute('x1') || '0'),
                        y1: parseFloat(child.getAttribute('y1') || '0'),
                        x2: parseFloat(child.getAttribute('x2') || '0'),
                        y2: parseFloat(child.getAttribute('y2') || '0'),
                        fill: 'none', stroke, strokeWidth,
                        transform: combinedTransform || undefined
                    };
                    break;
                case 'path':
                    shape = {
                        id, type: 'path',
                        d: child.getAttribute('d') || '',
                        transform: combinedTransform || undefined,
                        fill, stroke, strokeWidth
                    };
                    break;
                case 'polygon':
                case 'polyline': {
                    const pointsAttr = child.getAttribute('points') || '';
                    const coords = pointsAttr.trim().split(/[\s,]+/).map(parseFloat);
                    if (coords.length >= 4) {
                        let d = `M${coords[0]},${coords[1]}`;
                        for (let i = 2; i < coords.length; i += 2) {
                            if (!isNaN(coords[i]) && !isNaN(coords[i+1])) {
                                d += ` L${coords[i]},${coords[i+1]}`;
                            }
                        }
                        if (tagName === 'polygon') d += ' Z';
                        shape = {
                            id, type: 'path',
                            d, transform: combinedTransform || undefined,
                            fill, stroke, strokeWidth
                        };
                    }
                    break;
                }
            }
            if (shape) {
                finalShapes.push(shape);
            }
        }
    };
    
    traverse(svgNode, '');
    return finalShapes;
};


// --- Main Paint Editor Component ---
interface PaintEditorProps {
  onClose: () => void;
  onSave: (svgDataUrl: string) => void;
  initialSprite?: Sprite | null;
  canvasWidth?: number;
  canvasHeight?: number;
  isBackground?: boolean;
}

const PaintEditor: React.FC<PaintEditorProps> = ({ 
  onClose, 
  onSave, 
  initialSprite, 
  canvasWidth = 480, 
  canvasHeight = 420,
  isBackground = false
}) => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [backgroundsLibrary, setBackgroundsLibrary] = useState(BACKGROUNDS_INITIAL);
  const [background, setBackground] = useState<Shape | null>(null);

  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [fillColor, setFillColor] = useState<string>('#EF4444');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [activeColorTarget, setActiveColorTarget] = useState<'fill' | 'stroke'>('fill');
  const [isFillPickerOpen, setIsFillPickerOpen] = useState(false);
  const [isStrokePickerOpen, setIsStrokePickerOpen] = useState(false);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  const [isBackgroundSelected, setIsBackgroundSelected] = useState(false);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingShape, setDrawingShape] = useState<Shape | null>(null);
  const [isShapeGalleryOpen, setIsShapeGalleryOpen] = useState(false);
  const [galleryType, setGalleryType] = useState<'shape' | 'background'>('shape');
  const [isDragging, setIsDragging] = useState(false);
  const [activeResizeHandle, setActiveResizeHandle] = useState<string | null>(null);
  const [resizeStartInfo, setResizeStartInfo] = useState<{ x: number, y: number, bBox: { x: number, y: number, width: number, height: number }, shape: Shape } | null>(null);

  const [showGrid, setShowGrid] = useState(false);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: canvasWidth, height: canvasHeight });

  useLayoutEffect(() => {
    if (canvasContainerRef.current) {
        const resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                setCanvasDimensions({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height
                });
            }
        });
        resizeObserver.observe(canvasContainerRef.current);
        return () => resizeObserver.disconnect();
    }
  }, []);

  const svgRef = useRef<SVGSVGElement>(null);
  const startPointRef = useRef<{x: number, y: number} | null>(null);
  const shapeRefs = useRef<Record<string, SVGElement | null>>({});
  const dragStartRef = useRef<{ startX: number; startY: number; shapeStart: Record<string, number> } | null>(null);
  const isInitialLoadRef = useRef(false);
  
  // Undo/Redo State
  const historyRef = useRef<{ undo: Shape[][], redo: Shape[][] }>({ undo: [], redo: [] });
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Prevent shortcuts if user is typing in a prompt or if a modal is open
        if (isShapeGalleryOpen) return;
        
        const isCtrl = e.ctrlKey || e.metaKey;
        
        if (isCtrl && e.key === 'z') {
            e.preventDefault();
            handleUndo();
        } else if (isCtrl && e.key === 'y') {
            e.preventDefault();
            handleRedo();
        } else if (e.key === 'Delete' || e.key === 'Backspace') {
            handleDelete();
        } else if (!isCtrl) {
            switch (e.key.toLowerCase()) {
                case 'v': setActiveTool('select'); break;
                case 'r': setActiveTool('rect'); break;
                case 'c': setActiveTool('circle'); break;
                case 'l': setActiveTool('line'); break;
                case 't': setActiveTool('text'); break;
                case 'f': setActiveTool('freehand'); break;
                case 'p': setActiveTool('freehand'); break; // Pencil
                case 'w': setActiveTool('triangle'); break;
            }
        }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shapes, selectedShapeId, activeTool, historyState, isShapeGalleryOpen]);

  const pushToHistory = (shapesToPush: Shape[]) => {
    historyRef.current.undo.push(shapesToPush);
    historyRef.current.redo = []; // Clear redo stack on new action
    if (historyRef.current.undo.length > 30) { // Limit stack size
        historyRef.current.undo.shift();
    }
    setHistoryState({ canUndo: true, canRedo: false });
  };

  const handleUndo = () => {
    if (historyRef.current.undo.length > 0) {
        const lastState = historyRef.current.undo.pop()!;
        historyRef.current.redo.push(shapes); // Push current state to redo
        setShapes(lastState);
        setHistoryState({
            canUndo: historyRef.current.undo.length > 0,
            canRedo: true
        });
    }
  };
    
  const handleRedo = () => {
    if (historyRef.current.redo.length > 0) {
        const nextState = historyRef.current.redo.pop()!;
        historyRef.current.undo.push(shapes); // Push current state to undo
        setShapes(nextState);
        setHistoryState({
            canUndo: true,
            canRedo: historyRef.current.redo.length > 0
        });
    }
  };

  useEffect(() => {
    const loadSprite = async () => {
        if (!initialSprite) {
            setShapes([]);
            return;
        }

        isInitialLoadRef.current = true; // Set flag for centering effect
        historyRef.current = { undo: [], redo: [] }; // Reset history on load
        setHistoryState({ canUndo: false, canRedo: false });

        try {
            let svgString: string;
            const costume = initialSprite.costume;

            if (costume.startsWith('data:image/svg+xml;base64,')) {
                const base64 = costume.replace('data:image/svg+xml;base64,', '');
                svgString = decodeURIComponent(escape(atob(base64)));
            } else if (costume.endsWith('.svg')) {
                try {
                    console.log("Attempting to fetch costume:", costume);
                    const response = await fetch(costume);
                    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                    svgString = await response.text();
                    console.log("Successfully fetched SVG, length:", svgString.length);
                    console.log("SVG Preview (first 500 chars):", svgString.substring(0, 500));
                } catch (e) {
                    console.error("Error loading SVG from URL:", costume, e);
                    alert(`Failed to load costume: ${costume}. Check console for details.`);
                    return;
                }
            } else {
                return;
            }
            
            const parsedShapes = parseSvgString(svgString);
            
            // Separate background (largest rectangle)
            let backgroundShape: Shape | null = null;
            const shapesOnly = parsedShapes.filter(s => {
                if (s.type === 'rect' && s.width >= canvasWidth - 10 && s.height >= canvasHeight - 10) {
                    backgroundShape = s;
                    return false;
                }
                return true;
            });
            
            setShapes(shapesOnly);
            setBackground(backgroundShape);
        } catch (error) {
            console.error("Error loading sprite for editing:", error);
        }
    };
    loadSprite();
  }, [initialSprite]);

  useEffect(() => {
    if (isInitialLoadRef.current && shapes.length > 0) {
        // Wait for one render cycle to ensure DOM elements exist for accurate bounding box calculation
        const timer = setTimeout(() => {
            const svgEl = svgRef.current;
            if (!svgEl) return;
            const svgRect = svgEl.getBoundingClientRect();

            let totalBBox = { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity };
            let hasContent = false;

            shapes.forEach(shape => {
                const b = getBoundingBox(shape);
                const strokeOffset = (shape.strokeWidth || 0) / 2;
                if (b.width > 0 || b.height > 0) {
                    hasContent = true;
                    totalBBox.x = Math.min(totalBBox.x, b.x - strokeOffset);
                    totalBBox.y = Math.min(totalBBox.y, b.y - strokeOffset);
                    totalBBox.x2 = Math.max(totalBBox.x2, b.x + b.width + strokeOffset);
                    totalBBox.y2 = Math.max(totalBBox.y2, b.y + b.height + strokeOffset);
                }
            });

            if (hasContent) {
                const bboxWidth = totalBBox.x2 - totalBBox.x;
                const bboxHeight = totalBBox.y2 - totalBBox.y;
                const bboxCenterX = totalBBox.x + bboxWidth / 2;
                const bboxCenterY = totalBBox.y + bboxHeight / 2;

                const canvasWidthValue = canvasDimensions.width;
                const canvasHeightValue = canvasDimensions.height;
                const canvasCenterX = canvasWidthValue / 2;
                const canvasCenterY = canvasHeightValue / 2;

                const distFromCenter = Math.sqrt(Math.pow(bboxCenterX - canvasCenterX, 2) + Math.pow(bboxCenterY - canvasCenterY, 2));
                const isOffCenter = distFromCenter > 20;
                const isTooLarge = bboxWidth > canvasWidthValue * 0.95 || bboxHeight > canvasHeightValue * 0.95;
                const isTooSmall = bboxWidth < canvasWidthValue * 0.1 && bboxHeight < canvasHeightValue * 0.1;

                if (!isBackground && (isOffCenter || isTooLarge || isTooSmall || distFromCenter > 0)) {
                    const padding = 60;
                    const availableWidth = canvasWidthValue - padding * 2;
                    const availableHeight = canvasHeightValue - padding * 2;

                    let scale = 1;
                    if (bboxWidth > 0 && bboxHeight > 0) {
                        const scaleX = availableWidth / bboxWidth;
                        const scaleY = availableHeight / bboxHeight;
                        scale = Math.min(scaleX, scaleY);
                        if (!isTooLarge && scale > 1.2) scale = 1.2;
                    }

                    // Apply a UNIFORM group transform to all shapes to preserve relative positions perfectly
                    setShapes(prevShapes => prevShapes.map(s => {
                        const newShape = { ...s };
                        const transform = newShape.transform || '';
                        
                        // Combined: translate to canvas center, then scale, then move back relative to drawing center
                        const extraTransform = `translate(${canvasCenterX.toFixed(2)}, ${canvasCenterY.toFixed(2)}) scale(${scale.toFixed(4)}) translate(${-bboxCenterX.toFixed(2)}, ${-bboxCenterY.toFixed(2)})`;
                        newShape.transform = `${extraTransform} ${transform}`.trim();
                        newShape.strokeWidth = (newShape.strokeWidth || 0) * scale;
                        return newShape;
                    }));
                }
            }
            isInitialLoadRef.current = false;
        }, 100);

        return () => clearTimeout(timer);
    }
  }, [shapes]);


  const getMousePosition = (e: React.MouseEvent): {x: number, y: number} => {
    if (!svgRef.current) return {x: 0, y: 0};
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleShapeMouseDown = (e: React.MouseEvent, shapeId: string) => {
      if (activeTool === 'select') {
          e.stopPropagation();
          setSelectedShapeId(shapeId);
          
          const shape = shapes.find(s => s.id === shapeId);
          if (!shape) return;

          const pos = getMousePosition(e);
          setIsDragging(true);
          
          let shapeStart: any = {};
          if (shape.type === 'rect') {
              shapeStart = { x: shape.x, y: shape.y };
          } else if (shape.type === 'circle') {
              shapeStart = { cx: shape.cx, cy: shape.cy };
          } else if (shape.type === 'line') {
              shapeStart = { x1: shape.x1, y1: shape.y1, x2: shape.x2, y2: shape.y2 };
          }
          
          // Always capture translation if present
          const transform = shape.transform || '';
          const translateMatch = transform.match(/translate\(([^, )]+)[, ]*([^)]*)\)/);
          const tx = translateMatch ? parseFloat(translateMatch[1]) : 0;
          const tyPart = translateMatch && translateMatch[2] ? translateMatch[2].trim() : '';
          const ty = tyPart ? parseFloat(tyPart) : 0;
          
          shapeStart.tx = isNaN(tx) ? 0 : tx;
          shapeStart.ty = isNaN(ty) ? 0 : ty;
          shapeStart.initialTransform = transform;

          dragStartRef.current = {
              startX: pos.x,
              startY: pos.y,
              shapeStart
          };
      }
  };

  const handleSvgMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedShapeId(null);

    if (activeTool === 'select') {
        return;
    }

    pushToHistory(shapes);

    const pos = getMousePosition(e);
    startPointRef.current = pos;
    setIsDrawing(true);
    
    let newShape: Shape | null = null;
    switch (activeTool) {
        case 'rect':
        case 'triangle': {
            newShape = { id: `s-${Date.now()}`, type: activeTool, x: pos.x, y: pos.y, width: 0, height: 0, fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth } as any;
            break;
        }
        case 'circle':
            newShape = { id: `s-${Date.now()}`, type: 'circle', cx: pos.x, cy: pos.y, rx: 0, ry: 0, fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth };
            break;
        case 'line':
            newShape = { id: `s-${Date.now()}`, type: 'line', x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y, fill: 'none', stroke: strokeColor, strokeWidth: strokeWidth };
            break;
        case 'freehand':
            newShape = { id: `s-${Date.now()}`, type: 'path', d: `M${pos.x} ${pos.y}`, fill: 'none', stroke: strokeColor, strokeWidth: strokeWidth };
            break;
        case 'text': {
            const text = prompt("Enter text:");
            if (text) {
                newShape = { 
                    id: `s-${Date.now()}`, 
                    type: 'text', 
                    x: pos.x, 
                    y: pos.y, 
                    text, 
                    fontSize: strokeWidth * 5, 
                    fontFamily: 'Arial',
                    fill: fillColor,
                    stroke: 'none',
                    strokeWidth: 0
                };
            }
            break;
        }
    }
    setDrawingShape(newShape);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing && drawingShape && startPointRef.current) {
        const pos = getMousePosition(e);
        switch (drawingShape.type) {
            case 'rect':
            case 'triangle': {
                const startX = startPointRef.current.x;
                const startY = startPointRef.current.y;
                const newX = Math.min(pos.x, startX);
                const newY = Math.min(pos.y, startY);
                if (drawingShape.type === 'rect' || drawingShape.type === 'triangle') {
                    setDrawingShape({ ...drawingShape, x: newX, y: newY, width: Math.abs(pos.x - startX), height: Math.abs(pos.y - startY) });
                }
                break;
            }
            case 'circle': {
                const startX = startPointRef.current.x;
                const startY = startPointRef.current.y;
                const cx = startX + (pos.x - startX) / 2;
                const cy = startY + (pos.y - startY) / 2;
                setDrawingShape({ ...drawingShape, cx, cy, rx: Math.abs(pos.x - startX) / 2, ry: Math.abs(pos.y - startY) / 2 });
                break;
            }
            case 'line':
                setDrawingShape({ ...drawingShape, x2: pos.x, y2: pos.y });
                break;
            case 'path':
                setDrawingShape({ ...drawingShape, d: drawingShape.d + ` L${pos.x} ${pos.y}` });
                break;
        }
    } else if (activeResizeHandle && resizeStartInfo) {
        const dx = e.clientX - resizeStartInfo.x;
        const dy = e.clientY - resizeStartInfo.y;
        
        let delta = dx;
        // For top-left or bottom-left, dragging left (negative dx) should increase size (so -dx > 0)
        if (activeResizeHandle === 'tl' || activeResizeHandle === 'bl') {
            delta = -dx;
        }
        
        // Calculate scale factor from drag (simplified uniform scaling)
        const factor = (resizeStartInfo.bBox.width + delta) / resizeStartInfo.bBox.width;
        
        // Apply scaling
        setShapes(prevShapes => prevShapes.map(s => {
            if (s.id !== resizeStartInfo.shape.id) return s;
            
            const newShape = { ...s };
            // Simple uniform scale centered on the shape's original center
            const b = resizeStartInfo.bBox;
            const cx = b.x + b.width / 2;
            const cy = b.y + b.height / 2;
            
            const wrapperTransform = `translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) scale(${factor.toFixed(4)}) translate(${-cx.toFixed(2)}, ${-cy.toFixed(2)})`;
            newShape.transform = `${wrapperTransform} ${resizeStartInfo.shape.transform || ''}`.trim();
            
            if ('strokeWidth' in newShape) {
                newShape.strokeWidth = (resizeStartInfo.shape.strokeWidth || 1) * factor;
            }
            return newShape;
        }));
    } else if (isDragging && activeTool === 'select' && selectedShapeId && dragStartRef.current) {
        const pos = getMousePosition(e);
        const currentDragStart = dragStartRef.current;
        const dx = pos.x - currentDragStart.startX;
        const dy = pos.y - currentDragStart.startY;

        setShapes(prevShapes => prevShapes.map(s => {
            if (s.id !== selectedShapeId) return s;

            const newShape = { ...s };
            const { shapeStart } = currentDragStart;

            // Simple robust dragging: Prepend translate(dx, dy) to the original transform
            // This ensures it behaves exactly like a world-space shift.
            const baseTransform = shapeStart.initialTransform || '';
            
            // We want newTx = initialTx + dx, newTy = initialTy + dy
            // The cleanest way is to replace the old translate with the new one
            // while keeping all other transforms untouched and relative.
            
            // Find existing translate relative to shapeStart.tx/ty
            const newTx = shapeStart.tx + dx;
            const newTy = shapeStart.ty + dy;
            
            let others = baseTransform.replace(/translate\([^)]*\)/g, '').trim();
            newShape.transform = `translate(${newTx}, ${newTy}) ${others}`.trim();
            
            // For rect, circle, line: we keep their original base coords fixed during drag 
            // and just use transform to move them.
            // This avoids "swinging" pivot issues.
            return newShape;
        }));
    }
  };

  const handleMouseUp = () => {
    if (drawingShape) {
      let isValid = false;
      if (drawingShape.type === 'rect' || drawingShape.type === 'triangle') isValid = drawingShape.width > 2 || drawingShape.height > 2;
      else if (drawingShape.type === 'circle') isValid = drawingShape.rx > 2 || drawingShape.ry > 2;
      else if (drawingShape.type === 'line') isValid = Math.abs(drawingShape.x1 - drawingShape.x2) > 2 || Math.abs(drawingShape.y1 - drawingShape.y2) > 2;
      else if (drawingShape.type === 'path') isValid = drawingShape.d.includes('L');
      else if (drawingShape.type === 'text') isValid = drawingShape.text.length > 0;
      
      if (isValid) {
         setShapes(prev => [...prev, drawingShape]);
      }
    }

    if (isDragging) {
      pushToHistory(shapes); // Push state *after* drag completes
      setIsDragging(false);
      dragStartRef.current = null;
    }

    if (activeResizeHandle) {
        pushToHistory(shapes);
        setActiveResizeHandle(null);
        setResizeStartInfo(null);
    }

    setIsDrawing(false);
    setDrawingShape(null);
    startPointRef.current = null;
  };
  
  const handleClearAll = () => {
    if (shapes.length === 0) return;
    if (confirm("Are you sure you want to clear the entire canvas?")) {
        pushToHistory(shapes);
        setShapes([]);
        setSelectedShapeId(null);
    }
  };

  const handleSave = () => {
    // Calculate the total bounding box
    let totalBBox = { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity };
    let hasContent = false;

    shapes.forEach(shape => {
        const b = getBoundingBox(shape);
        const strokeOffset = (shape.strokeWidth || 0) / 2;
        if (b.width > 0 || b.height > 0) {
            hasContent = true;
            totalBBox.x = Math.min(totalBBox.x, b.x - strokeOffset);
            totalBBox.y = Math.min(totalBBox.y, b.y - strokeOffset);
            totalBBox.x2 = Math.max(totalBBox.x2, b.x + b.width + strokeOffset);
            totalBBox.y2 = Math.max(totalBBox.y2, b.y + b.height + strokeOffset);
        }
    });

    let viewBox: string;
    let finalViewBoxParts = {x: 0, y: 0, w: canvasDimensions.width, h: canvasDimensions.height};

    if (hasContent && !isBackground) {
        const finalWidth = totalBBox.x2 - totalBBox.x;
        const finalHeight = totalBBox.y2 - totalBBox.y;
        const paddingX = finalWidth * 0.1;
        const paddingY = finalHeight * 0.1;

        finalViewBoxParts = {
          x: totalBBox.x - paddingX,
          y: totalBBox.y - paddingY,
          w: finalWidth + paddingX * 2,
          h: finalHeight + paddingY * 2,
        };
        viewBox = `${finalViewBoxParts.x} ${finalViewBoxParts.y} ${finalViewBoxParts.w} ${finalViewBoxParts.h}`;
    } else {
        viewBox = `0 0 ${canvasDimensions.width} ${canvasDimensions.height}`;
    }

    // Generate SVG string directly from shapes to ensure color accuracy
    const elements = shapes.map(shape => {
        const fillAttr = shape.fill ? `fill="${shape.fill}"` : '';
        const strokeAttr = shape.stroke ? `stroke="${shape.stroke}"` : '';
        const strokeWidthAttr = shape.strokeWidth ? `stroke-width="${shape.strokeWidth}"` : '';
        
        const attrs = `${fillAttr} ${strokeAttr} ${strokeWidthAttr}`.trim();
        
        switch (shape.type) {
            case 'rect':
                return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" ${attrs} ${shape.transform ? `transform="${shape.transform}"` : ''} />`;
            case 'triangle': {
                const points = `${shape.x + shape.width / 2},${shape.y} ${shape.x + shape.width},${shape.y + shape.height} ${shape.x},${shape.y + shape.height}`;
                return `<polygon points="${points}" ${attrs} ${shape.transform ? `transform="${shape.transform}"` : ''} />`;
            }
            case 'circle':
                return `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" ${attrs} ${shape.transform ? `transform="${shape.transform}"` : ''} />`;
            case 'line':
                return `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" ${attrs} stroke-linecap="round" ${shape.transform ? `transform="${shape.transform}"` : ''} />`;
            case 'path':
                return `<path d="${shape.d}" transform="${shape.transform || ''}" ${attrs} stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
            case 'text':
                return `<text x="${shape.x}" y="${shape.y}" font-size="${shape.fontSize}" font-family="${shape.fontFamily}" fill="${shape.fill}" transform="${shape.transform || ''}">${shape.text}</text>`;
            default:
                return '';
        }
    }).join('\n');

    const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%">
    <rect id="canvas-background" x="${finalViewBoxParts.x}" y="${finalViewBoxParts.y}" width="${finalViewBoxParts.w}" height="${finalViewBoxParts.h}" fill="transparent" />
    ${elements}
</svg>`;

    const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
    onSave(dataUrl);
  };

  const handleDelete = () => {
    if (!selectedShapeId) return;
    pushToHistory(shapes);
    if (background && selectedShapeId === background.id) {
        setBackground(null);
        setSelectedShapeId(null);
        return;
    }
    setShapes(shapes.filter(s => s.id !== selectedShapeId));
    setSelectedShapeId(null);
  };

  const handleDuplicate = () => {
    if (!selectedShapeId) return;
    pushToHistory(shapes);
    const original = shapes.find(s => s.id === selectedShapeId);
    if (!original) return;

    const newShape = JSON.parse(JSON.stringify(original));
    newShape.id = `s-${Date.now()}`;
    
    // Consistently use transform for duplication offset
    const transform = newShape.transform || '';
    const translateRegex = /translate\(([^, )]+)[, ]*([^)]*)\)/;
    const match = transform.match(translateRegex);
    
    if (match) {
        const x = (parseFloat(match[1]) || 0) + 10;
        const yPart = match[2] ? match[2].trim() : '';
        const y = (yPart ? parseFloat(yPart) : 0) + 10;
        newShape.transform = transform.replace(translateRegex, `translate(${x}, ${y})`);
    } else {
         newShape.transform = `translate(10, 10) ${transform}`.trim();
    }

    setShapes(prev => [...prev, newShape]);
    setSelectedShapeId(newShape.id);
  };
  
  const handleToggleFill = () => {
      if (!selectedShapeId) return;
      pushToHistory(shapes);
      setShapes(shapes.map(s => {
          if (s.id === selectedShapeId && (s.type === 'rect' || s.type === 'triangle' || s.type === 'circle' || s.type === 'path' || s.type === 'text')) {
              return { ...s, fill: s.fill === 'transparent' ? fillColor : 'transparent' };
          }
          return s;
      }));
  };

  const handleMoveLayer = (direction: 'forward' | 'backward' | 'front' | 'back') => {
    if (!selectedShapeId) return;
    pushToHistory(shapes);
    const index = shapes.findIndex(s => s.id === selectedShapeId);
    if (index === -1) return;

    const newShapes = [...shapes];
    const [shape] = newShapes.splice(index, 1);
    
    let newIndex = index;
    if (direction === 'forward') newIndex = Math.min(shapes.length - 1, index + 1);
    else if (direction === 'backward') newIndex = Math.max(0, index - 1);
    else if (direction === 'front') newIndex = shapes.length - 1;
    else if (direction === 'back') newIndex = 0;

    newShapes.splice(newIndex, 0, shape);
    setShapes(newShapes);
  };

  const handleColorChange = (color: string) => {
    if (selectedShapeId) {
        pushToHistory(shapes);
    }
    if (activeColorTarget === 'fill') {
        setFillColor(color);
        if (selectedShapeId) {
            if (background && selectedShapeId === background.id) {
                setBackground({ ...background, fill: color });
            } else {
                setShapes(prev => prev.map(s => {
                    if (s.id !== selectedShapeId) return s;
                    if (s.type === 'rect' || s.type === 'triangle' || s.type === 'circle' || s.type === 'path' || s.type === 'text') {
                        return { ...s, fill: color };
                    }
                    return s;
                }));
            }
        }
    } else { // activeColorTarget === 'stroke'
        setStrokeColor(color);
        if (selectedShapeId) {
            if (background && selectedShapeId === background.id) {
                setBackground({ ...background, stroke: color });
            } else {
                setShapes(prev => prev.map(s => 
                    s.id === selectedShapeId ? { ...s, stroke: color } : s
                ));
            }
        }
    }
  };
  
  const handleStrokeWidthChange = (width: number) => {
      if (selectedShapeId) {
        pushToHistory(shapes);
      }
      setStrokeWidth(width);
      if (selectedShapeId) {
          setShapes(prev => prev.map(s => s.id === selectedShapeId ? { ...s, strokeWidth: width } : s));
      }
      setIsStrokePickerOpen(false);
  };
  
  const handleSelectShape = (shapeData: { name: string; path: string; viewBox: string; defaultColor?: string }) => {
    pushToHistory(shapes);
    const canvasWidthValue = canvasDimensions.width;
    const canvasHeightValue = canvasDimensions.height;
    const targetSize = 100;

    const viewBoxParts = shapeData.viewBox.split(' ').map(Number);
    const [vbX, vbY, vbW, vbH] = viewBoxParts.length === 4 ? viewBoxParts : [0, 0, 24, 24];
    
    const scale = targetSize / Math.max(vbW, vbH);
    // Adjust translation to account for viewBox offset
    const translatedX = (canvasWidthValue / 2) - ((vbX + vbW / 2) * scale);
    const translatedY = (canvasHeightValue / 2) - ((vbY + vbH / 2) * scale);

    const newShape: PathShape = {
        id: `s-${Date.now()}`,
        type: 'path',
        d: shapeData.path,
        transform: `translate(${translatedX}, ${translatedY}) scale(${scale})`,
        fill: shapeData.defaultColor || fillColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
    };

    setShapes(prev => [...prev, newShape]);
    setIsShapeGalleryOpen(false);
  };

  const handleSelectBackground = (shapeData: { name: string; path: string; viewBox: string; defaultColor?: string, isEditable?: boolean }) => {
    pushToHistory(shapes);
    const newBackground: Shape = {
        id: `s-${Date.now()}`,
        type: 'path',
        d: shapeData.path,
        fill: shapeData.defaultColor || '#FFFFFF',
        stroke: 'none',
        strokeWidth: 0,
        transform: `scale(${canvasDimensions.width / 100}, ${canvasDimensions.height / 100})`
    };
    setBackground(newBackground);
    if (!backgroundsLibrary.some(b => b.path === shapeData.path)) {
        setBackgroundsLibrary(prev => [...prev, { ...shapeData, isEditable: false }]);
    }
    setIsShapeGalleryOpen(false);
  };
  
  const SCALE_FACTOR = 1.1;
  const handleGrow = () => handleScale(SCALE_FACTOR);
  const handleShrink = () => handleScale(1 / SCALE_FACTOR);

  const handleFlipHorizontal = () => {
    pushToHistory(shapes);
    
    let targetShapeIds: string[] = [];
    let cx = canvasDimensions.width / 2; // Default center (canvas middle)

    if (selectedShapeId) {
        targetShapeIds = [selectedShapeId];
        const shape = shapes.find(s => s.id === selectedShapeId);
        if (shape) {
            const bbox = getBoundingBox(shape);
            const hasRef = !!shapeRefs.current[shape.id];
            cx = hasRef ? (bbox.x + bbox.width / 2) : (bbox.x + parseTransform(shape.transform).tx + bbox.width / 2);
        }
    } else {
        // Flip All - Calculate collective center
        targetShapeIds = shapes.map(s => s.id);
        let minX = Infinity, maxX = -Infinity;
        shapes.forEach(s => {
            const b = getBoundingBox(s);
            minX = Math.min(minX, b.x);
            maxX = Math.max(maxX, b.x + b.width);
        });
        if (shapes.length > 0) cx = minX + (maxX - minX) / 2;
    }

    setShapes(prevShapes => prevShapes.map(s => {
        if (!targetShapeIds.includes(s.id)) return s;                
        const newShape = { ...s };
        if (newShape.type === 'line') {
            newShape.x1 = 2 * cx - newShape.x1;
            newShape.x2 = 2 * cx - newShape.x2;
        } else {
            // Use transform for everything else
            newShape.transform = `translate(${2 * cx}, 0) scale(-1, 1) ${newShape.transform || ''}`.trim();
        }
        return newShape;
    }));
  };

  const handleRotate = () => {
    pushToHistory(shapes);
    
    let targetShapeIds: string[] = [];
    let cx = canvasDimensions.width / 2, cy = canvasDimensions.height / 2; // Default center

    if (selectedShapeId) {
        targetShapeIds = [selectedShapeId];
        const shape = shapes.find(s => s.id === selectedShapeId);
        if (shape) {
            const bbox = getBoundingBox(shape);
            const hasRef = !!shapeRefs.current[shape.id];
            if (hasRef) {
                cx = bbox.x + bbox.width / 2;
                cy = bbox.y + bbox.height / 2;
            } else {
                const t = parseTransform(shape.transform);
                cx = bbox.x + t.tx + bbox.width / 2;
                cy = bbox.y + t.ty + bbox.height / 2;
            }
        }
    } else {
        // Rotate All - Calculate collective center
        targetShapeIds = shapes.map(s => s.id);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        shapes.forEach(s => {
            const b = getBoundingBox(s);
            minX = Math.min(minX, b.x);
            minY = Math.min(minY, b.y);
            maxX = Math.max(maxX, b.x + b.width);
            maxY = Math.max(maxY, b.y + b.height);
        });
        if (shapes.length > 0) {
            cx = minX + (maxX - minX) / 2;
            cy = minY + (maxY - minY) / 2;
        }
    }

    setShapes(prevShapes => prevShapes.map(s => {
        if (!targetShapeIds.includes(s.id)) return s;                
        const newShape = { ...s };
        const transform = newShape.transform || '';
        newShape.transform = `rotate(15, ${cx.toFixed(2)}, ${cy.toFixed(2)}) ${transform}`.trim();
        return newShape;
    }));
  };

  const handleScale = (factor: number) => {
    pushToHistory(shapes);
    
    let targetShapeIds: string[] = [];
    let cx = canvasWidth / 2, cy = canvasHeight / 2;

    if (selectedShapeId) {
        targetShapeIds = [selectedShapeId];
        const shape = shapes.find(s => s.id === selectedShapeId);
        if (shape) {
            const bbox = getBoundingBox(shape);
            cx = bbox.x + bbox.width / 2;
            cy = bbox.y + bbox.height / 2;
        }
    } else {
        targetShapeIds = shapes.map(s => s.id);
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        shapes.forEach(s => {
            const b = getBoundingBox(s);
            // Use 0 if the bbox is empty (e.g. for a point)
            if (b.width > 0 || b.height > 0) {
              minX = Math.min(minX, b.x);
              minY = Math.min(minY, b.y);
              maxX = Math.max(maxX, b.x + b.width);
              maxY = Math.max(maxY, b.y + b.height);
            }
        });
        if (minX !== Infinity) {
            cx = minX + (maxX - minX) / 2;
            cy = minY + (maxY - minY) / 2;
        }
    }

    setShapes(prevShapes => prevShapes.map(s => {
        if (!targetShapeIds.includes(s.id)) return s;

        const newShape = { ...s };
        // Use a wrapping transform to scale around the center (cx, cy)
        const wrapperTransform = `translate(${cx.toFixed(2)}, ${cy.toFixed(2)}) scale(${factor.toFixed(4)}) translate(${-cx.toFixed(2)}, ${-cy.toFixed(2)})`;
        newShape.transform = `${wrapperTransform} ${newShape.transform || ''}`.trim();
        
        // Also scale strokeWidth if applicable
        if ('strokeWidth' in newShape) {
            newShape.strokeWidth = (newShape.strokeWidth || 1) * factor;
        }
        
        return newShape;
    }));
  };

  const getBoundingBox = (shape: Shape): {x: number; y: number; width: number; height: number} => {
    const element = shapeRefs.current[shape.id];
    const svg = svgRef.current;
    
    if (element && svg) {
        // Use getBBox() which returns the bbox in the element's local coordinate system.
        // Then multiply by the element's CTM (transformation matrix) to get world coordinates.
        try {
            const box = (element as SVGGraphicsElement).getBBox();
            const matrix = (element as SVGGraphicsElement).getCTM();
            
            if (matrix) {
                // Transform the four corners of the bbox
                const points = [
                    {x: box.x, y: box.y},
                    {x: box.x + box.width, y: box.y},
                    {x: box.x + box.width, y: box.y + box.height},
                    {x: box.x, y: box.y + box.height}
                ];
                
                const transformedPoints = points.map(p => {
                    const pt = svg.createSVGPoint();
                    pt.x = p.x;
                    pt.y = p.y;
                    return pt.matrixTransform(matrix);
                });
                
                const minX = Math.min(...transformedPoints.map(p => p.x));
                const minY = Math.min(...transformedPoints.map(p => p.y));
                const maxX = Math.max(...transformedPoints.map(p => p.x));
                const maxY = Math.max(...transformedPoints.map(p => p.y));
                
                return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
            }
        } catch (e) {
            console.error("Error calculating bounding box:", e);
        }
    }
    
    // Fallback if ref or CTM is not ready
    let baseBox = { x: 0, y: 0, width: 0, height: 0 };
    switch (shape.type) {
        case 'rect': 
        case 'triangle':
            baseBox = { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
            break;
        case 'circle': 
            baseBox = { x: shape.cx - shape.rx, y: shape.cy - shape.ry, width: shape.rx * 2, height: shape.ry * 2 };
            break;
        case 'line':
            baseBox = { x: Math.min(shape.x1, shape.x2), y: Math.min(shape.y1, shape.y2), width: Math.abs(shape.x1 - shape.x2), height: Math.abs(shape.y1 - shape.y2) };
            break;
        case 'path': 
            // Crude estimation from path data if ref not ready
            const coords = shape.d.match(/-?[0-9.]+/g);
            if (coords) {
                const nums = coords.map(parseFloat);
                let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
                for (let i = 0; i < nums.length; i += 2) {
                    if (!isNaN(nums[i])) {
                        minX = Math.min(minX, nums[i]);
                        maxX = Math.max(maxX, nums[i]);
                    }
                    if (i + 1 < nums.length && !isNaN(nums[i+1])) {
                        minY = Math.min(minY, nums[i+1]);
                        maxY = Math.max(maxY, nums[i+1]);
                    }
                }
                if (minX !== Infinity) {
                    baseBox = { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
                }
            }
            break;
    }

    // Attempt to account for translation in the transform string for the fallback
    if (shape.transform) {
        const t = parseTransform(shape.transform);
        baseBox.x += t.tx;
        baseBox.y += t.ty;
    }
    return baseBox;
  };

  const selectedShape = shapes.find(s => s.id === selectedShapeId);
  
  const handleToolSelect = (tool: Tool) => {
    setActiveTool(tool);
    if (tool !== 'select') setSelectedShapeId(null);
  };
  
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[100] flex items-center justify-center p-2 backdrop-blur-sm overflow-hidden" dir="ltr">
      {isShapeGalleryOpen && <ShapeGallery onClose={() => setIsShapeGalleryOpen(false)} onSelect={galleryType === 'shape' ? handleSelectShape : handleSelectBackground} title={galleryType === 'shape' ? 'Choose a Shape' : 'Choose a Background'} data={galleryType === 'shape' ? SHAPES_DATA : backgroundsLibrary} />}
      <div className={`bg-white shadow-2xl w-full max-w-6xl max-h-full flex flex-col border-8 border-indigo-400 overflow-hidden ring-4 ring-white ring-inset ${isBackground ? 'rounded-none' : 'rounded-[2rem]'}`}>
        {/* Kid-Friendly Header */}
        <div className="p-4 border-b-2 border-indigo-100 flex items-center justify-between bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shrink-0">
            <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white shadow-xl">
                    <i className="fas fa-paint-brush text-2xl animate-bounce-subtle"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white leading-none drop-shadow-md">Paint Studio</h2>
                  <span className="text-xs text-blue-100 font-bold uppercase tracking-widest mt-1 block">Create Something Amazing!</span>
                </div>
            </div>

            {/* Top Toolbar Actions */}
            <div className="flex items-center gap-2">
                <div className="flex items-center bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-inner">
                    <TopToolButton icon="fa-undo" title="Undo" onClick={handleUndo} disabled={!historyState.canUndo} iconColor="text-white drop-shadow-sm" />
                    <TopToolButton icon="fa-redo" title="Redo" onClick={handleRedo} disabled={!historyState.canRedo} iconColor="text-white drop-shadow-sm" />
                    <div className="w-px h-8 bg-white/20 mx-1"></div>
                    <TopToolButton icon="fa-grid-view" title="Toggle Grid" onClick={() => setShowGrid(!showGrid)} iconColor={showGrid ? "text-yellow-300" : "text-white/60"} />
                </div>

                <div className="h-10 w-px bg-white/20 mx-1"></div>

                <div className="flex items-center gap-2">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-black transition-all hover:scale-105 active:scale-95 border-2 border-white/30 backdrop-blur-sm">
                       Cancel
                    </button>
                    <button onClick={handleSave} className="px-8 py-2.5 rounded-2xl bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-black shadow-lg shadow-yellow-400/30 transition-all hover:scale-105 active:scale-95 flex items-center gap-3">
                       <i className="fas fa-magic text-lg"></i>
                       Save Masterpiece
                    </button>
                </div>
            </div>
        </div>

        {/* Tools Toolbar (Action centric) */}
        <div className="p-2 border-b-2 border-indigo-50 flex items-center gap-6 overflow-x-auto bg-indigo-50/30 justify-center shrink-0 no-scrollbar">
            <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border-2 border-indigo-100/50">
              <button onClick={() => { setIsFillPickerOpen(!isFillPickerOpen); setActiveColorTarget('fill'); }} className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-slate-200" style={{ backgroundColor: fillColor }}>
                  <span className="sr-only">Fill Color</span>
              </button>
              <button onClick={() => { setIsStrokePickerOpen(!isStrokePickerOpen); setActiveColorTarget('stroke'); }} className="w-10 h-10 rounded-xl flex items-center justify-center border-2 border-slate-200" style={{ borderColor: strokeColor, borderWidth: 4 }}>
                  <span className="sr-only">Stroke Color</span>
              </button>
              
              <div className="w-px h-8 bg-indigo-50 mx-1"></div>
              <TopToolButton icon="fa-fill-drip" title="Toggle Fill" onClick={handleToggleFill} disabled={!selectedShapeId || (selectedShape?.type === 'line')} iconColor="text-purple-500" />
              <TopToolButton icon="fa-clone" title="Duplicate" onClick={handleDuplicate} disabled={!selectedShapeId} iconColor="text-emerald-500" />
              <TopToolButton icon="fa-trash" title="Delete" onClick={handleDelete} disabled={!selectedShapeId} iconColor="text-rose-500" />
              <TopToolButton icon="fa-broom" title="Clear Canvas" onClick={handleClearAll} disabled={shapes.length === 0} iconColor="text-red-700" />
            </div>

            {/* Simple Color Picker Popover */}
            {(isFillPickerOpen || isStrokePickerOpen) && (
              <div className="absolute top-32 z-[200] bg-white p-4 rounded-2xl shadow-xl border-2 border-indigo-100 flex flex-col gap-4">
                <div className="grid grid-cols-9 gap-2">
                    {COLORS.map(color => (
                        <ColorSwatch key={color} color={color} active={(activeColorTarget === 'fill' && fillColor === color) || (activeColorTarget === 'stroke' && strokeColor === color)} onClick={() => { handleColorChange(color); setIsFillPickerOpen(false); setIsStrokePickerOpen(false); }} />
                    ))}
                </div>
                {activeColorTarget === 'stroke' && (
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase font-black text-indigo-400 tracking-wider">Line Thickness</label>
                        <input type="range" min="1" max="100" value={strokeWidth} onChange={(e) => handleStrokeWidthChange(parseInt(e.target.value))} className="w-full h-3 bg-indigo-100 rounded-full appearance-none cursor-pointer accent-indigo-600" />
                    </div>
                )}
              </div>
            )}

            <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border-2 border-indigo-100/50">
              <TopToolButton icon="fa-search-plus" label="Grow" title="Grow" onClick={handleGrow} disabled={shapes.length === 0} iconColor="text-cyan-500" />
              <TopToolButton icon="fa-search-minus" label="Shrink" title="Shrink" onClick={handleShrink} disabled={shapes.length === 0} iconColor="text-cyan-500" />
              <div className="w-px h-8 bg-indigo-50 mx-1"></div>
              <TopToolButton icon="fa-arrows-alt-h" title="Flip Horizontal" onClick={handleFlipHorizontal} disabled={shapes.length === 0} iconColor="text-teal-600" />
              <TopToolButton icon="fa-sync-alt" title="Rotate" onClick={handleRotate} disabled={shapes.length === 0} iconColor="text-amber-600" />
            </div>

            <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border-2 border-indigo-100/50">
              <TopToolButton icon="fa-angle-double-up" title="Bring to Front" onClick={() => handleMoveLayer('front')} disabled={!selectedShapeId} iconColor="text-orange-700" />
              <TopToolButton icon="fa-angle-up" title="Bring Forward" onClick={() => handleMoveLayer('forward')} disabled={!selectedShapeId} iconColor="text-orange-500" />
              <TopToolButton icon="fa-angle-down" title="Send Backward" onClick={() => handleMoveLayer('backward')} disabled={!selectedShapeId} iconColor="text-orange-500" />
              <TopToolButton icon="fa-angle-double-down" title="Send to Back" onClick={() => handleMoveLayer('back')} disabled={!selectedShapeId} iconColor="text-orange-700" />
            </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex overflow-hidden min-h-0 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/50">
          {/* Left Sidebar: Drawing Tools */}
          <aside className="w-20 bg-amber-50/30 p-3 flex flex-col items-center gap-3 border-r-2 border-amber-100/50 overflow-y-auto no-scrollbar shrink-0">
            <ToolButton icon="fa-mouse-pointer" label="Select" active={activeTool === 'select'} onClick={() => handleToolSelect('select')} iconColor="text-blue-600" />
            <div className="w-12 h-1 bg-amber-200/50 rounded-full my-1"></div>
            <ToolButton icon="fa-pencil-alt" label="Brush" active={activeTool === 'freehand'} onClick={() => handleToolSelect('freehand')} iconColor="text-emerald-500" />
            <ToolButton icon="fa-slash" label="Line" active={activeTool === 'line'} onClick={() => handleToolSelect('line')} iconColor="text-blue-400" />
            <ToolButton icon="fa-square" label="Rectangle" active={activeTool === 'rect'} onClick={() => handleToolSelect('rect')} iconColor="text-orange-500" />
            <ToolButton icon="fa-circle" label="Circle" active={activeTool === 'circle'} onClick={() => handleToolSelect('circle')} iconColor="text-pink-500" />
            <ToolButton icon="fa-caret-up" label="Triangle" active={activeTool === 'triangle'} onClick={() => handleToolSelect('triangle')} iconColor="text-yellow-500" />
            <ToolButton icon="fa-shapes" label="Library" onClick={() => { setGalleryType('shape'); setIsShapeGalleryOpen(true); }} iconColor="text-violet-500" />
            <ToolButton icon="fa-image" label="Backgrounds" onClick={() => { setGalleryType('background'); setIsShapeGalleryOpen(true); }} iconColor="text-purple-500" />
            <ToolButton icon="fa-text-height" label="Text" active={activeTool === 'text'} onClick={() => handleToolSelect('text')} iconColor="text-indigo-500" />
          </aside>

          {/* Canvas Viewport */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden backdrop-blur-[2px]">
            <div 
              ref={canvasContainerRef}
              className={`bg-white shadow-2xl relative border-8 border-slate-800 ring-2 ring-indigo-100 ${activeTool === 'select' ? (isDragging ? 'cursor-grabbing' : 'cursor-default') : 'cursor-crosshair'} transition-all ${isBackground ? 'rounded-none' : 'rounded-[2rem]'} w-full h-full`}
              style={{ 
                  backgroundImage: showGrid 
                      ? 'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)' 
                      : 'repeating-conic-gradient(#f8fafc 0% 25%, transparent 0% 50%, #f8fafc 50% 75%, transparent 75%)',
                  backgroundSize: showGrid ? '20px 20px' : '20px 20px'
              }}
            >
              <svg ref={svgRef} width={canvasDimensions.width} height={canvasDimensions.height} className={`${isBackground ? 'rounded-none' : 'rounded-[1.5rem]'}`}
                 onMouseDown={handleSvgMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                       {background && (
                            (() => {
                                const commonProps = {
                                  onMouseDown: (e: React.MouseEvent) => handleShapeMouseDown(e, background.id),
                                  style: { cursor: activeTool === 'select' ? (isDragging && selectedShapeId === background.id ? 'grabbing' : 'grab') : 'crosshair' },
                                  fill: background.fill,
                                  stroke: background.stroke,
                                  strokeWidth: background.strokeWidth,
                                };
                                const elementRef = (el: SVGElement | null) => { shapeRefs.current[background.id] = el; };
                                if (background.type === 'rect') return <rect key={background.id} ref={elementRef} {...commonProps} transform={background.transform} x={background.x} y={background.y} width={background.width} height={background.height} />;
                                if (background.type === 'circle') return <ellipse key={background.id} ref={elementRef} {...commonProps} transform={background.transform} cx={background.cx} cy={background.cy} rx={background.rx} ry={background.ry} />;
                                if (background.type === 'line') return <line key={background.id} ref={elementRef} {...commonProps} transform={background.transform} x1={background.x1} y1={background.y1} x2={background.x2} y2={background.y2} strokeLinecap="round"/>;
                                if (background.type === 'triangle') {
                                    const points = `${background.x + background.width / 2},${background.y} ${background.x + background.width},${background.y + background.height} ${background.x},${background.y + background.height}`;
                                    return <polygon key={background.id} ref={elementRef} {...commonProps} transform={background.transform} points={points} />;
                                }
                                if (background.type === 'path') return <path key={background.id} ref={elementRef} {...commonProps} d={background.d} transform={background.transform} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>;
                                if (background.type === 'text') return <text key={background.id} ref={elementRef} {...commonProps} x={background.x} y={background.y} fontSize={background.fontSize} fontFamily={background.fontFamily} transform={background.transform} stroke="none" >{background.text}</text>;
                                return null;
                            })()
                       )}
                  {shapes.map(shape => {
                    const commonProps = {
                      onMouseDown: (e: React.MouseEvent) => handleShapeMouseDown(e, shape.id),
                      style: { cursor: activeTool === 'select' ? (isDragging && selectedShapeId === shape.id ? 'grabbing' : 'grab') : 'crosshair' },
                      fill: shape.fill,
                      stroke: shape.stroke,
                      strokeWidth: shape.strokeWidth,
                    };
                    const elementRef = (el: SVGElement | null) => { shapeRefs.current[shape.id] = el; };
                    if (shape.type === 'rect') return <rect key={shape.id} ref={elementRef} {...commonProps} transform={shape.transform} x={shape.x} y={shape.y} width={shape.width} height={shape.height} />;
                    if (shape.type === 'circle') return <ellipse key={shape.id} ref={elementRef} {...commonProps} transform={shape.transform} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} />;
                    if (shape.type === 'line') return <line key={shape.id} ref={elementRef} {...commonProps} transform={shape.transform} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} strokeLinecap="round"/>;
                    if (shape.type === 'triangle') {
                        const points = `${shape.x + shape.width / 2},${shape.y} ${shape.x + shape.width},${shape.y + shape.height} ${shape.x},${shape.y + shape.height}`;
                        return <polygon key={shape.id} ref={elementRef} {...commonProps} transform={shape.transform} points={points} />;
                    }
                    if (shape.type === 'path') return <path key={shape.id} ref={elementRef} {...commonProps} d={shape.d} transform={shape.transform} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>;
                    if (shape.type === 'text') return <text key={shape.id} ref={elementRef} {...commonProps} x={shape.x} y={shape.y} fontSize={shape.fontSize} fontFamily={shape.fontFamily} transform={shape.transform} stroke="none" >{shape.text}</text>;
                    return null;
                  })}
                  {drawingShape?.type === 'rect' && <rect {...drawingShape} fillOpacity="0.5" />}
                  {drawingShape?.type === 'triangle' && (
                      <polygon points={`${drawingShape.x + drawingShape.width / 2},${drawingShape.y} ${drawingShape.x + drawingShape.width},${drawingShape.y + drawingShape.height} ${drawingShape.x},${drawingShape.y + drawingShape.height}`} fill={drawingShape.fill} stroke={drawingShape.stroke} strokeWidth={drawingShape.strokeWidth} fillOpacity="0.5" />
                  )}
                  {drawingShape?.type === 'circle' && <ellipse {...drawingShape} fillOpacity="0.5" />}
                  {drawingShape?.type === 'line' && <line {...drawingShape} strokeOpacity="0.5" strokeLinecap="round" />}
                  {drawingShape?.type === 'path' && <path {...drawingShape} strokeOpacity="0.5" strokeLinejoin="round" strokeLinecap="round"/>}
                  {selectedShape && (() => {
                      const b = getBoundingBox(selectedShape);
                      const HS = 6; // Handle size
                      const handleProps = { fill: 'white', stroke: '#3b82f6', strokeWidth: 2 };
                      
                      const handleResize = (handle: string, e: React.MouseEvent) => {
                          e.stopPropagation();
                          if (!selectedShape) return;
                          const b = getBoundingBox(selectedShape);
                          setActiveResizeHandle(handle);
                          setResizeStartInfo({ x: e.clientX, y: e.clientY, bBox: b, shape: selectedShape });
                      };

                      return (
                          <g>
                             <rect x={b.x - 2} y={b.y - 2} width={b.width + 4} height={b.height + 4} fill="none" stroke="#3b82f6" strokeWidth="1" strokeDasharray="4 4" pointerEvents="none" />
                             {/* Resize Handles */}
                             <rect x={b.x - HS} y={b.y - HS} width={HS * 2} height={HS * 2} {...handleProps} cursor="nwse-resize" onMouseDown={(e) => handleResize('tl', e)} />
                             <rect x={b.x + b.width - HS} y={b.y - HS} width={HS * 2} height={HS * 2} {...handleProps} cursor="nesw-resize" onMouseDown={(e) => handleResize('tr', e)} />
                             <rect x={b.x - HS} y={b.y + b.height - HS} width={HS * 2} height={HS * 2} {...handleProps} cursor="nesw-resize" onMouseDown={(e) => handleResize('bl', e)} />
                             <rect x={b.x + b.width - HS} y={b.y + b.height - HS} width={HS * 2} height={HS * 2} {...handleProps} cursor="nwse-resize" onMouseDown={(e) => handleResize('br', e)} />
                             
                             {/* Rotation Handle */}
                             <circle cx={b.x + b.width / 2} cy={b.y - HS * 3} r={HS} fill="white" stroke="#3b82f6" strokeWidth="2" cursor="grab" />
                             <text x={b.x + b.width / 2} y={b.y - HS * 3 + 2} textAnchor="middle" fontSize={HS} fill="#3b82f6" pointerEvents="none">↻</text>
                          </g>
                      );
                  })()}
              </svg>
            </div>
          </div>

          {/* Right Sidebar: Layers List (Optimized) */}
          <aside className="w-56 bg-indigo-50/30 flex flex-col border-l-2 border-indigo-100/50 shrink-0 overflow-hidden">
            <div className="p-4 border-b border-indigo-100 flex items-center justify-between bg-white text-indigo-900">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-[0.2em]">Layer Stack</span>
                </div>
                <span className="bg-indigo-600 px-2.5 py-1 rounded-lg text-[10px] text-white font-bold shadow-sm">{shapes.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto flex flex-col gap-4 p-3 no-scrollbar">

                {background && (
                     <div onClick={() => setSelectedShapeId(background.id)} className="group flex flex-col gap-2 p-2 rounded-2xl cursor-pointer transition-all border-2 bg-purple-100 hover:bg-purple-200 border-purple-50 text-slate-600 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center shrink-0">
                                 <i className="fas fa-magic text-purple-400"></i>
                            </div>
                            <span className="flex-1 truncate capitalize font-black text-xs text-purple-900">Editing Background</span>
                        </div>
                    </div>
                )}
                <div className="border-t-2 border-indigo-100/50 my-2"></div>
                {[...shapes].reverse().map((shape, index) => {
                    const actualIndex = shapes.length - 1 - index;
                    return (
                        <div key={shape.id} onClick={() => setSelectedShapeId(shape.id)} className={`group flex items-center gap-3 p-2 rounded-2xl cursor-pointer transition-all border-2 ${selectedShapeId === shape.id ? 'bg-indigo-600 border-indigo-400 shadow-xl -translate-y-0.5' : 'bg-white hover:bg-indigo-100 border-white text-slate-600 shadow-sm'}`}>
                            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden group-hover:scale-110 transition-transform">
                                 <svg viewBox="0 0 100 100" className="w-7 h-7">
                                    {shape.type === 'rect' && <rect x="10" y="10" width="80" height="80" fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth * 2} />}
                                    {shape.type === 'circle' && <circle cx="50" cy="50" r="40" fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth * 2} />}
                                    {shape.type === 'line' && <line x1="10" y1="90" x2="90" y2="10" stroke={shape.stroke} strokeWidth={shape.strokeWidth * 2} />}
                                    {shape.type === 'triangle' && <polygon points="50,10 90,90 10,90" fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth * 2} />}
                                    {shape.type === 'path' && <path d="M20,50 Q50,10 80,50 T50,90" fill={shape.fill} stroke={shape.stroke} strokeWidth={shape.strokeWidth * 2} />}
                                    {shape.type === 'text' && <text x="50" y="65" textAnchor="middle" fontSize="40" fill={shape.fill}>T</text>}
                                 </svg>
                            </div>
                            <span className={`flex-1 truncate capitalize font-black text-xs ${selectedShapeId === shape.id ? 'text-white' : 'text-slate-700'}`}>{shape.type} {actualIndex + 1}</span>
                            <button onClick={(e) => { e.stopPropagation(); pushToHistory(shapes); setShapes(shapes.filter(s => s.id !== shape.id)); if (selectedShapeId === shape.id) setSelectedShapeId(null); }} className={`p-2 rounded-xl transition-all ${selectedShapeId === shape.id ? 'hover:bg-white/20 text-white opacity-60 hover:opacity-100' : 'hover:bg-rose-50 hover:text-rose-500 text-slate-300 opacity-0 group-hover:opacity-100'}`} >
                                <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                        </div>
                    );
                })}
                {shapes.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 opacity-30 text-center animate-in fade-in zoom-in">
                        <div className="bg-indigo-100 p-6 rounded-full mb-4">
                            <i className="fas fa-magic text-4xl text-indigo-400"></i>
                        </div>
                        <p className="text-xs font-black text-indigo-900 uppercase tracking-widest">The Stage is Empty</p>
                        <p className="text-[10px] text-indigo-700 mt-1">Start drawing something fun!</p>
                    </div>
                )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};


export default PaintEditor;
