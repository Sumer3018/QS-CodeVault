import time


class MetricsService:
    def __init__(self):
        self.start_time = time.time()

    def elapsed_ms(self):
        return round((time.time() - self.start_time) * 1000, 2)
