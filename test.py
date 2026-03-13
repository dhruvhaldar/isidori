import pypdf
import re

def count_words_in_pdf(file_path):
    """
    Extracts text from a PDF file and counts the total number of words.
    """
    total_words = 0
    try:
        with open(file_path, 'rb') as file:
            reader = pypdf.PdfReader(file)
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    # Use regex to find all sequences of word characters and count them
                    words = re.findall(r'\b\w+\b', text.lower())
                    total_words += len(words)
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    
    return total_words

# Example usage:
pdf_file_path = 'Manuscript.pdf' # Replace with the path to your PDF file
word_count = count_words_in_pdf(pdf_file_path)

if word_count is not None:
    print(f"The total number of words in '{pdf_file_path}' is: {word_count}")

