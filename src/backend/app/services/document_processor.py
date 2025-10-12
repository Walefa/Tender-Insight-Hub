import PyPDF2
import docx
import zipfile
import io
from typing import Optional

class DocumentProcessor:
    async def extract_text_from_pdf(self, file_content: bytes) -> str:
        """Extract text from PDF file"""
        try:
            pdf_file = io.BytesIO(file_content)
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            return ""
    
    async def extract_text_from_docx(self, file_content: bytes) -> str:
        """Extract text from DOCX file"""
        try:
            doc_file = io.BytesIO(file_content)
            doc = docx.Document(doc_file)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            print(f"Error extracting DOCX text: {e}")
            return ""
    
    async def extract_text_from_zip(self, file_content: bytes) -> str:
        """Extract text from ZIP file containing documents"""
        try:
            zip_file = io.BytesIO(file_content)
            text_content = []
            with zipfile.ZipFile(zip_file, 'r') as zip_ref:
                for file_name in zip_ref.namelist():
                    if file_name.endswith('.pdf'):
                        with zip_ref.open(file_name) as file:
                            text = await self.extract_text_from_pdf(file.read())
                            text_content.append(text)
                    elif file_name.endswith('.docx'):
                        with zip_ref.open(file_name) as file:
                            text = await self.extract_text_from_docx(file.read())
                            text_content.append(text)
            return "\n".join(text_content)
        except Exception as e:
            print(f"Error extracting ZIP contents: {e}")
            return ""
    
    async def process_document(self, file_content: bytes, file_extension: str) -> str:
        """Process document based on file type"""
        if file_extension.lower() == '.pdf':
            return await self.extract_text_from_pdf(file_content)
        elif file_extension.lower() == '.docx':
            return await self.extract_text_from_docx(file_content)
        elif file_extension.lower() == '.zip':
            return await self.extract_text_from_zip(file_content)
        else:
            raise ValueError(f"Unsupported file type: {file_extension}")