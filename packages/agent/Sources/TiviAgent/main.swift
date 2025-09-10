import Foundation
import AppKit
import CoreGraphics

print("Tivi Agent for macOS")
print("Starting remote desktop agent...")

let agent = TiviAgent()
agent.start()

RunLoop.main.run()