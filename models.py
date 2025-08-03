from datetime import datetime
from app import db
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import relationship

class Challenge(db.Model):
    __tablename__ = 'challenges'
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    duration_days = Column(Integer, nullable=False)
    target_money = Column(Float, nullable=True)
    target_vulnerabilities = Column(Integer, nullable=True)
    start_time = Column(DateTime, nullable=False, default=datetime.utcnow)
    is_active = Column(Boolean, nullable=False, default=True)
    total_work_minutes = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    vulnerabilities = relationship("Vulnerability", back_populates="challenge", cascade="all, delete-orphan")
    work_sessions = relationship("WorkSession", back_populates="challenge", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="challenge", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f'<Challenge {self.name}>'

class Vulnerability(db.Model):
    __tablename__ = 'vulnerabilities'
    
    id = Column(Integer, primary_key=True)
    title = Column(String(500), nullable=False)
    severity = Column(String(50), nullable=False)  # Critical, High, Medium, Low
    company = Column(String(255), nullable=False)
    bounty_amount = Column(Float, nullable=False, default=0.0)
    challenge_id = Column(Integer, ForeignKey('challenges.id'), nullable=False)
    description = Column(Text, nullable=True)
    reported_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    challenge = relationship("Challenge", back_populates="vulnerabilities")
    
    def __repr__(self):
        return f'<Vulnerability {self.title}>'

class WorkSession(db.Model):
    __tablename__ = 'work_sessions'
    
    id = Column(Integer, primary_key=True)
    challenge_id = Column(Integer, ForeignKey('challenges.id'), nullable=False)
    date = Column(Date, nullable=False)
    minutes_worked = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    challenge = relationship("Challenge", back_populates="work_sessions")
    
    def __repr__(self):
        return f'<WorkSession {self.date} - {self.minutes_worked}min>'

class ActivityLog(db.Model):
    __tablename__ = 'activity_logs'
    
    id = Column(Integer, primary_key=True)
    challenge_id = Column(Integer, ForeignKey('challenges.id'), nullable=False)
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    activity_type = Column(String(50), nullable=False, default='work')
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    challenge = relationship("Challenge", back_populates="activity_logs")
    
    def __repr__(self):
        return f'<ActivityLog {self.timestamp}>'
