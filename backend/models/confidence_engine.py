import numpy as np

class ConfidenceEngine:

    def __init__(self, max_variance=100):
        self.max_variance = max_variance

    def compute(self, variance):
        confidence = 1 - (variance / self.max_variance)
        confidence = np.clip(confidence, 0, 1)
        return float(confidence)
