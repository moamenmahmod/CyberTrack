from flask import render_template, request, redirect, url_for, flash, jsonify
from datetime import datetime, timedelta
import requests
from app import app, db
from models import Challenge, Vulnerability, WorkSession, ActivityLog
from utils import get_cairo_time, calculate_challenge_progress, get_daily_work_stats
from sqlalchemy import func

@app.route('/')
def index():
    """Home page showing all challenges"""
    challenges = Challenge.query.order_by(Challenge.created_at.desc()).all()
    active_challenge = Challenge.query.filter_by(is_active=True).first()
    
    # Calculate stats for active challenge
    stats = {}
    if active_challenge:
        total_vulnerabilities = Vulnerability.query.filter_by(challenge_id=active_challenge.id).count()
        total_earnings = db.session.query(func.sum(Vulnerability.bounty_amount)).filter_by(challenge_id=active_challenge.id).scalar() or 0
        stats = {
            "total_vulnerabilities": total_vulnerabilities,
            "total_earnings": total_earnings,
            "total_work_hours": active_challenge.total_work_minutes / 60,
            "progress": calculate_challenge_progress(active_challenge)
        }
    
    return render_template('index.html', challenges=challenges, active_challenge=active_challenge, stats=stats)

@app.route('/create_challenge', methods=['GET', 'POST'])
def create_challenge():
    """Create a new challenge"""
    if request.method == 'POST':
        name = request.form['name']
        duration_days = int(request.form['duration_days'])
        target_money = float(request.form['target_money']) if request.form['target_money'] else None
        target_vulnerabilities = int(request.form['target_vulnerabilities']) if request.form['target_vulnerabilities'] else None
        
        # Get Cairo time for challenge start
        cairo_time = get_cairo_time()
        
        # Deactivate other challenges
        Challenge.query.update({'is_active': False})
        
        # Create new challenge
        challenge = Challenge(
            name=name,
            duration_days=duration_days,
            target_money=target_money,
            target_vulnerabilities=target_vulnerabilities,
            start_time=cairo_time
        )
        
        db.session.add(challenge)
        db.session.commit()
        
        flash(f'Challenge "{name}" created successfully!', 'success')
        return redirect(url_for('challenge_detail', challenge_id=challenge.id))
    
    return render_template('create_challenge.html')

@app.route('/challenge/<int:challenge_id>')
def challenge_detail(challenge_id):
    """Challenge detail page with timer and progress"""
    try:
        challenge = Challenge.query.get(challenge_id)
        if not challenge:
            flash('Challenge not found', 'error')
            return redirect(url_for('index'))
        
        # Get vulnerabilities for this challenge
        vulnerabilities = Vulnerability.query.filter_by(challenge_id=challenge_id).order_by(Vulnerability.reported_date.desc()).all()
        
        # Calculate progress and stats
        progress = calculate_challenge_progress(challenge)
        total_earnings = sum([v.bounty_amount for v in vulnerabilities])
        total_vulns = len(vulnerabilities)
        
        # Get today's work stats
        today_stats = get_daily_work_stats(challenge_id, datetime.now().date())
        
        return render_template('challenge.html', 
                             challenge=challenge, 
                             vulnerabilities=vulnerabilities,
                             progress=progress,
                             total_earnings=total_earnings,
                             total_vulns=total_vulns,
                             today_stats=today_stats)
    except Exception as e:
        app.logger.error(f"Error in challenge_detail: {e}")
        flash('Error loading challenge', 'error')
        return redirect(url_for('index'))

@app.route('/vulnerabilities')
def vulnerabilities():
    """View all vulnerabilities"""
    active_challenge = Challenge.query.filter_by(is_active=True).first()
    if not active_challenge:
        flash('No active challenge found', 'warning')
        return redirect(url_for('index'))
    
    vulns = Vulnerability.query.filter_by(challenge_id=active_challenge.id).order_by(Vulnerability.reported_date.desc()).all()
    return render_template('vulnerabilities.html', vulnerabilities=vulns, challenge=active_challenge)

@app.route('/add_vulnerability', methods=['POST'])
def add_vulnerability():
    """Add a new vulnerability"""
    active_challenge = Challenge.query.filter_by(is_active=True).first()
    if not active_challenge:
        flash('No active challenge found', 'error')
        return redirect(url_for('index'))
    
    try:
        title = request.form['title']
        severity = request.form['severity']
        company = request.form['company']
        bounty_amount = float(request.form['bounty_amount'])
        description = request.form.get('description', '')
        
        vulnerability = Vulnerability(
            title=title,
            severity=severity,
            company=company,
            bounty_amount=bounty_amount,
            challenge_id=active_challenge.id,
            description=description
        )
        
        db.session.add(vulnerability)
        db.session.commit()
        
        flash('Vulnerability added successfully!', 'success')
    except Exception as e:
        app.logger.error(f"Error adding vulnerability: {e}")
        flash('Error adding vulnerability', 'error')
    
    return redirect(url_for('vulnerabilities'))

@app.route('/analytics')
def analytics():
    """Analytics and charts page"""
    active_challenge = Challenge.query.filter_by(is_active=True).first()
    if not active_challenge:
        flash('No active challenge found', 'warning')
        return redirect(url_for('index'))
    
    # Get work sessions for charts
    work_sessions = WorkSession.query.filter_by(challenge_id=active_challenge.id).order_by(WorkSession.date.asc()).all()
    
    # Get vulnerabilities for severity breakdown
    vulnerabilities = Vulnerability.query.filter_by(challenge_id=active_challenge.id).all()
    
    return render_template('analytics.html', 
                         challenge=active_challenge, 
                         work_sessions=work_sessions,
                         vulnerabilities=vulnerabilities)

@app.route('/api/log_activity', methods=['POST'])
def log_activity():
    """Log user activity for time tracking"""
    active_challenge = Challenge.query.filter_by(is_active=True).first()
    if not active_challenge:
        return jsonify({"error": "No active challenge"}), 404
    
    try:
        # Log activity
        activity = ActivityLog(
            challenge_id=active_challenge.id,
            timestamp=datetime.utcnow()
        )
        db.session.add(activity)
        
        # Update daily work session
        today = datetime.now().date()
        session = WorkSession.query.filter_by(
            challenge_id=active_challenge.id,
            date=today
        ).first()
        
        if session:
            # Add 5 minutes to existing session
            session.minutes_worked += 5
        else:
            # Create new session
            work_session = WorkSession(
                challenge_id=active_challenge.id,
                date=today,
                minutes_worked=5
            )
            db.session.add(work_session)
        
        # Update total work minutes in challenge
        active_challenge.total_work_minutes += 5
        
        db.session.commit()
        return jsonify({"success": True})
    except Exception as e:
        app.logger.error(f"Error logging activity: {e}")
        db.session.rollback()
        return jsonify({"error": "Failed to log activity"}), 500

@app.route('/api/challenge_data/<int:challenge_id>')
def get_challenge_data(challenge_id):
    """Get challenge data for JavaScript countdown"""
    try:
        challenge = Challenge.query.get(challenge_id)
        if not challenge:
            return jsonify({"error": "Challenge not found"}), 404
        
        # Calculate end time
        start_time = challenge.start_time
        end_time = start_time + timedelta(days=challenge.duration_days)
        
        return jsonify({
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration_days": challenge.duration_days,
            "is_active": challenge.is_active
        })
    except Exception as e:
        app.logger.error(f"Error getting challenge data: {e}")
        return jsonify({"error": "Failed to get challenge data"}), 500

@app.route('/edit_challenge/<int:challenge_id>', methods=['GET', 'POST'])
def edit_challenge(challenge_id):
    """Edit an existing challenge"""
    try:
        challenge = Challenge.query.get(challenge_id)
        if not challenge:
            flash('Challenge not found', 'error')
            return redirect(url_for('index'))
        
        if request.method == 'POST':
            challenge.name = request.form['name']
            challenge.duration_days = int(request.form['duration_days'])
            challenge.target_money = float(request.form['target_money']) if request.form['target_money'] else None
            challenge.target_vulnerabilities = int(request.form['target_vulnerabilities']) if request.form['target_vulnerabilities'] else None
            
            db.session.commit()
            flash('Challenge updated successfully!', 'success')
            return redirect(url_for('challenge_detail', challenge_id=challenge_id))
        
        return render_template('create_challenge.html', challenge=challenge, edit_mode=True)
    except Exception as e:
        app.logger.error(f"Error editing challenge: {e}")
        flash('Error editing challenge', 'error')
        return redirect(url_for('index'))

@app.route('/delete_vulnerability/<int:vuln_id>')
def delete_vulnerability(vuln_id):
    """Delete a vulnerability"""
    try:
        vulnerability = Vulnerability.query.get(vuln_id)
        if vulnerability:
            db.session.delete(vulnerability)
            db.session.commit()
            flash('Vulnerability deleted successfully!', 'success')
        else:
            flash('Vulnerability not found', 'error')
    except Exception as e:
        app.logger.error(f"Error deleting vulnerability: {e}")
        flash('Error deleting vulnerability', 'error')
    
    return redirect(url_for('vulnerabilities'))

@app.route('/toggle_challenge/<int:challenge_id>')
def toggle_challenge(challenge_id):
    """Toggle challenge active status"""
    try:
        challenge = Challenge.query.get(challenge_id)
        if challenge:
            new_status = not challenge.is_active
            
            if new_status:
                # Deactivate other challenges first
                Challenge.query.update({'is_active': False})
            
            challenge.is_active = new_status
            db.session.commit()
            
            status_text = "activated" if new_status else "deactivated"
            flash(f'Challenge {status_text} successfully!', 'success')
    except Exception as e:
        app.logger.error(f"Error toggling challenge: {e}")
        flash('Error updating challenge status', 'error')
    
    return redirect(url_for('index'))
