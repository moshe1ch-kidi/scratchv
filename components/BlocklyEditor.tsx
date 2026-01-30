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
    
    // תיקון: בדיקה בטוחה אם ה-Renderer כבר רשום
    if (B.registry && B.registry.hasItem(B.registry.Type.RENDERER, 'tall')) {
        return;
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
            console.warn("Renderer registration skipped - already exists");
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

        const handleOk = () => {
             B.DropDownDiv.hideIfOwner(this);
        };

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

    constructor(value: string) {
        super(value);
    }

    static fromJson(options: any) {
        return new this(options['value']);
    }

    getText() {
        return `Recording ${(this as Blockly.Field).getValue()}`;
    }

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
        B.DropDownDiv.showPositionedByField(this, () => {
            this.stopRecording(); 
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
            alert("Could not access microphone.");
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

// תיקון: בדיקת רישום בטוחה עבור ה-Field
if (!Blockly.fieldRegistry.hasItem('field_sound_recorder')) {
    Blockly.fieldRegistry.register('field_sound_recorder', FieldSoundRecorder as any);
}

// --- Icons & Colors (נשאר ללא שינוי) ---
const ICONS = {
    flag: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/greenFlag.svg",
    tap: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/OnTouch.svg",
    bump: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Bump.svg", 
    right: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Foward.svg",
    left: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Back.svg",
    up: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Up.svg",
    down: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Down.svg",
    turnRight: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Right.svg",
    turnLeft: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Left.svg",
    hop: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Hop.svg",
    home: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Home.svg",
    say: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Say.svg",
    grow: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Grow.svg",
    shrink: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Shrink.svg",
    resetSize: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Reset.svg",
    hide: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Disappear.svg",
    show: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Appear.svg",
    pop: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Speaker.svg",
    record: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Microphone.svg",
    wait: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Wait.svg",
    speed: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Speed.svg",
    repeat: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Repeat.svg", 
    forever: "https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/Forever.svg",
};

const COLORS = {
    TRIGGER: '#FFD700', MOTION: '#4A90E2', LOOKS: '#9013FE', 
    SOUND: '#7ED321', CONTROL: '#F5A623', END: '#D0021B'
};

const ENVELOPE_OPTIONS = [
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Orange.svg', 'width': 60, 'height': 50, 'alt': 'Orange'}, 'orange'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Red.svg', 'width': 60, 'height': 50, 'alt': 'Red'}, 'red'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Yellow.svg', 'width': 60, 'height': 50, 'alt': 'Yellow'}, 'yellow'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Green.svg', 'width': 60, 'height': 50, 'alt': 'Green'}, 'green'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Blue.svg', 'width': 60, 'height': 50, 'alt': 'Blue'}, 'blue'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterGet_Purple.svg', 'width': 60, 'height': 50, 'alt': 'Purple'}, 'purple'],
];

const SEND_ENVELOPE_OPTIONS = [
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Orange.svg', 'width': 60, 'height': 50, 'alt': 'Orange'}, 'orange'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Red.svg', 'width': 60, 'height': 50, 'alt': 'Red'}, 'red'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Yellow.svg', 'width': 60, 'height': 50, 'alt': 'Yellow'}, 'yellow'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Green.svg', 'width': 60, 'height': 50, 'alt': 'Green'}, 'green'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Blue.svg', 'width': 60, 'height': 50, 'alt': 'Blue'}, 'blue'],
    [{'src': 'https://raw.githubusercontent.com/scratchfoundation/scratchjr/develop/editions/free/src/assets/blockicons/LetterSend_Purple.svg', 'width': 60, 'height': 50, 'alt': 'Purple'}, 'purple'],
];

const initializeBlocks = () => {
    // תיקון: הגנה כדי לא לרשום בלוקים פעמיים
    if (Blockly.Blocks['event_flag']) return;

    const createImageDropdownWithTooltips = (options: any) => {
        const dropdown = new Blockly.FieldDropdown(options);
        const originalShowEditor = (dropdown as any).showEditor_;
        (dropdown as any).showEditor_ = function() {
            const self = this as any;
            originalShowEditor.call(self);
            const menu = self.menu_ as Blockly.Menu;
            if (menu && menu.getElement() && typeof (menu as any).getChildCount === 'function') {
                const menuOptions = self.getOptions(false);
                const childCount = (menu as any).getChildCount();
                for (let i = 0; i < childCount; i++) {
                    const menuItem = (menu as any).getChildAt(i) as Blockly.MenuItem | null;
                    if (!menuItem) continue;
                    if (i >= menuOptions.length) continue;
                    const optionData = menuOptions[i][0];
                    const menuItemElement = menuItem.getElement();
                    if (menuItemElement && typeof optionData === 'object' && optionData.alt) {
                        menuItemElement.setAttribute('title', optionData.alt);
                    }
                }
            }
        };
        return dropdown;
    };

    // --- Triggers ---
    registerGenerator('event_flag', () => '');
    registerGenerator('event_tap', () => '');
    registerGenerator('event_bump', () => '');
    registerGenerator('event_message', () => '');

    Blockly.Blocks['event_flag'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ')
                .appendField(new Blockly.FieldImage(ICONS.flag, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'));
            this.setNextStatement(true, null);
            this.setColour(COLORS.TRIGGER);
            this.setTooltip("Start on Green Flag");
        }
    };

    Blockly.Blocks['event_tap'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ')
                .appendField(new Blockly.FieldImage(ICONS.tap, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'));
            this.setNextStatement(true, null);
            this.setColour(COLORS.TRIGGER);
            this.setTooltip("Start on Tap");
        }
    };

    Blockly.Blocks['event_bump'] = {
        init: function() {
            this.appendDummyInput()
                .setAlign(Blockly.inputs.Align.CENTRE)
                .appendField('  ')
                .appendField(new Blockly.FieldImage(ICONS.bump, 64, 64, "*"))
                .appendField(new Blockly.FieldLabel('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0'));
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
            this.setColour(COLORS.TRIGGER);
            this.setTooltip("Send Message");
        }
    };
    registerGenerator('event_send_message', (block: any) => {
        const color = block.getFieldValue('COLOR');
        return `await sendMessage('${color}');\n`;
    });

    // ... שאר הגדרות הבלוקים שלך (Motion, Looks וכו') ימשיכו כאן כרגיל
};

export default initializeBlocks;
