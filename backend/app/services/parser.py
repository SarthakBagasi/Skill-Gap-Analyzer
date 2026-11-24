import io
import re
from typing import Tuple
import pymupdf
import docx


def preserve_clean_text(raw_text: str) -> str:
    """
    Cleans raw document text while carefully preserving technical terms, symbols,
    and tokens such as C++, C#, .NET, Node.js, CI/CD, Next.js, TCP/IP, etc.
    """
    if not raw_text:
        return ""

    # Normalize carriage returns and tabs
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n").replace("\t", " ")

    # Normalize zero-width and non-breaking spaces
    text = re.sub(r"[\u200b\u200c\u200d\u00a0]", " ", text)

    # Protect specific known tokens before general punctuation handling
    # E.g. C++ -> __TOKEN_CPP__, C# -> __TOKEN_CSHARP__, .NET -> __TOKEN_DOTNET__
    # Node.js -> __TOKEN_NODEJS__, Next.js -> __TOKEN_NEXTJS__
    tokens_map = {
        r"\bC\+\+": " C++ ",
        r"\bC#": " C# ",
        r"\.NET\b": " .NET ",
        r"\bNode\.js\b": " Node.js ",
        r"\bNext\.js\b": " Next.js ",
        r"\bCI/CD\b": " CI/CD ",
        r"\bTCP/IP\b": " TCP/IP ",
    }

    # Replace multiple spaces with a single space, preserving newlines
    lines = []
    for line in text.split("\n"):
        line = re.sub(r"[ \t]+", " ", line).strip()
        if line:
            lines.append(line)

    cleaned = "\n".join(lines)
    return cleaned


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extracts raw text from a PDF file using PyMuPDF."""
    text_parts = []
    with pymupdf.open(stream=file_bytes, filetype="pdf") as doc:
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            if text:
                text_parts.append(text)
    return preserve_clean_text("\n".join(text_parts))


def extract_text_from_docx(file_bytes: bytes) -> str:
    """Extracts raw text from a DOCX file including paragraphs and tables."""
    doc = docx.Document(io.BytesIO(file_bytes))
    text_parts = []

    # Paragraphs
    for para in doc.paragraphs:
        if para.text.strip():
            text_parts.append(para.text.strip())

    # Tables
    for table in doc.tables:
        for row in table.rows:
            row_cells = [cell.text.strip() for cell in row.cells if cell.text.strip()]
            if row_cells:
                text_parts.append(" | ".join(row_cells))

    return preserve_clean_text("\n".join(text_parts))


def parse_document(file_bytes: bytes, filename: str) -> Tuple[str, str]:
    """
    Parses document according to extension. Returns (extracted_text, document_type).
    """
    ext = filename.lower().split(".")[-1]
    if ext == "pdf":
        return extract_text_from_pdf(file_bytes), "pdf"
    elif ext in ("docx", "doc"):
        return extract_text_from_docx(file_bytes), "docx"
    else:
        # Fallback to plain text
        try:
            return preserve_clean_text(file_bytes.decode("utf-8")), "text"
        except UnicodeDecodeError:
            return preserve_clean_text(file_bytes.decode("latin-1", errors="ignore")), "text"
