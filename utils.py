import requests
from datetime import datetime, timedelta
from app import app

def get_cairo_time():
    """Get current time in Cairo, Egypt using WorldTimeAPI"""
    try:
        response = requests.get("http://worldtimeapi.org/api/timezone/Africa/Cairo", timeout=10)
        if response.status_code == 200:
            data = response.json()
            # Parse the datetime string
            cairo_time_str = data["datetime"]
            cairo_time = datetime.fromisoformat(cairo_time_str.replace('Z', '+00:00'))
            return cairo_time.replace(tzinfo=None)  # Remove timezone info for MongoDB
        else:
            app.logger.warning("Failed to get Cairo time from API, using UTC")
            return datetime.utcnow()
    except Exception as e:
        app.logger.error(f"Error fetching Cairo time: {e}")
        return datetime.utcnow()

def calculate_challenge_progress(challenge):
    """Calculate challenge progress percentage"""
    try:
        start_time = challenge.start_time
        duration_days = challenge.duration_days
        current_time = datetime.utcnow()
        
        total_duration = timedelta(days=duration_days)
        elapsed_time = current_time - start_time
        
        if elapsed_time.total_seconds() < 0:
            return 0.0
        
        progress = (elapsed_time.total_seconds() / total_duration.total_seconds()) * 100
        return min(progress, 100.0)
    except Exception as e:
        app.logger.error(f"Error calculating progress: {e}")
        return 0.0

def get_daily_work_stats(challenge_id, date):
    """Get work statistics for a specific day"""
    from models import WorkSession
    
    try:
        work_session = WorkSession.query.filter_by(
            challenge_id=challenge_id,
            date=date
        ).first()
        
        if work_session:
            return {
                "minutes_worked": work_session.minutes_worked,
                "hours_worked": work_session.minutes_worked / 60
            }
        else:
            return {
                "minutes_worked": 0,
                "hours_worked": 0
            }
    except Exception as e:
        app.logger.error(f"Error getting daily work stats: {e}")
        return {"minutes_worked": 0, "hours_worked": 0}

def get_time_remaining(challenge):
    """Calculate time remaining in challenge"""
    try:
        start_time = challenge.start_time
        duration_days = challenge.duration_days
        current_time = datetime.utcnow()
        
        end_time = start_time + timedelta(days=duration_days)
        remaining = end_time - current_time
        
        if remaining.total_seconds() <= 0:
            return {"days": 0, "hours": 0, "minutes": 0, "seconds": 0, "total_seconds": 0}
        
        days = remaining.days
        hours, remainder = divmod(remaining.seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        
        return {
            "days": days,
            "hours": hours,
            "minutes": minutes,
            "seconds": seconds,
            "total_seconds": remaining.total_seconds()
        }
    except Exception as e:
        app.logger.error(f"Error calculating time remaining: {e}")
        return {"days": 0, "hours": 0, "minutes": 0, "seconds": 0, "total_seconds": 0}

def format_duration(minutes):
    """Format minutes into human readable duration"""
    if minutes < 60:
        return f"{minutes:.0f}m"
    else:
        hours = minutes / 60
        if hours < 24:
            return f"{hours:.1f}h"
        else:
            days = hours / 24
            return f"{days:.1f}d"
