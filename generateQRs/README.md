# Professional QR Code Generator

This script generates professional-looking QR codes with enhanced visual design and branding elements.

## Features

### Professional Design Elements:
- **Clean Layout**: Centered QR code with proper padding and spacing
- **Branding Header**: "CareVego QR Code" title at the top
- **Professional Typography**: Uses system fonts with fallbacks
- **Color Scheme**: Professional dark gray (#1a1a1a) QR code on white background
- **Visual Separators**: Subtle line separators for clean organization
- **Footer Information**: ID display with subtle background highlighting
- **Timestamp**: Generation date and time for tracking
- **Border**: Clean border around the entire design
- **High Quality**: 95% quality output with optimization

### Technical Improvements:
- **Higher Error Correction**: Uses ERROR_CORRECT_H for better scanning reliability
- **Larger Box Size**: 12px boxes for better visibility
- **Optimized Border**: 2px border for cleaner appearance
- **Canvas-based Design**: Professional layout with proper spacing

## Setup

1. Install dependencies:
   ```bash
   ./setup.sh
   ```

2. Run the script:
   ```bash
   python file.py
   ```

## Output

Generated QR codes will be saved with the format: `DDMMYYYY_HASH.png`

Each QR code includes:
- Professional header with branding
- Centered, high-quality QR code
- ID display in footer
- Generation timestamp
- Clean border and spacing

## Dependencies

- `qrcode[pil]`: QR code generation
- `Pillow`: Image processing
- `google-cloud-firestore`: Database operations
- `pytz`: Timezone handling 