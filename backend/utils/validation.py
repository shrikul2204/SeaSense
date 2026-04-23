def validate_features(data):

    if "features" not in data:
        return False, "Missing features"

    if not isinstance(data["features"], list):
        return False, "Features must be list"

    if len(data["features"]) != 4:
        return False, "Exactly 4 features required"

    for v in data["features"]:
        if not isinstance(v, (int, float)):
            return False, "Features must be numeric"

    return True, "Valid"
