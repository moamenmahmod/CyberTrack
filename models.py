from datetime import datetime
from app import db

class Challenge(db.Model):
    __tablename__ = 'challenges'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    duration_days = db.Column(db.Integer, nullable=False)
    target_money = db.Column(db.Float, nullable=True)
    target_vulnerabilities = db.Column(db.Integer, nullable=True)
    start_time = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    total_work_minutes = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    vulnerabilities = db.relationship("Vulnerability", back_populates="challenge", cascade="all, delete-orphan")
    work_sessions = db.relationship("WorkSession", back_populates="challenge", cascade="all, delete-orphan")
    activity_logs = db.relationship("ActivityLog", back_populates="challenge", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Challenge {self.name}>'

class Vulnerability(db.Model):
    __tablename__ = 'vulnerabilities'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(500), nullable=False)
    severity = db.Column(db.String(50), nullable=False)  # Critical, High, Medium, Low
    company = db.Column(db.String(255), nullable=False)
    bounty_amount = db.Column(db.Float, nullable=False, default=0.0)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id'), nullable=False)
    description = db.Column(db.Text, nullable=True)
    reported_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    challenge = db.relationship("Challenge", back_populates="vulnerabilities")
    
    def __repr__(self):
        return f'<Vulnerability {self.title}>'

class WorkSession(db.Model):
    __tablename__ = 'work_sessions'
    
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id'), nullable=False)
    date = db.Column(db.Date, nullable=False)
    minutes_worked = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    challenge = db.relationship("Challenge", back_populates="work_sessions")
    
    def __repr__(self):
        return f'<WorkSession {self.date} - {self.minutes_worked}min>'

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    challenge_id = db.Column(db.Integer, db.ForeignKey('challenges.id'), nullable=False)
    timestamp = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    activity_type = db.Column(db.String(50), nullable=False, default='work')
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    challenge = db.relationship("Challenge", back_populates="activity_logs")
    
    def __repr__(self):
        return f'<ActivityLog {self.timestamp}>'