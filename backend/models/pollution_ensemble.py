import numpy as np

class PollutionEnsemble:

    def __init__(self, models):
        self.models = models

    def predict(self, X):
        preds = []

        for model in self.models.values():
            preds.append(model.predict(X))

        preds = np.vstack(preds)
        mean_pred = np.mean(preds)
        variance = np.var(preds)

        return float(mean_pred), float(variance)
