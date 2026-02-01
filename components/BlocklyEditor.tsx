import React, { useState, useRef } from 'react';
import Blockly from 'blockly';
import * as BlocklyJS from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import './BlocklyStyles.css';
import { Page } from '../types';

// Initialize locale
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const locale = (En as any).default || En;
Blockly.setLocale(locale);

// --- Generator Import Compatibility ---
const getJavascriptGenerator = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lib = BlocklyJS as any;
  if (lib.javascriptGenerator) return lib.javascriptGenerator;
  if (lib.default) {
      if (lib.default.workspaceToCode) return lib.default;
      if (lib.default.javascriptGenerator) return lib.default.javascriptGenerator;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (typeof window !== 'undefined' && (window as any).Blockly?.JavaScript) return (window as any).Blockly.JavaScript;
  if (lib.JavascriptGenerator) {
      try { return new lib.JavascriptGenerator('JavaScript'); } catch (e) { console.warn(e); }
  }
  if (typeof lib.workspaceToCode === 'function') return lib;
  return null;
};

const javascriptGenerator = getJavascriptGenerator();

// Helper to safely register block generators
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registerGenerator = (blockName: string, generatorFn: (block: any) => string | [string, any]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const generator = javascriptGenerator as any;
    if (!generator) return;
    
    if (generator.forBlock) {
        generator.forBlock[blockName] = generatorFn;
    } else {
        try { generator[blockName] = generatorFn; } catch (e) {}
    }
};

// --- Custom Renderer for Taller Blocks ---
const registerTallRenderer = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const B = Blockly as any;
    
    if (B.registry && B.registry.registry_ && B.registry.registry_['renderer'] && B.registry.registry_['renderer']['tall']) {
        return;
    }

    if (B.geras && B.blockRendering) {
        class TallConstantProvider extends B.geras.ConstantProvider {
            constructor() {
                super();
                this.MIN_BLOCK_HEIGHT = 80; // Increased for uniform block height
                this.ROW_HEIGHT = 80;       // Increased for uniform block height
                this.FIELD_BORDER_RECT_Y_PADDING = 12; 
                this.FIELD_BORDER_RECT_HEIGHT = 32;
                this.FIELD_BORDER_RECT_X_PADDING = 10;
            }
        }

        class TallRenderer extends B.geras.Renderer {
            constructor(name: string) {
                super(name);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            makeConstants_() {
                return new TallConstantProvider();
            }
        }

        try {
             B.blockRendering.register('tall', TallRenderer);
        } catch(e) {
            console.warn("Renderer registration failed", e);
        }
    }
};

registerTallRenderer();


// --- Custom Field with Visual Numpad ---
class Number99Field extends Blockly.FieldNumber {
    // FIX: isSerializable must be a function to match the base class `FieldNumber`.
    public isSerializable() { return true; }

    constructor(value: string | number) {
        // Changed limit to 9999 to support larger pixel values
        super(value, 0, 9999, 1);
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    showEditor_() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const B = Blockly as any;
        if (!B.DropDownDiv) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sourceBlock = (this as any).sourceBlock_;
        const blockColor = sourceBlock?.getColour() || '#ffffff';
        
        let textColor = blockColor;
        if (blockColor.toUpperCase() === '#FFD700' || blockColor.toUpperCase() === '#FFFF00') {
             textColor = '#B45309'; 
        }

        B.DropDownDiv.hideWithoutAnimation();
        B.DropDownDiv.clearContent();
        const contentDiv = B.DropDownDiv.getContentDiv();
        
        const wrapper = document.createElement('div');
        wrapper.className = 'blocklyNumpad';

        const display = document.createElement('div');
        display.className = 'blocklyNumpadDisplay';
        // Start clean (empty) instead of showing current value
        display.textContent = ''; 
        display.style.color = textColor;
        wrapper.appendChild(display);

        const grid = document.createElement('div');
        grid.className = 'blocklyNumpadGrid';

        const handleDigit = (digit: string) => {
            // Read from display to build new value
            let current = display.textContent || '';
            // Allow up to 4 digits
            if (current.length < 4) {
                const newVal = current + digit;
                (this as Blockly.FieldNumber).setValue(newVal);
                display.textContent = newVal;
            }
        };

        const handleBackspace = () => {
            let current = display.textContent || '';
            if (current.length > 0) {
                current = current.slice(0, -1);
                // Update field value. If empty string, set to 0 to keep block valid.
                (this as Blockly.FieldNumber).setValue(current === '' ? 0 : current);
                display.textContent = current;
            }
        };

        const handleOk = () => {
             B.DropDownDiv.hideIfOwner(this);
        };

        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(num => {
            const btn = document.createElement('button');
            btn.textContent = String(num);
            btn.className = 'blocklyNumpadBtn';
            btn.style.color = textColor;
            // Use onpointerdown for immediate response anywhere on the button
            btn.onpointerdown = (e) => { 
                e.preventDefault(); 
                e.stopPropagation(); 
                handleDigit(String(num)); 
            };
            grid.appendChild(btn);
        });

        const delBtn = document.createElement('button');
        delBtn.innerHTML = '<i class="fas fa-arrow-left"></i>'; 
        delBtn.className = 'blocklyNumpadBtn blocklyNumpadAction';
        delBtn.onpointerdown = (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            handleBackspace(); 
        };
        grid.appendChild(delBtn);

        const zeroBtn = document.createElement('button');
        zeroBtn.textContent = '0';
        zeroBtn.className = 'blocklyNumpadBtn';
        zeroBtn.style.color = textColor;
        zeroBtn.onpointerdown = (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            handleDigit('0'); 
        };
        grid.appendChild(zeroBtn);

        const okBtn = document.createElement('button');
        okBtn.innerHTML = '<i class="fas fa-check"></i>';
        okBtn.className = 'blocklyNumpadBtn blocklyNumpadOk';
        okBtn.onpointerdown = (e) => { 
            e.preventDefault(); 
            e.stopPropagation(); 
            handleOk(); 
        };
        grid.appendChild(okBtn);

        wrapper.appendChild(grid);
        contentDiv.appendChild(wrapper);
        B.DropDownDiv.setColour(blockColor, blockColor); 
        B.DropDownDiv.showPositionedByField(this, () => {});
    }
}


// --- Custom Field for Sound Recording ---
class FieldSoundRecorder extends Blockly.Field {
    public isSerializable() { return true; }
    
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private stream: MediaStream | null = null;
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private animationFrameId: number | null = null;

    constructor(value: string) {
        super(value);
    }

    /**
     * @override
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static fromJson(options: any) {
        return new this(options['value']);
    }

    getText() {
        return `Recording ${(this as Blockly.Field).getValue()}`;
    }

    showEditor_() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const B = Blockly as any;
        if (!B.DropDownDiv) return;

        B.DropDownDiv.hideWithoutAnimation();
        B.DropDownDiv.clearContent();
        const contentDiv = B.DropDownDiv.getContentDiv();

        const wrapper = document.createElement('div');
        wrapper.className = 'blocklySoundRecorder';
        
        const recordBtn = document.createElement('button');
        recordBtn.className = 'blocklySoundRecorder-btn record';
        recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record';

        const canvas = document.createElement('canvas');
        canvas.className = 'blocklySoundRecorder-canvas';
        canvas.style.display = 'none';

        const listDiv = document.createElement('div');
        listDiv.className = 'blocklySoundRecorder-list';
        
        wrapper.appendChild(recordBtn);
        wrapper.appendChild(canvas);
        wrapper.appendChild(listDiv);
        contentDiv.appendChild(wrapper);

        const populateList = () => {
            listDiv.innerHTML = '';
            const recordings = this.getRecordings();
            if (recordings.length === 0) {
                 listDiv.innerHTML = '<div class="empty-list">No recordings. Click above to record!</div>';
            }
            recordings.forEach(rec => {
                const item = document.createElement('div');
                item.className = 'list-item';
                item.textContent = `Recording ${rec.id}`;
                item.onclick = (e) => {
                    e.stopPropagation();
                    (this as Blockly.Field).setValue(rec.id);
                    B.DropDownDiv.hideIfOwner(this);
                };

                const controls = document.createElement('div');
                controls.className = 'item-controls';

                const playBtn = document.createElement('button');
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
                playBtn.onclick = (e) => { e.stopPropagation(); this.playRecording(rec.key); };

                const deleteBtn = document.createElement('button');
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (confirm(`Delete "Recording ${rec.id}"?`)) {
                        localStorage.removeItem(rec.key);
                        populateList();
                    }
                };

                controls.appendChild(playBtn);
                controls.appendChild(deleteBtn);
                item.appendChild(controls);
                listDiv.appendChild(item);
            });
        };

        recordBtn.onclick = (e) => {
            e.stopPropagation();
            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                this.stopRecording();
                recordBtn.innerHTML = '<i class="fas fa-microphone"></i> Record';
                recordBtn.classList.remove('recording');
                canvas.style.display = 'none';
                setTimeout(populateList, 100);
            } else {
                this.startRecording(canvas);
                recordBtn.innerHTML = '<i class="fas fa-stop"></i> Stop';
                recordBtn.classList.add('recording');
                canvas.style.display = 'block';
            }
        };

        populateList();
        B.DropDownDiv.setColour('#7ED321', '#7ED321');
        B.DropDownDiv.showPositionedByField(this, () => {
            this.stopRecording(); // ensure everything is stopped on close
        });
    }
    
    getRecordings() {
        const recordings: {key: string, id: string}[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('recording_')) {
                recordings.push({ key, id: key.replace('recording_', '') });
            }
        }
        recordings.sort((a,b) => parseInt(a.id) - parseInt(b.id));
        return recordings;
    }
    
    async startRecording(canvas: HTMLCanvasElement) {
        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(this.stream);
            this.audioChunks = [];
            
            this.mediaRecorder.addEventListener("dataavailable", event => {
                this.audioChunks.push(event.data);
            });
            
            this.mediaRecorder.start();
            this.visualize(canvas);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone. Please check permissions.");
        }
    }
    
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(this.audioChunks);
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    this.saveRecording(base64data);
                };
            });
            this.mediaRecorder.stop();
        }
        
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }

        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
    }

    saveRecording(base64data: string) {
        const recordings = this.getRecordings();
        const nextId = recordings.length > 0 ? Math.max(...recordings.map(r => parseInt(r.id))) + 1 : 1;
        localStorage.setItem(`recording_${nextId}`, base64data);
    }
    
    playRecording(key: string) {
        const base64Audio = localStorage.getItem(key);
        if (base64Audio) {
            const audio = new Audio(base64Audio);
            audio.play();
        }
    }

    visualize(canvas: HTMLCanvasElement) {
        if (!this.stream) return;
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.analyser = this.audioContext.createAnalyser();
        const source = this.audioContext.createMediaStreamSource(this.stream);
        source.connect(this.analyser);
        
        this.analyser.fftSize = 256;
        const bufferLength = this.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const canvasCtx = canvas.getContext('2d');
        if (!canvasCtx) return;

        const draw = () => {
            if (!this.analyser) return;
            this.animationFrameId = requestAnimationFrame(draw);
            this.analyser.getByteTimeDomainData(dataArray);

            canvasCtx.fillStyle = '#f8fafc';
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            canvasCtx.lineWidth = 2;
            canvasCtx.strokeStyle = '#7ED321';
            canvasCtx.beginPath();
            
            const sliceWidth = canvas.width * 1.0 / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = v * canvas.height / 2;
                if (i === 0) {
                    canvasCtx.moveTo(x, y);
                } else {
                    canvasCtx.lineTo(x, y);
                }
                x += sliceWidth;
            }

            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };
        draw();
    }
}

// Check if already registered to avoid errors on hot reload
if (!Blockly.registry.getClass(Blockly.registry.Type.FIELD, 'field_sound_recorder')) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Blockly.fieldRegistry.register('field_sound_recorder', FieldSoundRecorder as any);
}

// --- Icons (Base64 encoded SVGs) ---
const ICONS = {
    flag: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/greenFlag.svg",
    tap: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/OnTouch.svg",
    bump: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Bump.svg", 
    
    // Motion
    right: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Foward.svg",
    left: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Back.svg",
    up: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Up.svg",
    down: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Down.svg",
    turnRight: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Right.svg",
    turnLeft: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Left.svg",
    hop: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Hop.svg",
    home: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Home.svg",
    
    // Looks
    say: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Say.svg",
    grow: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Grow.svg",
    shrink: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Shrink.svg",
    resetSize: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Reset.svg",
    hide: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Disappear.svg",
    show: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Appear.svg",

    // Sound
    pop: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Speaker.svg",
    record: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Microphone.svg",

    // Control
    wait: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Wait.svg",
    speed: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Speed.svg",
    repeat: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Repeat.svg", 

    // End
    forever: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Forever.svg",
    gotoPage: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/GoToPage.svg",
};

const COLORS = {
    TRIGGER: '#FFD700', // Yellow
    MOTION: '#4A90E2',  // Blue
    LOOKS: '#9013FE',   // Purple
    SOUND: '#7ED321',   // Green
    CONTROL: '#F5A623', // Orange
    END: '#D0021B'      // Red
};

// Map of category names to their lighter background colors
const CATEGORY_BG_COLORS: Record<string, string> = {
    'Events': '#FEF9C3',  // Lighter Yellow
    'Motion': '#E0F2FE',  // Lighter Blue
    'Looks': '#F3E8FF',   // Lighter Purple
    'Sound': '#DCFCE7',   // Lighter Green
    'Control': '#FFEDD5', // Lighter Orange
    'End': '#FEE2E2',     // Lighter Red
};

// Graphical Envelopes for Receive block
const ENVELOPE_OPTIONS = [
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Orange.svg', 'width': 60, 'height': 50, 'alt': 'Orange'}, 'orange'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Red.svg', 'width': 60, 'height': 50, 'alt': 'Red'}, 'red'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Yellow.svg', 'width': 60, 'height': 50, 'alt': 'Yellow'}, 'yellow'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Green.svg', 'width': 60, 'height': 50, 'alt': 'Green'}, 'green'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Blue.svg', 'width': 60, 'height': 50, 'alt': 'Blue'}, 'blue'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Purple.svg', 'width': 60, 'height': 50, 'alt': 'Purple'}, 'purple'],
];

// Graphical Envelopes for Send block
const SEND_ENVELOPE_OPTIONS = [
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Orange.svg', 'width': 60, 'height': 50, 'alt': 'Orange'}, 'orange'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Red.svg', 'width': 60, 'height': 50, 'alt': 'Red'}, 'red'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Yellow.svg', 'width': 60, 'height': 50, 'alt': 'Yellow'}, 'yellow'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Green.svg', 'width': 60, 'height': 50, 'alt': 'Green'}, 'green'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Blue.svg', 'width': 60, 'height': 50, 'alt': 'Blue'}, 'blue'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Purple.svg', 'width': 60, 'height': 50, 'alt': 'Purple'}, 'purple'],
];

// Graphical options for Set Speed block
const SPEED_OPTIONS = [
    // Medium is first to be the default
    [{ 'src': 'https://codejr.org/scratchjr/assets/blockicons/speed1.svg', 'width': 60, 'height': 50, 'alt': 'Medium' }, 'medium'],
    [{ 'src': 'https://codejr.org/scratchjr/assets/blockicons/speed0.svg', 'width': 60, 'height': 50, 'alt': 'Slow' }, 'slow'],
    [{ 'src': 'https://codejr.org/scratchjr/assets/blockicons/speed2.svg', 'width': 60, 'height': 50, 'alt': 'Fast' }, 'fast'],
];

// Generate dynamic SVG icon for pages with number overlay
const generatePageIcon = (background: string, number: number) => {
    let bgElement = '';
    
    // Check if background is a data URI image or looks like a URL (which we likely pre-converted to base64)
    // We treat anything starting with 'data:image' or 'http' as an image source for <image>.
    if (background.trim().startsWith('data:image') || background.trim().startsWith('http')) {
        bgElement = `<image href="${background}" x="0" y="0" width="60" height="50" preserveAspectRatio="xMidYMid slice" />`;
    } else {
        // Assume color
        const fillColor = background || '#ffffff';
        bgElement = `<rect x="0" y="0" width="60" height="50" rx="4" fill="${fillColor}" stroke="#cbd5e1" stroke-width="2"/>`;
    }

    // SVG with background and a large, high-contrast number overlay
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="50" viewBox="0 0 60 50">
        ${bgElement}
        <!-- Semi-transparent overlay to ensure text contrast -->
        <rect x="15" y="10" width="30" height="30" rx="15" fill="rgba(255,255,255,0.7)" />
        <text x="50%" y="52%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="900" fill="#334155" stroke="white" stroke-width="0.5">${number}</text>
    </svg>`;
    
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Dynamic provider for page options
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let getPageOptions: () => any[][] = () => [[{src: generatePageIcon('#ffffff', 1), width: 60, height: 50, alt: 'Page 1'}, '1']];

const initializeBlocks = () => {
    /**
     * Helper to create an image dropdown that adds tooltips to its items.
     * It overrides the showEditor_ method to post-process the DOM after rendering.
     * @param options The array of options for the dropdown.
     * @returns A Blockly.FieldDropdown instance with tooltip functionality.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createImageDropdownWithTooltips = (options: any) => {
        const dropdown = new Blockly.FieldDropdown(options);
        const originalShowEditor = (dropdown as any).showEditor_;
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (dropdown as any).showEditor_ = function() {
            // `this` refers to the dropdown field instance here
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const self = this as any;
            
            // Call original function to render the menu
            originalShowEditor.call(self);
            
            // Now that the menu is rendered, we can access its DOM elements
            const menu = self.menu_ as Blockly.Menu;
            // Use the standard Blockly API to iterate through menu items, which is more robust
            // than the potentially non-existent `getChildren` method.
            // FIX: Cast `menu` to `any` to bypass TypeScript type errors for `getChildCount` and `getChildAt`,
            // which may not be in the type definitions but exist on the object at runtime.
            // The `typeof` check already ensures runtime safety.
            if (menu && menu.getElement() && typeof (menu as any).getChildCount === 'function') {
                const menuOptions = self.getOptions(false);
                const childCount = (menu as any).getChildCount();

                for (let i = 0; i < childCount; i++) {
                    const menuItem = (menu as any).getChildAt(i) as Blockly.MenuItem | null;
                    if (!menuItem) continue;
                    
                    // Check if menuOptions has an entry for this index to prevent errors
                    if (i >= menuOptions.length) continue;
                    
                    const optionData = menuOptions[i][0]; // The image object
                    const menuItemElement = menuItem.getElement();
                    
                    // Add a 'title' attribute to the menu item's DOM element for the tooltip
                    if (menuItemElement && typeof optionData === 'object' && optionData.alt) {
                        menuItemElement.setAttribute('title', optionData.alt);
                    }
                }
            }
        };
        return dropdown;
    };


    // --- 1. TRIGGERS (Yellow) ---
    // Registers Pass-through generators for Click-to-Run logic
    registerGenerator('event_flag', () => '');
    registerGenerator('event_tap', () => '');
    registerGenerator('event_bump', () => '');
    registerGenerator('event_message', () => '');

    Blockly.Blocks['event_flag'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ') // Spacer to move icon right
                .appendField(new Blockly.FieldImage(ICONS.flag, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')); // Spacer for width
            this.setNextStatement(true, null);
            this.setColour(COLORS.TRIGGER);
            this.setTooltip("Start on Green Flag");
        }
    };
    // No generator needed here, handled by workspace loop

    Blockly.Blocks['event_tap'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ') // Spacer to move icon right
                .appendField(new Blockly.FieldImage(ICONS.tap, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')); // Spacer for width
            this.setNextStatement(true, null);
            this.setColour(COLORS.TRIGGER);
            this.setTooltip("Start on Tap");
        }
    };

    Blockly.Blocks['event_bump'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ') // Spacer to move icon right
                .appendField(new Blockly.FieldImage(ICONS.bump, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')); // Spacer for width
            this.setNextStatement(true, null);
            this.setColour(COLORS.TRIGGER);
            this.setTooltip("Start on Bump");
        }
    };

    Blockly.Blocks['event_message'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField(createImageDropdownWithTooltips(ENVELOPE_OPTIONS as any), "COLOR");
            this.setNextStatement(true, null);
            this.setColour(COLORS.TRIGGER);
            this.setTooltip("On Message");
        }
    };

    Blockly.Blocks['event_send_message'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField(createImageDropdownWithTooltips(SEND_ENVELOPE_OPTIONS as any), "COLOR");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.TRIGGER); // Still yellow like triggers
            this.setTooltip("Send Message");
        }
    };
    registerGenerator('event_send_message', (block: any) => {
        const color = block.getFieldValue('COLOR');
        return `await sendMessage('${color}');\n`;
    });


    // --- 2. MOTION (Blue) ---
    const createMotionBlock = (type: string, cmd: string, iconUrl: string, tooltip: string, defaultVal: number = 1) => {
        Blockly.Blocks[type] = {
            init: function() {
                const input = this.appendDummyInput().setAlign(Blockly.inputs.Align.CENTRE);
                input.appendField(new Blockly.FieldImage(iconUrl, 64, 64, "*"));
                input.appendField(new Number99Field(defaultVal), "STEPS");
                input.appendField(new Blockly.FieldLabel('\u00A0\u00A0')); // Add spacer for uniform width
                this.setPreviousStatement(true, null);
                this.setNextStatement(true, null);
                this.setColour(COLORS.MOTION);
                this.setTooltip(tooltip);
            }
        };
        registerGenerator(type, (block: any) => {
            const steps = Number(block.getFieldValue('STEPS')) || 0;
            return `await ${cmd}(${steps});\n`;
        });
    };

    // Default movement steps set to 1
    createMotionBlock('motion_right', 'moveRight', ICONS.right, "Move Right", 1);
    createMotionBlock('motion_left', 'moveLeft', ICONS.left, "Move Left", 1);
    createMotionBlock('motion_up', 'moveUp', ICONS.up, "Move Up", 1);
    createMotionBlock('motion_down', 'moveDown', ICONS.down, "Move Down", 1);
    createMotionBlock('motion_turn_right', 'turnRight', ICONS.turnRight, "Turn Right", 1);
    createMotionBlock('motion_turn_left', 'turnLeft', ICONS.turnLeft, "Turn Left", 1);
    createMotionBlock('motion_hop', 'hop', ICONS.hop, "Hop", 1);

    Blockly.Blocks['motion_home'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField(new Blockly.FieldImage(ICONS.home, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')); // Spacer for uniform width
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.MOTION);
            this.setTooltip("Go Home");
        }
    };
    registerGenerator('motion_home', () => `await goHome();\n`);

    // --- 3. LOOKS (Purple) ---
    Blockly.Blocks['looks_say'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField(new Blockly.FieldImage(ICONS.say, 64, 64, "*"))
                .appendField(new Blockly.FieldTextInput("Hi"), "TEXT");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.LOOKS);
            this.setTooltip("Say");
        }
    };
    registerGenerator('looks_say', (block: any) => {
        const text = block.getFieldValue('TEXT');
        return `await say("${text}");\n`;
    });

    Blockly.Blocks['looks_grow'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ') // Spacer to move icon right
                .appendField(new Blockly.FieldImage(ICONS.grow, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')); // Spacer for width
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.LOOKS);
            this.setTooltip("Grow");
        }
    };
    registerGenerator('looks_grow', () => `await grow();\n`);

    Blockly.Blocks['looks_shrink'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ') // Spacer to move icon right
                .appendField(new Blockly.FieldImage(ICONS.shrink, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')); // Spacer for width
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.LOOKS);
            this.setTooltip("Shrink");
        }
    };
    registerGenerator('looks_shrink', () => `await shrink();\n`);

    Blockly.Blocks['looks_reset_size'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ') // Spacer to move icon right
                .appendField(new Blockly.FieldImage(ICONS.resetSize, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')); // Spacer for width
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.LOOKS);
            this.setTooltip("Reset Size");
        }
    };
    registerGenerator('looks_reset_size', () => `await resetSize();\n`);

    Blockly.Blocks['looks_hide'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ') // Spacer to move icon right
                .appendField(new Blockly.FieldImage(ICONS.hide, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')); // Spacer for width
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.LOOKS);
            this.setTooltip("Hide");
        }
    };
    registerGenerator('looks_hide', () => `await hide();\n`);

    Blockly.Blocks['looks_show'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ') // Spacer to move icon right
                .appendField(new Blockly.FieldImage(ICONS.show, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')); // Spacer for width
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.LOOKS);
            this.setTooltip("Show");
        }
    };
    registerGenerator('looks_show', () => `await show();\n`);

    // --- 4. SOUND (Green) ---
    Blockly.Blocks['sound_pop'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ') // Spacer to move icon right
                .appendField(new Blockly.FieldImage(ICONS.pop, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')); // Spacer for width
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.SOUND);
            this.setTooltip("Pop");
        }
    };
    registerGenerator('sound_pop', () => `await playPop();\n`);

    Blockly.Blocks['sound_play_recorded'] = {
      init: function() {
        this.appendDummyInput()
            .setAlign(Blockly.inputs.Align.CENTRE)
            .appendField(new Blockly.FieldImage(ICONS.record, 64, 64, '*'))
            .appendField(new FieldSoundRecorder('1'), 'SOUND_ID');
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(COLORS.SOUND);
        this.setTooltip('Play Recorded Sound');
      },
    };
    registerGenerator('sound_play_recorded', (block: any) => {
      const soundId = block.getFieldValue('SOUND_ID');
      return `await playRecordedSound('recording_${soundId}');\n`;
    });

    // --- 5. CONTROL (Orange) ---
    Blockly.Blocks['control_wait'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField(new Blockly.FieldImage(ICONS.wait, 64, 64, "*"))
                .appendField(new Number99Field(10), "MS");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.CONTROL);
            this.setTooltip("Wait");
        }
    };
    registerGenerator('control_wait', (block: any) => {
        const ms = Number(block.getFieldValue('MS')) || 0;
        return `await wait(${ms});\n`;
    });

    Blockly.Blocks['control_set_speed'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField(createImageDropdownWithTooltips(SPEED_OPTIONS as any), "SPEED");
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.CONTROL);
            this.setTooltip("Set character speed");
        }
    };
    registerGenerator('control_set_speed', (block: any) => {
        const speed = block.getFieldValue('SPEED');
        return `setSpeed('${speed}');\n`;
    });

    Blockly.Blocks['control_repeat'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField(new Blockly.FieldImage(ICONS.repeat, 64, 64, "*"))
                .appendField(new Number99Field(4), "TIMES");
            this.appendStatementInput("DO").setCheck(null);
            this.setPreviousStatement(true, null);
            this.setNextStatement(true, null);
            this.setColour(COLORS.CONTROL);
            this.setTooltip("Repeat");
        }
    };
    registerGenerator('control_repeat', (block: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const generator = javascriptGenerator as any;
        const times = Number(block.getFieldValue('TIMES')) || 0;
        const branch = generator ? generator.statementToCode(block, 'DO') : '';
        return `for (let i = 0; i < ${times}; i++) {\n${branch}}\n`;
    });

    // --- 6. END (Red) ---
    Blockly.Blocks['end_forever'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ') // Spacer to move icon right
                .appendField(new Blockly.FieldImage(ICONS.forever, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')); // Spacer for width
            this.appendStatementInput("DO").setCheck(null);
            this.setPreviousStatement(true, null);
            this.setColour(COLORS.END);
            this.setTooltip("Forever");
        }
    };
    registerGenerator('end_forever', (block: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const generator = javascriptGenerator as any;
        const branch = generator ? generator.statementToCode(block, 'DO') : '';
        // Wait 0 essentially yields for 1 frame via requestAnimationFrame in App.tsx
        return `while (true) {\n${branch} await wait(0);\n}\n`;
    });

    // --- Go to Page (Red) ---
    Blockly.Blocks['end_goto_page'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField(new Blockly.FieldDropdown(() => getPageOptions() as any), "PAGE_ID");
            this.setPreviousStatement(true, null);
            this.setColour(COLORS.END);
            this.setTooltip("Go to Page");
        }
    };
    registerGenerator('end_goto_page', (block: any) => {
        const pageId = block.getFieldValue('PAGE_ID');
        return `await goToPage('${pageId}');\n`;
    });
};

// --- Toolbox Definition ---
const GAP_SMALL = 8;

const STANDARD_TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
        kind: 'category',
        name: 'Events',
        colour: COLORS.TRIGGER,
        cssconfig: {
            row: 'category-row start-category-icon'
        },
        contents: [
            { kind: 'block', type: 'event_flag', gap: GAP_SMALL },
            { kind: 'block', type: 'event_tap', gap: GAP_SMALL },
            { kind: 'block', type: 'event_bump', gap: GAP_SMALL },
            { kind: 'block', type: 'event_message', gap: GAP_SMALL },
            { kind: 'block', type: 'event_send_message', gap: GAP_SMALL },
        ]
    },
    {
        kind: 'category',
        name: 'Motion',
        colour: COLORS.MOTION,
        cssconfig: {
            row: 'category-row motion-category-icon'
        },
        contents: [
            { kind: 'block', type: 'motion_right', gap: GAP_SMALL },
            { kind: 'block', type: 'motion_left', gap: GAP_SMALL },
            { kind: 'block', type: 'motion_up', gap: GAP_SMALL },
            { kind: 'block', type: 'motion_down', gap: GAP_SMALL },
            { kind: 'block', type: 'motion_turn_right', gap: GAP_SMALL },
            { kind: 'block', type: 'motion_turn_left', gap: GAP_SMALL },
            { kind: 'block', type: 'motion_hop', gap: GAP_SMALL },
            { kind: 'block', type: 'motion_home', gap: GAP_SMALL },
        ]
    },
    {
        kind: 'category',
        name: 'Looks',
        colour: COLORS.LOOKS,
        cssconfig: {
            row: 'category-row looks-category-icon'
        },
        contents: [
            { kind: 'block', type: 'looks_say', gap: GAP_SMALL },
            { kind: 'block', type: 'looks_grow', gap: GAP_SMALL },
            { kind: 'block', type: 'looks_shrink', gap: GAP_SMALL },
            { kind: 'block', type: 'looks_reset_size', gap: GAP_SMALL },
            { kind: 'block', type: 'looks_hide', gap: GAP_SMALL },
            { kind: 'block', type: 'looks_show', gap: GAP_SMALL },
        ]
    },
    {
        kind: 'category',
        name: 'Sound',
        colour: COLORS.SOUND,
        cssconfig: {
            row: 'category-row sound-category-icon'
        },
        contents: [
            { kind: 'block', type: 'sound_pop', gap: GAP_SMALL },
            { kind: 'block', type: 'sound_play_recorded', gap: GAP_SMALL },
        ]
    },
    {
        kind: 'category',
        name: 'Control',
        colour: COLORS.CONTROL,
        cssconfig: {
            row: 'category-row control-category-icon'
        },
        contents: [
            { kind: 'block', type: 'control_wait', gap: GAP_SMALL },
            { kind: 'block', type: 'control_set_speed', gap: GAP_SMALL },
            { kind: 'block', type: 'control_repeat', gap: GAP_SMALL },
        ]
    },
    {
        kind: 'category',
        name: 'End',
        colour: COLORS.END,
        cssconfig: {
            row: 'category-row end-category-icon'
        },
        contents: [
            { kind: 'block', type: 'end_forever', gap: GAP_SMALL },
        ]
    }
  ],
};

interface BlocklyEditorProps {
  onCodeChange: (code: string) => void;
  xml: string;
  onXmlChange: (xml: string) => void;
  onRunBlock: (code: string) => void;
  pages: Page[];
}

const BlocklyEditor: React.FC<BlocklyEditorProps> = ({ onCodeChange, xml, onXmlChange, onRunBlock, pages }) => {
  const blocklyDiv = React.useRef<HTMLDivElement>(null);
  const workspaceRef = React.useRef<Blockly.WorkspaceSvg | null>(null);
  // Cache for fetched images to avoid repeated fetches
  const imageCacheRef = useRef<Record<string, string>>({});

  // Use a ref to hold the latest callbacks to prevent stale closures in the listener
  const callbacksRef = React.useRef({ onCodeChange, onXmlChange, onRunBlock });
  React.useEffect(() => {
    callbacksRef.current = { onCodeChange, onXmlChange, onRunBlock };
  }, [onCodeChange, onXmlChange, onRunBlock]);

  // Update page options whenever pages change
  React.useEffect(() => {
    let isMounted = true;

    const generateOptions = async () => {
        const newOptions = await Promise.all(pages.map(async (p, i) => {
            const pageNum = i + 1;
            let bgSource = p.background; // Default to CSS value (e.g., #fff or url(...))

            // Check if it is a URL background
            const urlMatch = p.background.match(/^url\(['"]?(.+?)['"]?\)$/);
            if (urlMatch) {
                const url = urlMatch[1];
                if (imageCacheRef.current[url]) {
                    // Use cached Base64
                    bgSource = imageCacheRef.current[url];
                } else {
                    try {
                        const res = await fetch(url);
                        const blob = await res.blob();
                        const base64 = await new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => resolve(reader.result as string);
                            reader.readAsDataURL(blob);
                        });
                        imageCacheRef.current[url] = base64;
                        bgSource = base64;
                    } catch (e) {
                        console.warn("Failed to load page bg for icon", e);
                        // Fallback to a placeholder color if fetch fails
                        // We cannot use the URL directly in SVG data URI due to security blocking
                        bgSource = '#e2e8f0'; 
                    }
                }
            }

            return [
                {
                    src: generatePageIcon(bgSource, pageNum),
                    width: 60,
                    height: 50,
                    alt: `Page ${pageNum}`
                },
                p.id
            ];
        }));

        if (isMounted) {
            // Update the global provider function
            getPageOptions = () => newOptions;
        }
    };

    generateOptions();

    return () => { isMounted = false; };
  }, [pages]);

  // Update toolbox dynamically
  React.useEffect(() => {
      if (!workspaceRef.current) return;
      
      const newToolbox = JSON.parse(JSON.stringify(STANDARD_TOOLBOX));
      if (pages.length > 1) {
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
           const endCategory = newToolbox.contents.find((c: any) => c.name === 'End');
           if (endCategory) {
               endCategory.contents.push({ kind: 'block', type: 'end_goto_page', gap: GAP_SMALL });
           }
      }
      workspaceRef.current.updateToolbox(newToolbox);
  }, [pages]);

  // Effect for workspace setup and teardown, runs only once on mount.
  React.useEffect(() => {
    // Ensure blocks are initialized when the component mounts
    initializeBlocks();

    if (!blocklyDiv.current) return;

    const workspace = Blockly.inject(blocklyDiv.current, {
        toolbox: STANDARD_TOOLBOX,
        renderer: 'tall',
        rtl: false,
        scrollbars: true,
        trashcan: true,
        sounds: false,
        grid: {
            spacing: 20,
            length: 3,
            colour: '#ccc',
            snap: true,
        },
        zoom: {
            controls: true,
            wheel: true,
            startScale: 1.0, 
            maxScale: 3.0,
            minScale: 0.3,
            scaleSpeed: 1.2,
        }
    });
    workspaceRef.current = workspace;
    
    // --- Added: Change Flyout background color on category selection ---
    const onToolboxEvent = (event: Blockly.Events.Abstract) => {
        // Safe access to the event type if typescript definitions are missing it
        const typeName = (Blockly.Events as any).TOOLBOX_ITEM_SELECT || 'toolbox_item_select';
        
        if (event.type === typeName) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const newItemName = (event as any).newItem;
            if (newItemName && CATEGORY_BG_COLORS[newItemName]) {
                const flyout = workspace.getFlyout();
                if (flyout) {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const flyoutInstance = flyout as any;
                    // Try to access the SVG background element directly since setBackgroundColour doesn't exist on IFlyout
                    if (flyoutInstance.svgBackground_) {
                         flyoutInstance.svgBackground_.style.fill = CATEGORY_BG_COLORS[newItemName];
                    }
                }
            }
        }
    };
    workspace.addChangeListener(onToolboxEvent);
    
    const updateWorkspaceState = (event: Blockly.Events.Abstract) => {
      // Ignore UI events (clicks, scrolls, selection changes) and only capture model changes
      if (event.isUiEvent) return;
      if (!workspaceRef.current) return;
      
      const topBlocks = workspaceRef.current.getTopBlocks(true);
      let fullCode = '';

      // Force generator initialization with workspace context
      if (javascriptGenerator && typeof (javascriptGenerator as any).init === 'function') {
        (javascriptGenerator as any).init(workspaceRef.current);
      }

      topBlocks.forEach(block => {
          const nextBlock = block.getNextBlock();
          let chainCode = '';
          if (nextBlock) {
              chainCode = (javascriptGenerator as any).blockToCode(nextBlock) as string;
          }
          
          switch(block.type) {
              case 'event_flag':
                  fullCode += `register('flag', async () => {\n${chainCode}\n});\n`; break;
              case 'event_tap':
                  fullCode += `register('tap', async () => {\n${chainCode}\n});\n`; break;
              case 'event_bump':
                  fullCode += `register('bump', async () => {\n${chainCode}\n});\n`; break;
              case 'event_message':
                   const msgColor = block.getFieldValue('COLOR');
                   fullCode += `register('message_' + '${msgColor}', async () => {\n${chainCode}\n});\n`; break;
              default: break;
          }
      });
      callbacksRef.current.onCodeChange(fullCode);

      const newXmlDom = Blockly.Xml.workspaceToDom(workspaceRef.current);
      const newXmlText = Blockly.Xml.domToText(newXmlDom);
      callbacksRef.current.onXmlChange(newXmlText);
    };

    const onBlockClick = (event: Blockly.Events.Abstract) => {
      // Don't run if workspace is currently being dragged
      if (workspaceRef.current?.isDragging()) return;

      // Robust check for Click event across versions
      const isClick = event.type === Blockly.Events.CLICK || event.type === 'click';
      
      if (isClick && (event as any).blockId) {
          const blockId = (event as any).blockId;
          const block = workspaceRef.current?.getBlockById(blockId);
          // Don't run if it's in the flyout (toolbox)
          if (block && !block.workspace.isFlyout) {
              // Ensure generator initialized
              if (javascriptGenerator && typeof (javascriptGenerator as any).init === 'function') {
                  (javascriptGenerator as any).init(workspaceRef.current!);
              }

              // Generate code for this block and the connected chain
              const code = (javascriptGenerator as any).blockToCode(block);
              if (code && typeof code === 'string') {
                  callbacksRef.current.onRunBlock(code);
              }
          }
      }
    };

    workspace.addChangeListener(updateWorkspaceState);
    workspace.addChangeListener(onBlockClick);
    
    const handleResize = () => {
        if(workspace) Blockly.svgResize(workspace);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (workspace) {
        workspace.dispose();
      }
      workspaceRef.current = null;
    };
  }, []); // Empty dependency array ensures this runs only once.

  // Effect to handle programmatic XML updates from props (e.g., on load or sprite change)
  React.useEffect(() => {
    const workspace = workspaceRef.current;
    if (!workspace || !xml) return;
    
    const currentXmlText = Blockly.Xml.domToText(Blockly.Xml.workspaceToDom(workspace));
    if (currentXmlText === xml) {
      // No change needed, prevent loops
      return;
    }

    // FIX: Disable events during programmatic load to prevent the change listener
    // from firing and creating a race condition that overwrites the loaded state.
    Blockly.Events.disable();
    try {
        const dom = Blockly.utils.xml.textToDom(xml);
        Blockly.Xml.clearWorkspaceAndLoadFromXml(dom, workspace);
    } catch (e) {
        console.error("Error loading XML into Blockly workspace:", e);
        // If loading fails, clear the workspace to prevent a corrupted state.
        workspace.clear();
    } finally {
        Blockly.Events.enable();
    }
  }, [xml]); // This runs whenever the xml prop from App changes.


  return (
    <div className="w-full h-full relative group bg-white">
      <div 
        ref={blocklyDiv} 
        className="absolute inset-0 w-full h-full" 
        style={{ direction: 'ltr' }} 
      />
    </div>
  );
};

export default BlocklyEditor;
