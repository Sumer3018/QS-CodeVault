from fastapi import APIRouter
from app.services.threat_service import ThreatService
from app.services.file_repository import get_last_file


router = APIRouter(prefix="/simulate", tags=["Threat Lab"])


@router.post("/attack")
def simulate_attack(attack: str):
    file = get_last_file()  # must return blob + metadata

    result = ThreatService.run_attack(
        file["blob"],
        file["metadata"],
        attack
    )

    return result
