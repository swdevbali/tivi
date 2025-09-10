export interface MouseEvent {
  type: 'move' | 'click' | 'doubleClick' | 'rightClick' | 'scroll';
  x: number;
  y: number;
  button?: 'left' | 'right' | 'middle';
  deltaX?: number;
  deltaY?: number;
  timestamp: number;
}

export interface KeyboardEvent {
  type: 'keyDown' | 'keyUp' | 'keyPress';
  key: string;
  code: string;
  modifiers: {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
  };
  timestamp: number;
}

export interface ControlMessage {
  type: 'mouse' | 'keyboard';
  event: MouseEvent | KeyboardEvent;
}

export interface ScreenFrame {
  data: ArrayBuffer;
  width: number;
  height: number;
  timestamp: number;
  frameNumber: number;
  encoding: 'h264' | 'h265' | 'vp8' | 'vp9';
}