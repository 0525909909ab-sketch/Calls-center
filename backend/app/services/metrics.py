import math

def calculate_required_agents(predicted_volume: int, avg_duration_sec: int) -> int:
    raw_required = (predicted_volume * avg_duration_sec) / 3600
    rounded_agents = math.ceil(raw_required)
    return max(1, rounded_agents)