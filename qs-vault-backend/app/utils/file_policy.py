import os

MACRO_EXTENSIONS = {".docm", ".xlsm", ".pptm"}


def is_macro_file(filename: str) -> bool:
    ext = os.path.splitext(filename.lower())[1]
    return ext in MACRO_EXTENSIONS
