import qrcode
import random
import string
from google.cloud import firestore
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
import pytz

def generate_qr_code(url, random_hash):
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
    canvas_height = img.height + 120  # Add padding top and bottom
    
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
    
    # Add professional footer with hash
    footer_text = f"ID: {random_hash}"
    footer_bbox = draw.textbbox((0, 0), footer_text, font=subtitle_font)
    footer_width = footer_bbox[2] - footer_bbox[0]
    footer_x = (canvas_width - footer_width) // 2
    footer_y = canvas_height - 35
    
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
    file_name = f"{current_date}_{random_hash}.png"
    
    canvas.save(file_name, quality=95, optimize=True)

def generate_random_hash(length=8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

if __name__ == "__main__":
    num_qr_codes = 1

    # Connect to Firestore
    db = firestore.Client()
    collection = db.collection("qrs")

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
                url = f"https://frontend-230228655056.asia-south1.run.app/qr/{random_hash}"
                generate_qr_code(url, random_hash)

                # Insert the document with random_hash as the document ID and also store it as "id" field
                doc_ref.set({
                    "id": random_hash,
                    "isActive": False,
                    "createdFor": "carevego",  # You can modify this value as needed
                    "createdTime": current_ist_time
                })
                print(f"Inserted QR code with document ID: {random_hash}")
                break  # Exit the loop once a unique document ID is successfully processed
            else:
                print(f"Duplicate document ID found: {random_hash}, retrying...")

    print("QR code generation and insertion completed.")