import Foundation
import AVFoundation
import CoreGraphics
import CoreMedia

class ScreenCapture: NSObject {
    private var captureSession: AVCaptureSession?
    private var videoOutput: AVCaptureVideoDataOutput?
    private let captureQueue = DispatchQueue(label: "com.tivi.screencapture")
    private var frameCallback: ((CVPixelBuffer) -> Void)?
    
    override init() {
        super.init()
        setupCaptureSession()
    }
    
    private func setupCaptureSession() {
        captureSession = AVCaptureSession()
        
        guard let captureSession = captureSession else { return }
        
        captureSession.sessionPreset = .high
        
        guard let display = CGMainDisplayID() as CGDirectDisplayID? else { return }
        
        let displayInput = AVCaptureScreenInput(displayID: display)
        displayInput?.minFrameDuration = CMTime(value: 1, timescale: 30)
        displayInput?.capturesCursor = true
        displayInput?.capturesMouseClicks = true
        
        if let displayInput = displayInput, captureSession.canAddInput(displayInput) {
            captureSession.addInput(displayInput)
        }
        
        videoOutput = AVCaptureVideoDataOutput()
        videoOutput?.setSampleBufferDelegate(self, queue: captureQueue)
        videoOutput?.videoSettings = [
            kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA
        ]
        
        if let videoOutput = videoOutput, captureSession.canAddOutput(videoOutput) {
            captureSession.addOutput(videoOutput)
        }
    }
    
    func startCapture() {
        captureSession?.startRunning()
        print("📹 Screen capture started")
    }
    
    func stopCapture() {
        captureSession?.stopRunning()
        print("⏹ Screen capture stopped")
    }
    
    func setFrameCallback(_ callback: @escaping (CVPixelBuffer) -> Void) {
        frameCallback = callback
    }
}

extension ScreenCapture: AVCaptureVideoDataOutputSampleBufferDelegate {
    func captureOutput(_ output: AVCaptureOutput, didOutput sampleBuffer: CMSampleBuffer, from connection: AVCaptureConnection) {
        guard let pixelBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else { return }
        frameCallback?(pixelBuffer)
    }
}