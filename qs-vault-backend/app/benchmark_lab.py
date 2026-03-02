import csv
import secrets
from app.services.encryption_service import EncryptionService

VARIANTS = ["ML-KEM-512", "ML-KEM-768", "ML-KEM-1024"]

FILE_SIZES = [
    256 * 1024,
    512 * 1024,
    1024 * 1024,
    2 * 1024 * 1024,
    4 * 1024 * 1024,
    8 * 1024 * 1024
]

RUNS = 300

OUTPUT_FILE = "qs_vault_full_benchmark_dataset.csv"


def generate_data(size):
    return secrets.token_bytes(size)


def main():
    with open(OUTPUT_FILE, "w", newline="") as f:
        writer = csv.writer(f)

        # FULL HEADER
        writer.writerow([
            "variant",
            "file_size_bytes",
            "encap_us",
            "hkdf_us",
            "aes_ms",
            "pack_us",
            "crypto_time_ms",
            "io_time_ms",
            "overhead_ms",
            "crypto_percent",
            "io_percent",
            "mb_per_sec",
            "ms_per_mb",
            "ns_per_byte",
            "ciphertext_bytes",
            "expansion_ratio",
            "kem_ciphertext_size",
            "aes_nonce_size",
            "aes_tag_size",
            "aes_key_size",
            "total_ms"
        ])

        for variant in VARIANTS:
            for size in FILE_SIZES:

                print(f"🔬 Variant: {variant} | Size: {size//1024} KB")

                for run in range(RUNS):
                    data = generate_data(size)

                    enc_result = EncryptionService.process_upload(
                        data,
                        mode="hybrid",
                        variant=variant
                    )

                    metrics = enc_result["metrics"]

                    p1 = metrics.get("phase_1", {})
                    p2 = metrics.get("phase_2", {})
                    p3 = metrics.get("phase_3", {})
                    p4 = metrics.get("phase_4", {})
                    p5 = metrics.get("phase_5", {})
                    d = metrics.get("derived", {})
                    e = metrics.get("efficiency", {})
                    x = metrics.get("expansion", {})
                    s = metrics.get("structural", {})

                    writer.writerow([
                        s.get("kem_variant"),
                        p1.get("size_bytes"),
                        p2.get("encap_us"),
                        p3.get("hkdf_us"),
                        p4.get("aes_enc_ms"),
                        p5.get("pack_us"),
                        d.get("crypto_time_ms"),
                        d.get("io_time_ms"),
                        d.get("overhead_ms"),
                        d.get("crypto_percent"),
                        d.get("io_percent"),
                        e.get("mb_per_sec"),
                        e.get("ms_per_mb"),
                        e.get("time_per_byte_ns"),
                        x.get("ciphertext_bytes"),
                        x.get("expansion_ratio"),
                        s.get("kem_ciphertext"),
                        s.get("aes_nonce"),
                        s.get("aes_tag"),
                        s.get("aes_key_size"),
                        metrics.get("total_ms")
                    ])

    print("\n✅ FULL benchmark complete.")


if __name__ == "__main__":
    main()
