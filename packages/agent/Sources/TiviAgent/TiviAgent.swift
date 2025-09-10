import Foundation
import AppKit
import CoreGraphics
import AVFoundation
import SocketIO

class TiviAgent {
    private let screenCapture: ScreenCapture
    private let inputController: InputController
    private let socketManager: SocketManager
    private var socket: SocketIOClient?
    private let serverURL = URL(string: "http://localhost:3001")!
    
    init() {
        self.screenCapture = ScreenCapture()
        self.inputController = InputController()
        self.socketManager = SocketManager(socketURL: serverURL, config: [.log(false), .compress])
    }
    
    func start() {
        checkPermissions()
        connectToServer()
        setupEventHandlers()
    }
    
    private func checkPermissions() {
        if !AXIsProcessTrusted() {
            print("⚠️ Accessibility permission required for input control")
            print("Please grant accessibility permission to TiviAgent in System Preferences")
            
            let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
            AXIsProcessTrustedWithOptions(options)
        }
        
        if AVCaptureDevice.authorizationStatus(for: .video) != .authorized {
            AVCaptureDevice.requestAccess(for: .video) { granted in
                if granted {
                    print("✅ Screen recording permission granted")
                } else {
                    print("❌ Screen recording permission denied")
                }
            }
        }
    }
    
    private func connectToServer() {
        socket = socketManager.defaultSocket
        
        let deviceInfo: [String: Any] = [
            "name": Host.current().localizedName ?? "Mac",
            "platform": "macos",
            "osVersion": ProcessInfo.processInfo.operatingSystemVersionString,
            "capabilities": [
                "screenShare": true,
                "remoteControl": true,
                "fileTransfer": false,
                "audioShare": false,
                "multiMonitor": false,
                "resolution": getScreenResolution()
            ]
        ]
        
        socket?.on(clientEvent: .connect) { data, ack in
            print("✅ Connected to signaling server")
            self.socket?.emit("device:register", deviceInfo)
        }
        
        socket?.on(clientEvent: .disconnect) { data, ack in
            print("❌ Disconnected from signaling server")
        }
        
        socket?.connect()
    }
    
    private func setupEventHandlers() {
        socket?.on("control:request") { data, ack in
            guard let payload = data[0] as? [String: Any],
                  let requesterId = payload["requesterId"] as? String,
                  let requesterName = payload["requesterName"] as? String else { return }
            
            self.handleControlRequest(from: requesterId, name: requesterName)
        }
        
        socket?.on("webrtc:offer") { data, ack in
            guard let payload = data[0] as? [String: Any] else { return }
            self.handleWebRTCOffer(payload)
        }
        
        socket?.on("webrtc:ice-candidate") { data, ack in
            guard let payload = data[0] as? [String: Any] else { return }
            self.handleICECandidate(payload)
        }
    }
    
    private func handleControlRequest(from requesterId: String, name: String) {
        DispatchQueue.main.async {
            let alert = NSAlert()
            alert.messageText = "Remote Control Request"
            alert.informativeText = "\(name) wants to control your Mac. Allow?"
            alert.alertStyle = .warning
            alert.addButton(withTitle: "Allow")
            alert.addButton(withTitle: "Deny")
            
            let response = alert.runModal()
            
            if response == .alertFirstButtonReturn {
                self.socket?.emit("control:approve", ["requesterId": requesterId])
                self.startRemoteSession()
            } else {
                self.socket?.emit("control:deny", ["requesterId": requesterId])
            }
        }
    }
    
    private func handleWebRTCOffer(_ payload: [String: Any]) {
        // WebRTC offer handling will be implemented here
        print("Received WebRTC offer")
    }
    
    private func handleICECandidate(_ payload: [String: Any]) {
        // ICE candidate handling will be implemented here
        print("Received ICE candidate")
    }
    
    private func startRemoteSession() {
        screenCapture.startCapture()
        inputController.startListening()
        print("🎬 Remote session started")
    }
    
    private func getScreenResolution() -> [String: Int] {
        if let screen = NSScreen.main {
            let size = screen.frame.size
            return [
                "width": Int(size.width),
                "height": Int(size.height)
            ]
        }
        return ["width": 1920, "height": 1080]
    }
}