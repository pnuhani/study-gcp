import qrcode
import random
import string
from google.cloud import firestore
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime
import pytz

def generate_qr_code(url, random_hash):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white").convert("RGB")

    # Add the random hash to the image
    draw = ImageDraw.Draw(img)
    font_size = 15  # Adjust font size as needed
    try:
        # Use a system font (fallback to default if not available)
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        # Use default font if "arial.ttf" is not available
        font = ImageFont.load_default()

    # Position text in the lower-left corner
    text_position = (10, img.height - 20)  # Adjust for padding
    draw.text(text_position, random_hash, fill="black", font=font)

    # Generate file name with ddMMyyyy format
    current_date = datetime.now().strftime("%d%m%Y")
    file_name = f"{current_date}_{random_hash}.png"

    img.save(file_name)

def generate_random_hash(length=8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

if __name__ == "__main__":
    num_qr_codes = 2

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