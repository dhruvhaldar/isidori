#!/usr/bin/env python3

# ------------------------------------------------------------------
# Script Name:   pdfcwcount.py
# Description:   A Python Script to Count Characters and Words
#                in a PDF File.
# Website:       https://gist.github.com/ostechnix
# Version:       1.0
# Usage:         python pdfcwcount.py filename
# ------------------------------------------------------------------

import PyPDF2
import argparse

def extract_text_from_pdf(file_path):
    """Extracts text from a PDF file."""
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ''
            for page in range(len(reader.pages)):
                text += reader.pages[page].extract_text()
            return text
    except FileNotFoundError:
        print(f"The file {file_path} does not exist.")
        return ''

def count_words_in_text(text):
    """Counts the number of words in a given text."""
    words = text.split()
    return len(words)

def count_characters_in_text(text, include_newlines=True):
    """Counts the number of characters in a given text."""
    if not include_newlines:
        text = text.replace('\n', '')
    return len(text)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Count the number of words and characters in a PDF file.")
    parser.add_argument("file_path", type=str, help="Path to the PDF file.")
    
    args = parser.parse_args()

    text = extract_text_from_pdf(args.file_path)

    if text:
        # Calculate counts
        word_count = count_words_in_text(text)
        character_count_with_newlines = count_characters_in_text(text, include_newlines=True)
        character_count_without_newlines = count_characters_in_text(text, include_newlines=False)

        # Display results in a neat format
        print("\n--- PDF File Analysis Report ---")
        print(f"File: {args.file_path}")
        print(f"Total Words: {word_count}")
        print(f"Total Characters (including newlines): {character_count_with_newlines}")
        print(f"Total Characters (excluding newlines): {character_count_without_newlines}")
        print("-----------------------------\n")