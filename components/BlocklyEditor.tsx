import React from 'react';
import Blockly from 'blockly';
import * as BlocklyJS from 'blockly/javascript';
import * as En from 'blockly/msg/en';
import './BlocklyStyles.css';

// Initialize locale
const locale = (En as any).default || En;
Blockly.setLocale(locale);

// --- Generator Import Compatibility ---
const getJavascriptGenerator = () => {
  const lib = BlocklyJS as any;
  if (lib.javascriptGenerator) return lib.javascriptGenerator;
  if (lib.default) {
      if (lib.default.workspaceToCode) return lib.default;
      if (lib.default.javascriptGenerator) return lib.default.javascriptGenerator;
  }
  if (typeof window !== 'undefined' && (window as any).Blockly?.JavaScript) return (window as any).Blockly.JavaScript;
  if (lib.JavascriptGenerator) {
      try { return new lib.JavascriptGenerator('JavaScript'); } catch (e) { console.warn(e); }
  }
  if (typeof lib.workspaceToCode === 'function') return lib;
  return null;
};

const javascriptGenerator = getJavascriptGenerator();

const registerGenerator = (blockName: string, generatorFn: (block: any) => string | [string, any]) => {
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
    const B = Blockly as any;
    
    // תיקון: בדיקה שמתאימה לכל הגרסאות כדי למנוע כפילות
    try {
        if (B.registry && B.registry.getClass(B.registry.Type.RENDERER, 'tall')) {
            return; 
        }
    } catch (e) {
        // אם הבדיקה נכשלה, נמשיך לרישום בתוך try-catch
    }

    if (B.geras && B.blockRendering) {
        class TallConstantProvider extends B.geras.ConstantProvider {
            constructor() {
                super();
                this.MIN_BLOCK_HEIGHT = 80;
                this.ROW_HEIGHT = 80;       
                this.FIELD_BORDER_RECT_Y_PADDING = 12; 
                this.FIELD_BORDER_RECT_HEIGHT = 32;
                this.FIELD_BORDER_RECT_X_PADDING = 10;
            }
        }

        class TallRenderer extends B.geras.Renderer {
            constructor(name: string) {
                super(name);
            }
            makeConstants_() {
                return new TallConstantProvider();
            }
        }

        try {
             B.blockRendering.register('tall', TallRenderer);
        } catch(e) {
            console.warn("Renderer 'tall' already registered");
        }
    }
};

registerTallRenderer();

// --- Custom Field with Visual Numpad ---
class Number99Field extends Blockly.FieldNumber {
    public isSerializable() { return true; }
    constructor(value: string | number) {
        super(value, 0, 99, 1);
    }
    showEditor_() {
        const B = Blockly as any;
        if (!B.DropDownDiv) return;
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
        display.textContent = String((this as Blockly.FieldNumber).getValue());
        display.style.color = textColor;
        wrapper.appendChild(display);
        const grid = document.createElement('div');
        grid.className = 'blocklyNumpadGrid';
        const handleDigit = (digit: string) => {
            let current = String((this as Blockly.FieldNumber).getValue());
            if (current === '0') current = '';
            if (current.length < 2) {
                const newVal = current + digit;
                (this as Blockly.FieldNumber).setValue(newVal);
                display.textContent = newVal;
            }
        };
        const handleBackspace = () => {
            let current = String((this as Blockly.FieldNumber).getValue());
            if (current.length > 0) {
                current = current.slice(0, -1);
                if (current === '') current = '0';
                (this as Blockly.FieldNumber).setValue(current);
                display.textContent = current;
            }
        };
        const handleOk = () => { B.DropDownDiv.hideIfOwner(this); };
        [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(num => {
            const btn = document.createElement('button');
            btn.textContent = String(num);
            btn.className = 'blocklyNumpadBtn';
            btn.style.color = textColor;
            btn.onclick = (e) => { e.stopPropagation(); handleDigit(String(num)); };
            grid.appendChild(btn);
        });
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '<i class="fas fa-arrow-left"></i>'; 
        delBtn.className = 'blocklyNumpadBtn blocklyNumpadAction';
        delBtn.onclick = (e) => { e.stopPropagation(); handleBackspace(); };
        grid.appendChild(delBtn);
        const zeroBtn = document.createElement('button');
        zeroBtn.textContent = '0';
        zeroBtn.className = 'blocklyNumpadBtn';
        zeroBtn.style.color = textColor;
        zeroBtn.onclick = (e) => { e.stopPropagation(); handleDigit('0'); };
        grid.appendChild(zeroBtn);
        const okBtn = document.createElement('button');
        okBtn.innerHTML = '<i class="fas fa-check"></i>';
        okBtn.className = 'blocklyNumpadBtn blocklyNumpadOk';
        okBtn.onclick = (e) => { e.stopPropagation(); handleOk(); };
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
    constructor(value: string) { super(value); }
    static fromJson(options: any) { return new this(options['value']); }
    getText() { return `Recording ${(this as Blockly.Field).getValue()}`; }
    showEditor_() {
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
        B.DropDownDiv.showPositionedByField(this, () => { this.stopRecording(); });
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
            this.mediaRecorder.addEventListener("dataavailable", event => { this.audioChunks.push(event.data); });
            this.mediaRecorder.start();
            this.visualize(canvas);
        } catch (err) { alert("Microphone error."); }
    }
    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.addEventListener("stop", () => {
                const audioBlob = new Blob(this.audioChunks);
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    this.saveRecording(reader.result as string);
                };
            });
            this.mediaRecorder.stop();
        }
        if (this.stream) { this.stream.getTracks().forEach(track => track.stop()); this.stream = null; }
        if (this.animationFrameId) { cancelAnimationFrame(this.animationFrameId); this.animationFrameId = null; }
        if (this.audioContext) { this.audioContext.close(); this.audioContext = null; }
    }
    saveRecording(base64data: string) {
        const recordings = this.getRecordings();
        const nextId = recordings.length > 0 ? Math.max(...recordings.map(r => parseInt(r.id))) + 1 : 1;
        localStorage.setItem(`recording_${nextId}`, base64data);
    }
    playRecording(key: string) {
        const base64Audio = localStorage.getItem(key);
        if (base64Audio) { new Audio(base64Audio).play(); }
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
                if (i === 0) canvasCtx.moveTo(x, y);
                else canvasCtx.lineTo(x, y);
                x += sliceWidth;
            }
            canvasCtx.lineTo(canvas.width, canvas.height / 2);
            canvasCtx.stroke();
        };
        draw();
    }
}

// תיקון סופי: שימוש ב-try-catch ובדיקת קיום אובייקט למניעת שגיאת "hasItem is not a function"
try {
    const isRegistered = !!Blockly.fieldRegistry.get('field_sound_recorder');
    if (!isRegistered) {
        Blockly.fieldRegistry.register('field_sound_recorder', FieldSoundRecorder as any);
    }
} catch (e) {
    try {
        Blockly.fieldRegistry.register('field_sound_recorder', FieldSoundRecorder as any);
    } catch (err) {
        console.log("Sound recorder field already exists");
    }
}

// --- Icons & Constants (No changes here) ---
const ICONS =
