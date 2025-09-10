import Foundation
import CoreGraphics
import AppKit

class InputController {
    private var eventTap: CFMachPort?
    private var runLoopSource: CFRunLoopSource?
    private var isListening = false
    
    func startListening() {
        guard !isListening else { return }
        
        let eventMask = (1 << CGEventType.mouseMoved.rawValue) |
                        (1 << CGEventType.leftMouseDown.rawValue) |
                        (1 << CGEventType.leftMouseUp.rawValue) |
                        (1 << CGEventType.rightMouseDown.rawValue) |
                        (1 << CGEventType.rightMouseUp.rawValue) |
                        (1 << CGEventType.keyDown.rawValue) |
                        (1 << CGEventType.keyUp.rawValue) |
                        (1 << CGEventType.scrollWheel.rawValue)
        
        eventTap = CGEvent.tapCreate(
            tap: .cgSessionEventTap,
            place: .headInsertEventTap,
            options: .defaultTap,
            eventsOfInterest: CGEventMask(eventMask),
            callback: { proxy, type, event, refcon in
                return Unmanaged.passUnretained(event)
            },
            userInfo: nil
        )
        
        if let eventTap = eventTap {
            runLoopSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, eventTap, 0)
            CFRunLoopAddSource(CFRunLoopGetCurrent(), runLoopSource, .commonModes)
            CGEvent.tapEnable(tap: eventTap, enable: true)
            isListening = true
            print("🎮 Input controller started")
        }
    }
    
    func stopListening() {
        guard isListening else { return }
        
        if let eventTap = eventTap {
            CGEvent.tapEnable(tap: eventTap, enable: false)
        }
        
        if let runLoopSource = runLoopSource {
            CFRunLoopRemoveSource(CFRunLoopGetCurrent(), runLoopSource, .commonModes)
        }
        
        eventTap = nil
        runLoopSource = nil
        isListening = false
        print("🛑 Input controller stopped")
    }
    
    func injectMouseMove(x: CGFloat, y: CGFloat) {
        let moveEvent = CGEvent(
            mouseEventSource: nil,
            mouseType: .mouseMoved,
            mouseCursorPosition: CGPoint(x: x, y: y),
            mouseButton: .left
        )
        moveEvent?.post(tap: .cghidEventTap)
    }
    
    func injectMouseClick(x: CGFloat, y: CGFloat, button: CGMouseButton) {
        let downType: CGEventType
        let upType: CGEventType
        
        switch button {
        case .left:
            downType = .leftMouseDown
            upType = .leftMouseUp
        case .right:
            downType = .rightMouseDown
            upType = .rightMouseUp
        default:
            downType = .otherMouseDown
            upType = .otherMouseUp
        }
        
        let position = CGPoint(x: x, y: y)
        
        let downEvent = CGEvent(
            mouseEventSource: nil,
            mouseType: downType,
            mouseCursorPosition: position,
            mouseButton: button
        )
        
        let upEvent = CGEvent(
            mouseEventSource: nil,
            mouseType: upType,
            mouseCursorPosition: position,
            mouseButton: button
        )
        
        downEvent?.post(tap: .cghidEventTap)
        upEvent?.post(tap: .cghidEventTap)
    }
    
    func injectKeyPress(keyCode: CGKeyCode, isDown: Bool) {
        let keyEvent = CGEvent(
            keyboardEventSource: nil,
            virtualKey: keyCode,
            keyDown: isDown
        )
        keyEvent?.post(tap: .cghidEventTap)
    }
    
    func injectScroll(deltaX: CGFloat, deltaY: CGFloat) {
        let scrollEvent = CGEvent(
            scrollWheelEvent2Source: nil,
            units: .pixel,
            wheelCount: 2,
            wheel1: Int32(deltaY),
            wheel2: Int32(deltaX),
            wheel3: 0
        )
        scrollEvent?.post(tap: .cghidEventTap)
    }
}