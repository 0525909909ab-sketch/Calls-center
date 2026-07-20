from app.DB.connection import get_db_connection

def fetch_filtered_forecast(timeframe: str, date_str: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    if timeframe == "daily":
        query = """
            SELECT 
                timestamp::text as timestamp,
                predicted_volume,
                average_call_duration,
                TO_CHAR(timestamp, 'HH24:MI') as label
            FROM hourly_call_forecast
            WHERE timestamp::date = %s
            ORDER BY timestamp ASC;
        """
        cursor.execute(query, (date_str,))
    elif timeframe == "weekly":
        query = """
            SELECT 
                timestamp::text as timestamp,
                predicted_volume,
                average_call_duration,
                TO_CHAR(timestamp, 'MM-DD HH24:MI') as label
            FROM hourly_call_forecast
            WHERE timestamp::date BETWEEN %s AND %s::date + INTERVAL '7 days'
            ORDER BY timestamp ASC;
        """
        cursor.execute(query, (date_str, date_str))
    elif timeframe == "monthly":
        query = """
            SELECT 
                timestamp::text as timestamp,
                predicted_volume,
                average_call_duration,
                TO_CHAR(timestamp, 'MM-DD') as label
            FROM hourly_call_forecast
            WHERE EXTRACT(YEAR FROM timestamp) = EXTRACT(YEAR FROM %s::date)
              AND EXTRACT(MONTH FROM timestamp) = EXTRACT(MONTH FROM %s::date)
            ORDER BY timestamp ASC;
        """
        cursor.execute(query, (date_str, date_str))
    else:
        query = """
            SELECT 
                timestamp::text as timestamp,
                predicted_volume,
                average_call_duration,
                TO_CHAR(timestamp, 'HH24:MI') as label
            FROM hourly_call_forecast
            ORDER BY timestamp ASC;
        """
        cursor.execute(query)
    records = cursor.fetchall()
    formatted_results = []
    for row in records:
        formatted_results.append({
            "timestamp": row[0],
            "predicted_volume": row[1],
            "average_call_duration": row[2],
            "label": row[3]
        })
    cursor.close()
    conn.close()
    return formatted_results