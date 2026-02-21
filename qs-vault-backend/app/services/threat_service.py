import random
import time
from app.services.encryption_service import EncryptionService


class ThreatService:

    # ================= REAL ATTACKS =================

    @staticmethod
    def bit_flip(blob: bytes):
        data = bytearray(blob)
        index = random.randint(0, len(data) - 1)
        data[index] ^= 0x01
        return bytes(data), f"Bit flipped at byte {index}"

    @staticmethod
    def corrupt_tag(blob: bytes):
        data = bytearray(blob)
        if len(data) > 40:
            data[30] ^= 0xFF
        return bytes(data), "Authentication tag corrupted"

    @staticmethod
    def truncate(blob: bytes):
        cut = random.randint(10, 40)
        return blob[:-cut], f"Ciphertext truncated by {cut} bytes"

    # ================= SIMULATED ATTACKS =================

    @staticmethod
    def mitm():
        return {
            "steps": [
                "Intercepting handshake",
                "Replacing public key",
                "Attempting rogue derivation",
                "Key mismatch"
            ],
            "defense": "Ephemeral KEM + AES-GCM authentication",
            "property": "Integrity & Forward Secrecy"
        }

    @staticmethod
    def cpa():
        return {
            "steps": [
                "Attacker observes ciphertext",
                "Running statistical analysis",
                "Entropy near maximum"
            ],
            "defense": "Semantic security of AES-GCM",
            "property": "Confidentiality"
        }

    @staticmethod
    def cca():
        return {
            "steps": [
                "Modified ciphertext submitted",
                "Attempting adaptive decrypt",
                "Tag verification failed"
            ],
            "defense": "Authenticated encryption",
            "property": "Integrity"
        }

    # ================= EXECUTION =================

    @staticmethod
    def run_attack(blob: bytes, metadata: dict, attack: str):

        # ---------- REAL ONES ----------
        if attack in ["bitflip", "tag", "truncate"]:
            if attack == "bitflip":
                modified, info = ThreatService.bit_flip(blob)
            elif attack == "tag":
                modified, info = ThreatService.corrupt_tag(blob)
            else:
                modified, info = ThreatService.truncate(blob)

            try:
                EncryptionService.process_download(
                    modified, metadata, "hybrid")
                return {
                    "status": "FAILED",
                    "attack_info": info,
                    "detail": "Tamper NOT detected"
                }
            except Exception as e:
                return {
                    "status": "DETECTED",
                    "attack_info": info,
                    "detail": str(e),
                    "defense": "AES-GCM authentication",
                    "property": "Integrity"
                }

        # ---------- SIMULATION ----------
        if attack == "mitm":
            sim = ThreatService.mitm()
        elif attack == "cpa":
            sim = ThreatService.cpa()
        elif attack == "cca":
            sim = ThreatService.cca()
        else:
            return {"status": "invalid"}

        return {
            "status": "DETECTED",
            "attack_info": f"Simulated {attack.upper()} attack",
            "steps": sim["steps"],
            "defense": sim["defense"],
            "property": sim["property"]
        }
