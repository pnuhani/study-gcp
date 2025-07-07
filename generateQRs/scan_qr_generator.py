import qrcode
import random
import string
from google.cloud import firestore
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
import pytz

def generate_scan_qr_code(url, random_hash):
    # Create QR code with better parameters for professional look
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,  # Higher error correction for better scanning
        box_size=12,  # Larger boxes for better visibility
        border=2,  # Smaller border for cleaner look
    )
    qr.add_data(url)
    qr.make(fit=True)

    # Create QR image with professional colors
    img = qr.make_image(fill_color="#1a1a1a", back_color="#ffffff").convert("RGB")
    
    # Create a larger canvas for professional layout
    canvas_width = img.width + 80  # Add padding on sides
    canvas_height = img.height + 140  # Add padding top and bottom
    
    # Create new image with white background
    canvas = Image.new("RGB", (canvas_width, canvas_height), "#ffffff")
    
    # Calculate center position for QR code
    qr_x = (canvas_width - img.width) // 2
    qr_y = 40  # Top padding
    
    # Paste QR code onto canvas
    canvas.paste(img, (qr_x, qr_y))
    
    # Create drawing object
    draw = ImageDraw.Draw(canvas)
    
    # Try to load professional fonts
    try:
        # Try different professional fonts
        title_font = ImageFont.truetype("Arial-Bold.ttf", 18)
        subtitle_font = ImageFont.truetype("Arial.ttf", 14)
    except:
        try:
            title_font = ImageFont.truetype("arial.ttf", 18)
            subtitle_font = ImageFont.truetype("arial.ttf", 14)
        except:
            # Fallback to default fonts
            title_font = ImageFont.load_default()
            subtitle_font = ImageFont.load_default()
    
    # Add professional header
    header_text = "CareVego Scan QR"
    header_bbox = draw.textbbox((0, 0), header_text, font=title_font)
    header_width = header_bbox[2] - header_bbox[0]
    header_x = (canvas_width - header_width) // 2
    header_y = 10
    
    # Add subtle background for header text
    padding = 8
    header_bg_bbox = [
        header_x - padding,
        header_y - padding,
        header_x + header_width + padding,
        header_y + 25 + padding
    ]
    draw.rectangle(header_bg_bbox, fill="#e3f2fd", outline="#2196f3")
    draw.text((header_x, header_y), header_text, fill="#1976d2", font=title_font)
    
    # Add professional footer with hash
    footer_text = f"Scan Token: {random_hash}"
    footer_bbox = draw.textbbox((0, 0), footer_text, font=subtitle_font)
    footer_width = footer_bbox[2] - footer_bbox[0]
    footer_x = (canvas_width - footer_width) // 2
    footer_y = canvas_height - 45
    
    # Add subtle background for footer text
    padding = 8
    footer_bg_bbox = [
        footer_x - padding,
        footer_y - padding,
        footer_x + footer_width + padding,
        footer_y + 20 + padding
    ]
    draw.rectangle(footer_bg_bbox, fill="#f8f9fa", outline="#e9ecef")
    draw.text((footer_x, footer_y), footer_text, fill="#495057", font=subtitle_font)
    
    # Add subtle border
    draw.rectangle([0, 0, canvas_width-1, canvas_height-1], outline="#dee2e6", width=2)
    
    # Generate file name with ddMMyyyy format
    current_date = datetime.now().strftime("%d%m%Y")
    file_name = f"scan_{current_date}_{random_hash}.png"
    
    canvas.save(file_name, quality=95, optimize=True)
    return file_name

def generate_random_hash(length=8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

if __name__ == "__main__":
    num_qr_codes = 1

    # Connect to Firestore
    db = firestore.Client()
    collection = db.collection("scan_qrs")

    # Get current IST time
    ist_tz = pytz.timezone('Asia/Kolkata')
    current_ist_time = datetime.now(ist_tz)

    # Generate and save QR codes in a loop
    for _ in range(num_qr_codes):
        while True:  # Keep trying until a unique id is generated
            random_hash = generate_random_hash()

            # Check if the document with this ID already exists
            doc_ref = collection.document(random_hash)
            doc = doc_ref.get()
            
            if not doc.exists:  # If document doesn't exist
                # Generate URL for scan functionality
                # This URL will open the scan interface with the QR token
                url = f"https://frontend-230228655056.asia-south1.run.app/scan?qrToken={random_hash}"
                
                file_name = generate_scan_qr_code(url, random_hash)

                # Insert the document with random_hash as the document ID
                doc_ref.set({
                    "id": random_hash,
                    "type": "scan_qr",
                    "isActive": True,
                    "createdFor": "scan_functionality",
                    "createdTime": current_ist_time,
                    "url": url
                })
                print(f"Generated scan QR code with ID: {random_hash}")
                print(f"File saved as: {file_name}")
                print(f"Scan URL: {url}")
                break  # Exit the loop once a unique document ID is successfully processed
            else:
                print(f"Duplicate document ID found: {random_hash}, retrying...")

    print("Scan QR code generation and insertion completed.") 