import pytesseract
from PIL import Image

pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

imagen = Image.open('imagen.jpeg')
texto = pytesseract.image_to_string(imagen, lang='spa')
print(texto)