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

type Shape = RectShape | CircleShape | LineShape | PathShape;
type Tool = 'select' | 'rect' | 'circle' | 'line' | 'freehand';


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


// --- Helper Components ---

const ToolButton: React.FC<{ icon: string, label: string, title?: string, active?: boolean, onClick: () => void, disabled?: boolean, iconColor?: string }> = 
  ({ icon, label, title, active, onClick, disabled, iconColor }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title || label}
      className={`w-16 h-16 flex flex-col items-center justify-center rounded-lg transition-all duration-150 relative border-2
        ${active ? 'bg-blue-500 text-white shadow-inner border-blue-600' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-transparent'}
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      <i className={`fas ${icon} text-2xl ${!active && !disabled ? iconColor : ''}`}></i>
      <span className="text-xs mt-1">{label}</span>
    </button>
);

const TopToolButton: React.FC<{ icon: string, title: string, onClick: () => void, disabled?: boolean, iconColor?: string }> = 
  ({ icon, title, onClick, disabled, iconColor }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`w-10 h-10 flex items-center justify-center rounded-md transition-all duration-150
        ${disabled 
          ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
          : 'bg-white hover:bg-slate-200 text-slate-600 border border-slate-300'
        }
      `}
    >
      <i className={`fas ${icon} text-lg ${!disabled ? iconColor : ''}`}></i>
    </button>
);

const Separator: React.FC = () => <div className="w-px h-8 bg-slate-300 mx-1"></div>;


const ColorSwatch: React.FC<{ color: string, active?: boolean, onClick: () => void }> = 
  ({ color, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-7 h-7 rounded-full transition-transform hover:scale-110
      ${active ? 'ring-2 ring-offset-2 ring-blue-500 ring-offset-white' : ''}
    `}
    style={{ 
        backgroundColor: color, 
        border: (color.toUpperCase() === '#FFFFFF' || color === 'transparent') ? '1px solid #e2e8f0' : 'none',
        backgroundImage: color === 'transparent' ? 'repeating-conic-gradient(#e2e8f0 0% 25%, transparent 0% 50%, #e2e8f0 50% 75%, transparent 75%)' : 'none',
        backgroundSize: '10px 10px'
    }}
  />
);

const ColorPickerTarget: React.FC<{
    type: 'fill' | 'stroke';
    color: string;
    isActive: boolean;
    onClick: () => void;
}> = ({ type, color, isActive, onClick }) => {
    const isFill = type === 'fill';
    const label = isFill ? 'Fill' : 'Stroke';

    return (
        <button
            onClick={onClick}
            title={label}
            className={`relative w-16 h-16 flex flex-col items-center justify-center rounded-lg transition-all duration-150 border-2 ${
                isActive ? 'bg-blue-100 border-blue-500' : 'bg-white border-slate-300 hover:border-slate-400'
            }`}
        >
            {isFill ? (
                <div className="w-8 h-8 rounded" style={{ backgroundColor: color, border: color.toUpperCase() === '#FFFFFF' ? '1px solid #ccc' : 'none' }}></div>
            ) : (
                <div className="w-8 h-8 rounded border-4" style={{ borderColor: color }}></div>
            )}
            <span className="text-xs font-bold text-slate-600 mt-1">{label}</span>
        </button>
    );
};

const COLORS = [
  'transparent', '#000000', '#FFFFFF', '#EF4444', '#F97316', '#F59E0B', '#EAB308', 
  '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'
];

// --- Shape Gallery Component ---
interface ShapeGalleryProps {
  onClose: () => void;
  onSelect: (shape: { name: string; path: string; viewBox: string; defaultColor?: string }) => void;
}
const ShapeGallery: React.FC<ShapeGalleryProps> = ({ onClose, onSelect }) => {
    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div 
                className="bg-slate-50 rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-slate-700">Choose a Shape</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-800 text-2xl">
                        <i className="fas fa-times-circle"></i>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-4">
                        {SHAPES_DATA.map(shape => (
                            <div 
                                key={shape.name} 
                                onClick={() => onSelect(shape)}
                                title={shape.name}
                                className="bg-white p-2 rounded-lg border border-slate-200 cursor-pointer aspect-square flex items-center justify-center transition-all hover:shadow-md hover:border-blue-400 hover:scale-105"
                            >
                                <svg viewBox={shape.viewBox} className="w-full h-full text-slate-700" fill="currentColor">
                                    <path d={shape.path} />
                                </svg>
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
    const translateMatch = transformString.match(/translate\(\s*([0-9-.]+)\s*,?\s*([0-9-.]+)?\s*\)/);
    if (translateMatch) {
        return {
            tx: parseFloat(translateMatch[1] || '0'),
            ty: parseFloat(translateMatch[2] || '0'),
        };
    }
    // Ignoring matrix, scale, rotate for simplicity
    return { tx: 0, ty: 0 };
};

const parseSvgString = (svgText: string): Shape[] => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, "image/svg+xml");
    const svgNode = doc.documentElement;
    if (!svgNode || svgNode.tagName.toLowerCase() !== 'svg') {
        const errorMsg = "Invalid SVG string provided: No root <svg> element found.";
        console.error(errorMsg);
        alert(errorMsg);
        return [];
    }
    
    // Check for parsererror
    const parserErrors = doc.getElementsByTagName("parsererror");
    if (parserErrors.length > 0) {
        const errorMsg = "XML Parsing error: " + parserErrors[0].textContent;
        console.error(errorMsg);
        alert(errorMsg);
        return [];
    }
    const finalShapes: Shape[] = [];

    const traverse = (node: Element, parentTransform: { tx: number; ty: number }) => {
        const nodeTransform = parseTransform(node.getAttribute('transform'));
        const currentTransform = {
            tx: parentTransform.tx + nodeTransform.tx,
            ty: parentTransform.ty + nodeTransform.ty,
        };

        for (const child of Array.from(node.children)) {
            const id = `s-${Date.now()}-${Math.random()}`;
            const fill = child.getAttribute('fill') || 'none';
            const stroke = child.getAttribute('stroke') || 'none';
            const strokeWidth = parseFloat(child.getAttribute('stroke-width') || '0');

            let shape: Shape | null = null;
            
            switch (child.tagName.toLowerCase()) {
                case 'rect':
                    shape = {
                        id, type: 'rect',
                        x: parseFloat(child.getAttribute('x') || '0') + currentTransform.tx,
                        y: parseFloat(child.getAttribute('y') || '0') + currentTransform.ty,
                        width: parseFloat(child.getAttribute('width') || '0'),
                        height: parseFloat(child.getAttribute('height') || '0'),
                        fill, stroke, strokeWidth
                    };
                    break;
                case 'circle':
                case 'ellipse':
                    shape = {
                        id, type: 'circle',
                        cx: parseFloat(child.getAttribute('cx') || '0') + currentTransform.tx,
                        cy: parseFloat(child.getAttribute('cy') || '0') + currentTransform.ty,
                        rx: parseFloat(child.getAttribute('r') || child.getAttribute('rx') || '0'),
                        ry: parseFloat(child.getAttribute('r') || child.getAttribute('ry') || '0'),
                        fill, stroke, strokeWidth
                    };
                    break;
                case 'line':
                     shape = {
                        id, type: 'line',
                        x1: parseFloat(child.getAttribute('x1') || '0') + currentTransform.tx,
                        y1: parseFloat(child.getAttribute('y1') || '0') + currentTransform.ty,
                        x2: parseFloat(child.getAttribute('x2') || '0') + currentTransform.tx,
                        y2: parseFloat(child.getAttribute('y2') || '0') + currentTransform.ty,
                        fill: 'none', stroke, strokeWidth
                    };
                    break;
                case 'path':
                    shape = {
                        id, type: 'path',
                        d: child.getAttribute('d') || '',
                        transform: `translate(${currentTransform.tx}, ${currentTransform.ty})`,
                        fill, stroke, strokeWidth
                    };
                    break;
                case 'g':
                    traverse(child, currentTransform);
                    break;
            }
            if (shape) {
                finalShapes.push(shape);
            }
        }
    };
    
    traverse(svgNode, { tx: 0, ty: 0 });
    return finalShapes;
};


// --- Main Paint Editor Component ---
interface PaintEditorProps {
  onClose: () => void;
  onSave: (svgDataUrl: string) => void;
  initialSprite?: Sprite | null;
}

const PaintEditor: React.FC<PaintEditorProps> = ({ onClose, onSave, initialSprite }) => {
  const [shapes, setShapes] = useState<Shape[]>([]);
  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [fillColor, setFillColor] = useState<string>('#EF4444');
  const [strokeColor, setStrokeColor] = useState<string>('#000000');
  const [activeColorTarget, setActiveColorTarget] = useState<'fill' | 'stroke'>('fill');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [isStrokePickerOpen, setIsStrokePickerOpen] = useState(false);
  const [selectedShapeId, setSelectedShapeId] = useState<string | null>(null);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingShape, setDrawingShape] = useState<Shape | null>(null);
  const [isShapeGalleryOpen, setIsShapeGalleryOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const startPointRef = useRef<{x: number, y: number} | null>(null);
  const shapeRefs = useRef<Record<string, SVGElement | null>>({});
  const dragStartRef = useRef<{ startX: number; startY: number; shapeStart: Record<string, number> } | null>(null);
  const isInitialLoadRef = useRef(false);
  
  // Undo/Redo State
  const historyRef = useRef<{ undo: Shape[][], redo: Shape[][] }>({ undo: [], redo: [] });
  const [historyState, setHistoryState] = useState({ canUndo: false, canRedo: false });


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
            setShapes(parsedShapes);
        } catch (error) {
            console.error("Error loading sprite for editing:", error);
        }
    };
    loadSprite();
  }, [initialSprite]);

  useLayoutEffect(() => {
    if (isInitialLoadRef.current && shapes.length > 0 && svgRef.current) {
        
        let totalBBox = { x: Infinity, y: Infinity, x2: -Infinity, y2: -Infinity };
        let hasContent = false;

        shapes.forEach(shape => {
            const b = getBoundingBox(shape);
            if (b.width > 0 || b.height > 0) {
                hasContent = true;
                const strokeOffset = (shape.strokeWidth || 0) / 2;
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

            const canvasWidth = 480;
            const canvasHeight = 420;
            const canvasCenterX = canvasWidth / 2;
            const canvasCenterY = canvasHeight / 2;

            // Target dimensions (80% of canvas roughly, or with padding)
            const padding = 40; 
            const availableWidth = canvasWidth - padding * 2;
            const availableHeight = canvasHeight - padding * 2;

            // Calculate scale to fit
            let scale = 1;
            if (bboxWidth > 0 && bboxHeight > 0) {
                 const scaleX = availableWidth / bboxWidth;
                 const scaleY = availableHeight / bboxHeight;
                 scale = Math.min(scaleX, scaleY);
            }
            
            // Sanity check for scale
            if (!isFinite(scale) || scale <= 0) scale = 1;

            // Check if transformation is needed (threshold to avoid jitter on already centered images)
            // But since we are enforcing scale, we almost always update unless scale is 1 and centered.
            const dx = canvasCenterX - bboxCenterX;
            const dy = canvasCenterY - bboxCenterY;
            
            // We apply if there is significant movement OR scaling needed.
            // Check diff against scale 1.0 with epsilon
            const isScaleDifferent = Math.abs(scale - 1) > 0.01;
            const isPosDifferent = Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1;

            if (isScaleDifferent || isPosDifferent) {
                setShapes(prevShapes => prevShapes.map(s => {
                    const newShape = { ...s };
                    
                    // Scale stroke width to maintain ratio
                    newShape.strokeWidth = (newShape.strokeWidth || 0) * scale;

                    switch (newShape.type) {
                        case 'rect':
                            newShape.width *= scale;
                            newShape.height *= scale;
                            newShape.x = canvasCenterX + (newShape.x - bboxCenterX) * scale;
                            newShape.y = canvasCenterY + (newShape.y - bboxCenterY) * scale;
                            break;
                        case 'circle':
                            newShape.rx *= scale;
                            newShape.ry *= scale;
                            newShape.cx = canvasCenterX + (newShape.cx - bboxCenterX) * scale;
                            newShape.cy = canvasCenterY + (newShape.cy - bboxCenterY) * scale;
                            break;
                        case 'line':
                            newShape.x1 = canvasCenterX + (newShape.x1 - bboxCenterX) * scale;
                            newShape.y1 = canvasCenterY + (newShape.y1 - bboxCenterY) * scale;
                            newShape.x2 = canvasCenterX + (newShape.x2 - bboxCenterX) * scale;
                            newShape.y2 = canvasCenterY + (newShape.y2 - bboxCenterY) * scale;
                            break;
                        case 'path': {
                            const transform = newShape.transform || '';
                            const translateRegex = /translate\(\s*([0-9-.]+)\s*,?\s*([0-9-.]+)?\s*\)/;
                            const scaleRegex = /scale\(([^)]+)\)/;
                            
                            let tx = 0, ty = 0;
                            const tMatch = transform.match(translateRegex);
                            if (tMatch) {
                                tx = parseFloat(tMatch[1]);
                                ty = parseFloat(tMatch[2] || '0');
                            }
                            
                            let currentS = 1;
                            const sMatch = transform.match(scaleRegex);
                            if (sMatch) {
                                currentS = parseFloat(sMatch[1]);
                            }

                            const newTx = canvasCenterX + (tx - bboxCenterX) * scale;
                            const newTy = canvasCenterY + (ty - bboxCenterY) * scale;
                            const newScale = currentS * scale;

                            let newTransform = transform;
                            
                            // Replace or Append Translate
                            if (tMatch) {
                                newTransform = newTransform.replace(translateRegex, `translate(${newTx}, ${newTy})`);
                            } else {
                                newTransform = `translate(${newTx}, ${newTy}) ${newTransform}`;
                            }
                            
                            // Replace or Append Scale
                            if (sMatch) {
                                newTransform = newTransform.replace(scaleRegex, `scale(${newScale})`);
                            } else {
                                newTransform = `${newTransform} scale(${newScale})`;
                            }
                            
                            newShape.transform = newTransform.replace(/\s+/g, ' ').trim();
                            break;
                        }
                    }
                    return newShape;
                }));
            }
        }
        
        isInitialLoadRef.current = false;
    }
  }, [shapes, initialSprite]);

  const getMousePosition = (e: React.MouseEvent): {x: number, y: number} => {
    if (!svgRef.current) return {x: 0, y: 0};
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const handleShapeMouseDown = (e: React.MouseEvent, shapeId: string) => {
      e.stopPropagation();
      if (activeTool === 'select') {
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
    if (e.target === svgRef.current) {
        setSelectedShapeId(null);
    }

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
            newShape = { id: `s-${Date.now()}`, type: 'rect', x: pos.x, y: pos.y, width: 0, height: 0, fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth };
            break;
        case 'circle':
            newShape = { id: `s-${Date.now()}`, type: 'circle', cx: pos.x, cy: pos.y, rx: 0, ry: 0, fill: fillColor, stroke: strokeColor, strokeWidth: strokeWidth };
            break;
        case 'line':
            newShape = { id: `s-${Date.now()}`, type: 'line', x1: pos.x, y1: pos.y, x2: pos.x, y2: pos.y, fill: 'none', stroke: strokeColor, strokeWidth: strokeWidth };
            break;
        case 'freehand':
            newShape = { id: `s-${Date.now()}`, type: 'path', d: `M${pos.x} ${pos.y}`, fill: 'none', stroke: strokeColor, strokeWidth: strokeWidth };
            break;
    }
    setDrawingShape(newShape);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDrawing && drawingShape && startPointRef.current) {
        const pos = getMousePosition(e);
        switch (drawingShape.type) {
            case 'rect': {
                const startX = startPointRef.current.x;
                const startY = startPointRef.current.y;
                const newX = Math.min(pos.x, startX);
                const newY = Math.min(pos.y, startY);
                setDrawingShape({ ...drawingShape, x: newX, y: newY, width: Math.abs(pos.x - startX), height: Math.abs(pos.y - startY) });
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
      if (drawingShape.type === 'rect') isValid = drawingShape.width > 2 || drawingShape.height > 2;
      else if (drawingShape.type === 'circle') isValid = drawingShape.rx > 2 || drawingShape.ry > 2;
      else if (drawingShape.type === 'line') isValid = Math.abs(drawingShape.x1 - drawingShape.x2) > 2 || Math.abs(drawingShape.y1 - drawingShape.y2) > 2;
      else if (drawingShape.type === 'path') isValid = drawingShape.d.includes('L');
      
      if (isValid) {
         setShapes(prev => [...prev, drawingShape]);
      }
    }

    if (isDragging) {
      pushToHistory(shapes); // Push state *after* drag completes
      setIsDragging(false);
      dragStartRef.current = null;
    }

    setIsDrawing(false);
    setDrawingShape(null);
    startPointRef.current = null;
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
    let finalViewBoxParts = {x: 0, y: 0, w: 480, h: 420};

    if (hasContent) {
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
        viewBox = `0 0 480 420`;
    }

    // Generate SVG string directly from shapes to ensure color accuracy
    const elements = shapes.map(shape => {
        const style = `fill: ${shape.fill}; stroke: ${shape.stroke}; stroke-width: ${shape.strokeWidth};`;
        switch (shape.type) {
            case 'rect':
                return `<rect x="${shape.x}" y="${shape.y}" width="${shape.width}" height="${shape.height}" style="${style}" ${shape.transform ? `transform="${shape.transform}"` : ''} />`;
            case 'circle':
                return `<ellipse cx="${shape.cx}" cy="${shape.cy}" rx="${shape.rx}" ry="${shape.ry}" style="${style}" ${shape.transform ? `transform="${shape.transform}"` : ''} />`;
            case 'line':
                return `<line x1="${shape.x1}" y1="${shape.y1}" x2="${shape.x2}" y2="${shape.y2}" style="${style}" stroke-linecap="round" ${shape.transform ? `transform="${shape.transform}"` : ''} />`;
            case 'path':
                return `<path d="${shape.d}" transform="${shape.transform || ''}" style="${style}" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />`;
            default:
                return '';
        }
    }).join('\n');

    const svgString = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="100%" height="100%">
    <rect x="${finalViewBoxParts.x}" y="${finalViewBoxParts.y}" width="${finalViewBoxParts.w}" height="${finalViewBoxParts.h}" fill="transparent" />
    ${elements}
</svg>`;

    const dataUrl = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgString)))}`;
    onSave(dataUrl);
  };

  const handleDelete = () => {
    if (!selectedShapeId) return;
    pushToHistory(shapes);
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
    
    if (newShape.type === 'rect') { newShape.x += 10; newShape.y += 10; }
    else if (newShape.type === 'circle') { newShape.cx += 10; newShape.cy += 10; }
    else if (newShape.type === 'line') { newShape.x1 += 10; newShape.x2 += 10; newShape.y1 += 10; newShape.y2 += 10; }
    else if (newShape.type === 'path') {
        // Simple translation for paths requires parsing and modifying transform
        if (newShape.transform) {
            const translateRegex = /translate\(([^,)]+),([^)]+)\)/;
            const match = newShape.transform.match(translateRegex);
            if (match) {
                const x = parseFloat(match[1]) + 10;
                const y = parseFloat(match[2]) + 10;
                newShape.transform = newShape.transform.replace(translateRegex, `translate(${x}, ${y})`);
            } else {
                 newShape.transform = `translate(10, 10) ${newShape.transform}`;
            }
        } else {
            newShape.transform = 'translate(10, 10)';
        }
    }

    setShapes(prev => [...prev, newShape]);
    setSelectedShapeId(newShape.id);
  };
  
  const handleToggleFill = () => {
      if (!selectedShapeId) return;
      pushToHistory(shapes);
      setShapes(shapes.map(s => {
          if (s.id === selectedShapeId && (s.type === 'rect' || s.type === 'circle' || s.type === 'path')) {
              return { ...s, fill: s.fill === 'transparent' ? fillColor : 'transparent' };
          }
          return s;
      }));
  };

  const handleMoveLayer = (direction: 'forward' | 'backward') => {
    if (!selectedShapeId) return;
    pushToHistory(shapes);
    const index = shapes.findIndex(s => s.id === selectedShapeId);
    if (index === -1) return;

    if (direction === 'backward' && index === 0) return;
    if (direction === 'forward' && index === shapes.length - 1) return;

    const newShapes = [...shapes];
    const [shape] = newShapes.splice(index, 1);
    const newIndex = direction === 'forward' ? index + 1 : index - 1;
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
            setShapes(prev => prev.map(s => {
                if (s.id !== selectedShapeId) return s;
                if (s.type === 'rect' || s.type === 'circle' || s.type === 'path') {
                    return { ...s, fill: color };
                }
                return s;
            }));
        }
    } else { // activeColorTarget === 'stroke'
        setStrokeColor(color);
        if (selectedShapeId) {
            setShapes(prev => prev.map(s => 
                s.id === selectedShapeId ? { ...s, stroke: color } : s
            ));
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
    const canvasWidth = 480;
    const canvasHeight = 420;
    const targetSize = 100;

    const viewBoxParts = shapeData.viewBox.split(' ').map(Number);
    const [vbX, vbY, vbW, vbH] = viewBoxParts.length === 4 ? viewBoxParts : [0, 0, 24, 24];
    
    const scale = targetSize / Math.max(vbW, vbH);
    // Adjust translation to account for viewBox offset
    const translatedX = (canvasWidth / 2) - ((vbX + vbW / 2) * scale);
    const translatedY = (canvasHeight / 2) - ((vbY + vbH / 2) * scale);

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
  
  const SCALE_FACTOR = 1.1;
  const handleGrow = () => handleScale(SCALE_FACTOR);
  const handleShrink = () => handleScale(1 / SCALE_FACTOR);

  const handleFlipHorizontal = () => {
    if (!selectedShapeId) return;
    pushToHistory(shapes);
    setShapes(prevShapes => prevShapes.map(s => {
        if (s.id !== selectedShapeId) return s;                
        const newShape = { ...s };
        if (newShape.type === 'line') {
            const bbox = getBoundingBox(newShape);
            const cx = bbox.x + bbox.width / 2;
            newShape.x1 = 2 * cx - newShape.x1;
            newShape.x2 = 2 * cx - newShape.x2;
        } else if (newShape.type === 'path') {
             const bbox = getBoundingBox(newShape);
             const cx = bbox.x + bbox.width / 2;
             newShape.transform = `translate(${2 * cx}, 0) scale(-1, 1) ${newShape.transform || ''}`.trim();
        }
        return newShape;
    }));
  };

  const handleRotate = () => {
    if (!selectedShapeId) return;
    pushToHistory(shapes);
    setShapes(prevShapes => prevShapes.map(s => {
        if (s.id !== selectedShapeId) return s;                
        const newShape = { ...s };
        const bbox = getBoundingBox(newShape);
        const cx = bbox.x + bbox.width / 2;
        const cy = bbox.y + bbox.height / 2;
        
        const transform = newShape.transform || '';
        // Rotate 20 degrees cumulatively
        newShape.transform = `rotate(20, ${cx}, ${cy}) ${transform}`.trim();

        return newShape;
    }));
  };

  const handleScale = (factor: number) => {
    if (!selectedShapeId) return;
    pushToHistory(shapes);
    setShapes(prevShapes => prevShapes.map(s => {
        if (s.id !== selectedShapeId) return s;

        const newShape = { ...s };

        switch (newShape.type) {
            case 'rect': {
                const cx = newShape.x + newShape.width / 2;
                const cy = newShape.y + newShape.height / 2;
                newShape.width *= factor;
                newShape.height *= factor;
                newShape.x = cx - newShape.width / 2;
                newShape.y = cy - newShape.height / 2;
                break;
            }
            case 'circle': {
                newShape.rx *= factor;
                newShape.ry *= factor;
                break;
            }
            case 'line': {
                const cx = (newShape.x1 + newShape.x2) / 2;
                const cy = (newShape.y1 + newShape.y2) / 2;
                newShape.x1 = cx + (newShape.x1 - cx) * factor;
                newShape.y1 = cy + (newShape.y1 - cy) * factor;
                newShape.x2 = cx + (newShape.x2 - cx) * factor;
                newShape.y2 = cy + (newShape.y2 - cy) * factor;
                break;
            }
            case 'path': {
                 const element = shapeRefs.current[newShape.id];
                if (!element || !(element instanceof SVGGraphicsElement)) break;

                const bbox = element.getBBox();
                const cx = bbox.x + bbox.width / 2;
                const cy = bbox.y + bbox.height / 2;
                
                const transform = newShape.transform || '';
                const scaleRegex = /scale\(([^)]+)\)/;
                const translateRegex = /translate\(([^,)]+),([^)]+)\)/;

                let currentScale = 1;
                const scaleMatch = transform.match(scaleRegex);
                if (scaleMatch) currentScale = parseFloat(scaleMatch[1]);
                
                let tx = 0, ty = 0;
                const translateMatch = transform.match(translateRegex);
                if (translateMatch) {
                    tx = parseFloat(translateMatch[1]);
                    ty = parseFloat(translateMatch[2]);
                }

                const newScale = currentScale * factor;
                // This formula adjusts translation to keep the shape centered during scaling
                const newTx = tx + cx * currentScale - cx * newScale;
                const newTy = ty + cy * currentScale - cy * newScale;

                let newTransform = transform;
                // Replace or add scale
                if (scaleMatch) {
                    newTransform = newTransform.replace(scaleRegex, `scale(${newScale})`);
                } else {
                    newTransform = `${newTransform} scale(${newScale})`.trim();
                }
                // Replace or add translate
                if (translateMatch) {
                    newTransform = newTransform.replace(translateRegex, `translate(${newTx}, ${newTy})`);
                } else {
                    // This case should be rare if shapes are always added with translation
                    newTransform = `translate(${newTx}, ${newTy}) ${newTransform}`.trim();
                }
                
                newShape.transform = newTransform;
                break;
            }
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
    
    // Fallback
    switch (shape.type) {
        case 'rect': return { x: shape.x, y: shape.y, width: shape.width, height: shape.height };
        case 'circle': return { x: shape.cx - shape.rx, y: shape.cy - shape.ry, width: shape.rx * 2, height: shape.ry * 2 };
        case 'line':
            return { x: Math.min(shape.x1, shape.x2), y: Math.min(shape.y1, shape.y2), width: Math.abs(shape.x1 - shape.x2), height: Math.abs(shape.y1 - shape.y2) };
        case 'path': return { x: 0, y: 0, width: 0, height: 0 };
    }
  };

  const selectedShape = shapes.find(s => s.id === selectedShapeId);
  
  const handleToolSelect = (tool: Tool) => {
    setActiveTool(tool);
    if (tool !== 'select') setSelectedShapeId(null);
  };
  
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      {isShapeGalleryOpen && <ShapeGallery onClose={() => setIsShapeGalleryOpen(false)} onSelect={handleSelectShape} />}
      <div className="bg-slate-200 rounded-xl shadow-2xl w-full h-full flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white p-2 border-b border-slate-300 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-slate-700 ml-4">Paint Editor</h2>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold">Save Sprite</button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div className="flex flex-col bg-white shadow-lg rounded-lg overflow-hidden">
            {/* Top Toolbar */}
            <div className="p-2 border-b border-slate-200 flex items-center gap-2 bg-slate-50 flex-wrap justify-center">
                <TopToolButton icon="fa-undo" title="Undo" onClick={handleUndo} disabled={!historyState.canUndo} iconColor="text-blue-500" />
                <TopToolButton icon="fa-redo" title="Redo" onClick={handleRedo} disabled={!historyState.canRedo} iconColor="text-blue-500" />
                <Separator />
                <TopToolButton icon="fa-fill-drip" title="Fill" onClick={handleToggleFill} disabled={!selectedShapeId || (selectedShape?.type === 'line')} iconColor="text-purple-500" />
                <TopToolButton icon="fa-clone" title="Duplicate" onClick={handleDuplicate} disabled={!selectedShapeId} iconColor="text-green-500" />
                <TopToolButton icon="fa-search-plus" title="Grow" onClick={handleGrow} disabled={!selectedShapeId} iconColor="text-cyan-500" />
                <TopToolButton icon="fa-search-minus" title="Shrink" onClick={handleShrink} disabled={!selectedShapeId} iconColor="text-cyan-500" />
                <TopToolButton icon="fa-trash" title="Delete" onClick={handleDelete} disabled={!selectedShapeId} iconColor="text-red-500" />
                <Separator />
                <TopToolButton icon="fa-arrows-alt-h" title="Flip Horizontal" onClick={handleFlipHorizontal} disabled={!selectedShapeId || selectedShape?.type === 'line'} iconColor="text-teal-500" />
                <TopToolButton icon="fa-sync-alt" title="Rotate" onClick={handleRotate} disabled={!selectedShapeId || selectedShape?.type === 'line'} iconColor="text-teal-500" />
                <Separator />
                <TopToolButton icon="fa-arrow-up" title="Bring Forward" onClick={() => handleMoveLayer('forward')} disabled={!selectedShapeId} iconColor="text-orange-500" />
                <TopToolButton icon="fa-arrow-down" title="Send Backward" onClick={() => handleMoveLayer('backward')} disabled={!selectedShapeId} iconColor="text-orange-500" />
            </div>
            <div className="flex">
              {/* Left Toolbar */}
              <aside className="w-24 bg-slate-100 p-3 flex flex-col items-center gap-3 border-r border-slate-200">
                <ToolButton icon="fa-mouse-pointer" label="Select" active={activeTool === 'select'} onClick={() => handleToolSelect('select')} iconColor="text-blue-600" />
                <div className="w-full border-t border-slate-200 my-1"></div>
                <ToolButton icon="fa-slash" label="Line" active={activeTool === 'line'} onClick={() => handleToolSelect('line')} iconColor="text-sky-600" />
                <ToolButton icon="fa-square" label="Rectangle" active={activeTool === 'rect'} onClick={() => handleToolSelect('rect')} iconColor="text-sky-600" />
                <ToolButton icon="fa-circle" label="Circle" active={activeTool === 'circle'} onClick={() => handleToolSelect('circle')} iconColor="text-sky-600" />
                <ToolButton icon="fa-shapes" label="Shapes" onClick={() => setIsShapeGalleryOpen(true)} iconColor="text-purple-600" />
                <ToolButton icon="fa-pencil-alt" label="Freehand" active={activeTool === 'freehand'} onClick={() => handleToolSelect('freehand')} iconColor="text-sky-600" />
              </aside>

              {/* Canvas Area */}
              <div 
                className={`w-[480px] h-[420px] bg-white bg-checkered ${activeTool === 'select' ? (isDragging ? 'cursor-grabbing' : 'cursor-default') : 'cursor-crosshair'}`}
                onMouseDown={handleSvgMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
              >
                <svg ref={svgRef} width="100%" height="100%">
                    {shapes.map(shape => {
                      const commonProps = {
                        onMouseDown: (e: React.MouseEvent) => handleShapeMouseDown(e, shape.id),
                        style: { cursor: activeTool === 'select' ? (isDragging && selectedShapeId === shape.id ? 'grabbing' : 'grab') : 'crosshair' },
                        fill: shape.fill,
                        stroke: shape.stroke,
                        strokeWidth: shape.strokeWidth,
                      };
                      
                      const elementRef = (el: SVGElement | null) => { shapeRefs.current[shape.id] = el; };

                      if (shape.type === 'rect') {
                          return <rect key={shape.id} ref={elementRef} {...commonProps} transform={shape.transform} x={shape.x} y={shape.y} width={shape.width} height={shape.height} />;
                      }
                      if (shape.type === 'circle') {
                          return <ellipse key={shape.id} ref={elementRef} {...commonProps} transform={shape.transform} cx={shape.cx} cy={shape.cy} rx={shape.rx} ry={shape.ry} />;
                      }
                      if (shape.type === 'line') {
                          return <line key={shape.id} ref={elementRef} {...commonProps} transform={shape.transform} x1={shape.x1} y1={shape.y1} x2={shape.x2} y2={shape.y2} strokeLinecap="round"/>;
                      }
                      if (shape.type === 'path') {
                          return <path key={shape.id} ref={elementRef} {...commonProps} d={shape.d} transform={shape.transform} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>;
                      }
                      return null;
                    })}
                    {drawingShape?.type === 'rect' && <rect {...drawingShape} fillOpacity="0.5" />}
                    {drawingShape?.type === 'circle' && <ellipse {...drawingShape} fillOpacity="0.5" />}
                    {drawingShape?.type === 'line' && <line {...drawingShape} strokeOpacity="0.5" strokeLinecap="round" />}
                    {drawingShape?.type === 'path' && <path {...drawingShape} strokeOpacity="0.5" strokeLinejoin="round" strokeLinecap="round"/>}
                    {selectedShape && (() => {
                        const b = getBoundingBox(selectedShape);
                        return <rect id="selection-box" x={b.x-4} y={b.y-4} width={b.width+8} height={b.height+8} fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4 4" pointerEvents="none" />;
                    })()}
                </svg>
              </div>

            </div>
             {/* Color Palette */}
            <div className="p-3 border-t border-slate-200 flex justify-center items-center gap-4 bg-white">
                <div className="flex gap-2">
                    <ColorPickerTarget
                        type="fill"
                        color={fillColor}
                        isActive={activeColorTarget === 'fill'}
                        onClick={() => setActiveColorTarget('fill')}
                    />
                    <ColorPickerTarget
                        type="stroke"
                        color={strokeColor}
                        isActive={activeColorTarget === 'stroke'}
                        onClick={() => setActiveColorTarget('stroke')}
                    />
                </div>
                <div className="w-px h-16 bg-slate-200"></div>
                <div className="grid grid-cols-9 gap-2">
                    {COLORS.map(color => (
                        <ColorSwatch 
                            key={color} 
                            color={color} 
                            active={(activeColorTarget === 'fill' && fillColor === color) || (activeColorTarget === 'stroke' && strokeColor === color)}
                            onClick={() => handleColorChange(color)} 
                        />
                    ))}
                </div>
                 <div className="w-px h-16 bg-slate-200"></div>
                <div className="relative">
                    <ToolButton icon="fa-ruler-horizontal" label={`${strokeWidth}px`} onClick={() => setIsStrokePickerOpen(p => !p)} iconColor="text-slate-500" />
                    {isStrokePickerOpen && (
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2 border z-10">
                            {[2, 4, 8, 16].map(w => (
                                <button key={w} onClick={() => handleStrokeWidthChange(w)} className={`w-12 h-8 rounded flex items-center justify-center ${strokeWidth === w ? 'bg-blue-200' : 'bg-slate-100 hover:bg-slate-200'}`}>
                                    <div style={{height: `${w}px`}} className="w-full bg-slate-800 rounded-full"></div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PaintEditor;
