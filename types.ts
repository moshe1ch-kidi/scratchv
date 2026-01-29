 // Represents the live, changing state of a sprite on the stage.
export interface SpriteState {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    visible: boolean;
    message: string | null;
    direction: number;
}

// Represents the configuration or "definition" of a sprite or text object.
export interface Sprite {
  id: string;
  name: string;
  type: 'image' | 'text';

  // Image-specific
  costume?: string;

  // Text-specific
  content?: string;
  color?: string;
  fontSize?: number; // e.g. 1, 2, 3 for sm, md, lg

  initialState: SpriteState;
  workspaceXml: string; // Blockly XML for this sprite's scripts
}

// Represents a single page or scene in the project.
export interface Page {
  id: string;
  name: string;
  background: string; // CSS background value
  sprites: Sprite[];
}

// FIX: Add LogEntry interface to resolve missing type error in Terminal.tsx.
// Represents a log entry in the terminal.
export interface LogEntry {
  type: 'error' | 'success';
  timestamp: number;
  message: string;
}

// FIX: Add Challenge interface to resolve missing type error in AiTutor.tsx.
// Represents a coding challenge from the AI Tutor.
export interface Challenge {
  title: string;
  description: string;
  difficulty: string;
}
