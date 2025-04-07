# TigerTag Project

This project is a modular Node.js implementation for handling smartcard protocols. It includes:

- **TigerTag Maker**: Modules for reading, writing, and decoding data on the smartcard.
- **TigerTag Pro Stub**: Automatically calls an API if the tag version is "TigerTag Pro V1.0" (with a fallback to chip data).
- **Future Protocols**: Stubs for additional protocols (BambuLab, Creality, Elegoo, Anycubic, Prusa).

## Project Structure

- **src/main.js**: Main process for Electron.
- **src/preload.js**: Preload script exposing APIs to the renderer.
- **src/renderer/**: Contains the HTML and CSS for the user interface.
  - **home.html**: Home screen with "Scan" and "Make" buttons.
  - **make.html**: Form interface to program the TigerTag.
  - **styles.css**: Modern styling for the UI.
- **src/protocols/**: Contains protocol-specific modules.
  - **tigertag/**: Implementation for TigerTag Maker and Pro.
  - **bambulab/**, **creality/**, **elegoo/**, **anycubic/**, **prusa/**: Placeholder modules for future protocols.
- **src/utils/**: Utility modules (logger, smartcard interface).
- **test/**: Contains test cases (using Jest).

## Setup

1. Install dependencies:

   ```bash
   npm install