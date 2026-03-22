/**
 * MoodRecommender.tsx - Enhanced mood-based activity recommender
 */

import { useState, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { useWellness } from '../context/WellnessContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../tokens';
import { useAnimation } from '../lib/animations';
import type { EmotionState, MoodRecommendation } from '../types/wellness';

interface MoodRecommenderProps {
  currentMood?: EmotionState;
  onComplete?: () => void;
  hideMoodSelector?: boolean;
}

export default function MoodRecommender({ currentMood, onComplete, hideMoodSelector = true }: MoodRecommenderProps) {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { getRecommendations, completeActivity, activityCompletions } = useNotifications();
  const { analyzeSentiment } = useWellness();
  
  const [selectedMood, setSelectedMood] = useState<EmotionState>(currentMood || 'neutral');
  const [recommendations, setRecommendations] = useState<MoodRecommendation | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [completionRating, setCompletionRating] = useState(0);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showCompletion, setShowCompletion] = useState(false);
  const [moodAfter, setMoodAfter] = useState<EmotionState>('neutral');
  const { isAnimating: isRecommendationsAnimating, show: showRecommendations } = useAnimation();
  const { isAnimating: isModalAnimating, show: showModal, hide: hideModal } = useAnimation();

  const moods: Array<{ mood: EmotionState; label: string; icon: string; color: string }> = [
    { mood: 'positive', label: 'Great', icon: '😊', color: '#10B981' },
    { mood: 'neutral', label: 'Neutral', icon: '😐', color: '#6B7280' },
    { mood: 'anxious', label: 'Anxious', icon: '😰', color: '#F59E0B' },
    { mood: 'sad', label: 'Sad', icon: '😢', color: '#3B82F6' },
    { mood: 'angry', label: 'Angry', icon: '😠', color: '#EF4444' },
    { mood: 'stressed', label: 'Stressed', icon: '😤', color: '#8B5CF6' },
    { mood: 'lonely', label: 'Lonely', icon: '😔', color: '#EC4899' },
    { mood: 'tired', label: 'Tired', icon: '😴', color: '#14B8A6' },
    { mood: 'overwhelmed', label: 'Overwhelmed', icon: '🤯', color: '#F97316' },
  ];

  useEffect(() => {
    if (selectedMood) {
      const newRecommendations = getRecommendations(selectedMood);
      setRecommendations(newRecommendations);
      // Trigger animation for recommendations
      setTimeout(() => showRecommendations(), 100);
    }
  }, [selectedMood, getRecommendations, showRecommendations]);

  // Handle modal animations
  useEffect(() => {
    if (showCompletion) {
      showModal();
    } else {
      hideModal();
    }
  }, [showCompletion, showModal, hideModal]);

  // Get recent completions for this mood
  const recentCompletions = activityCompletions
    .filter(c => c.mood === selectedMood && c.completedAt > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime());

  const handleMoodSelect = (mood: EmotionState) => {
    setSelectedMood(mood);
    setSelectedActivity(null);
    setShowCompletion(false);
  };

  const handleActivityStart = (activityId: string) => {
    setSelectedActivity(activityId);
  };

  const handleActivityComplete = () => {
    if (!selectedActivity || !recommendations) return;

    const activity = recommendations.activities.find(a => a.id === selectedActivity);
    if (!activity) return;

    completeActivity({
      activityId: selectedActivity,
      completedAt: new Date(),
      mood: selectedMood,
      moodAfter,
      effectiveness: completionRating,
      notes: completionNotes,
    });

    setShowCompletion(false);
    setSelectedActivity(null);
    setCompletionRating(0);
    setCompletionNotes('');
    
    if (onComplete) {
      onComplete();
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      easy: '#10B981',
      moderate: '#F59E0B',
      challenging: '#EF4444',
    };
    return colors[difficulty as keyof typeof colors] || colors.easy;
  };

  const selectedActivityData = recommendations?.activities.find(a => a.id === selectedActivity);

  return (
    <div 
      className="scale-enter"
      style={{
        background: t.card,
        borderRadius: 16,
        padding: 24,
        border: `1px solid ${t.border}`,
      }}
    >
      <h2 style={{
        fontSize: 24,
        fontWeight: 700,
        color: t.textPrimary,
        margin: '0 0 8px',
        fontFamily: 'var(--font-sans)',
      }}>
        Mood-Based Recommendations
      </h2>
      <p style={{
        fontSize: 14,
        color: t.textMuted,
        margin: '0 0 24px',
        fontFamily: 'var(--font-sans)',
      }}>
        Get personalized activity suggestions based on how you're feeling
      </p>

      {/* Mood Selection */}
      {!hideMoodSelector && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 600,
            color: t.textPrimary,
            margin: '0 0 12px',
            fontFamily: 'var(--font-sans)',
          }}>
            How are you feeling right now?
          </h3>
          
          <div 
            className="stagger-children"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
              gap: 8,
            }}
          >
            {moods.map(({ mood, label, icon, color }) => (
              <button
                key={mood}
                onClick={() => handleMoodSelect(mood)}
                className="hover-scale focus-ring"
                style={{
                  padding: '12px 8px',
                  borderRadius: 12,
                  border: selectedMood === mood ? `2px solid ${color}` : `1px solid ${t.border}`,
                  background: selectedMood === mood ? `${color}11` : t.bg,
                  color: t.textPrimary,
                  cursor: 'pointer',
                  textAlign: 'center',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s ease-out',
                  transform: selectedMood === mood ? 'scale(1.05)' : 'scale(1)',
                }}
              >
                <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600 }}>{label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Activity Completion Modal */}
      {showCompletion && selectedActivityData && (
        <div 
          className={isModalAnimating ? 'fade-enter' : ''}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: 20,
            opacity: isModalAnimating ? 1 : 0,
            transition: 'opacity 0.2s ease-out',
          }}
        >
          <div 
            className={isModalAnimating ? 'scale-enter' : ''}
            style={{
              background: t.bg,
              borderRadius: 20,
              padding: 32,
              maxWidth: 500,
              width: '100%',
              border: `1px solid ${t.border}`,
              transform: isModalAnimating ? 'scale(1) translateY(0)' : 'scale(0.95) translateY(10px)',
              transition: 'all 0.2s ease-out',
            }}
          >
            <h3 style={{
              fontSize: 20,
              fontWeight: 600,
              color: t.textPrimary,
              margin: '0 0 16px',
              fontFamily: 'var(--font-sans)',
            }}>
              How did it go?
            </h3>
            
            <p style={{
              fontSize: 14,
              color: t.textMuted,
              margin: '0 0 20px',
              fontFamily: 'var(--font-sans)',
            }}>
              You just completed: <strong>{selectedActivityData.title}</strong>
            </p>

            {/* Mood After */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: t.textPrimary,
                marginBottom: 8,
                fontFamily: 'var(--font-sans)',
              }}>
                How do you feel now?
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: 8,
              }}>
                {moods.slice(0, 5).map(({ mood, icon }) => (
                  <button
                    key={mood}
                    onClick={() => setMoodAfter(mood)}
                    style={{
                      padding: 8,
                      borderRadius: 8,
                      border: moodAfter === mood ? `2px solid #10B981` : `1px solid ${t.border}`,
                      background: moodAfter === mood ? '#10B98111' : t.card,
                      cursor: 'pointer',
                      fontSize: 20,
                    }}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Effectiveness Rating */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: t.textPrimary,
                marginBottom: 8,
                fontFamily: 'var(--font-sans)',
              }}>
                How helpful was this activity? (1-5)
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setCompletionRating(rating)}
                    className="hover-scale focus-ring"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      border: completionRating >= rating ? '2px solid #10B981' : `1px solid ${t.border}`,
                      background: completionRating >= rating ? '#10B981' : t.card,
                      color: completionRating >= rating ? 'white' : t.textPrimary,
                      cursor: 'pointer',
                      fontSize: 16,
                      fontWeight: 'bold',
                      transition: 'all 0.2s ease-out',
                      transform: completionRating >= rating ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 600,
                color: t.textPrimary,
                marginBottom: 8,
                fontFamily: 'var(--font-sans)',
              }}>
                Notes (optional)
              </label>
              <textarea
                value={completionNotes}
                onChange={(e) => setCompletionNotes(e.target.value)}
                placeholder="Any thoughts or reflections..."
                rows={3}
                style={{
                  width: '100%',
                  padding: 12,
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.card,
                  color: t.textPrimary,
                  fontSize: 14,
                  fontFamily: 'var(--font-sans)',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
            }}>
              <button
                onClick={() => setShowCompletion(false)}
                className="hover-lift focus-ring"
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: 'transparent',
                  color: t.textMuted,
                  border: `1px solid ${t.border}`,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s ease-out',
                }}
              >
                Skip
              </button>
              <button
                onClick={handleActivityComplete}
                disabled={completionRating === 0}
                className={completionRating === 0 ? '' : 'hover-lift focus-ring'}
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: completionRating === 0 ? t.textMuted : '#10B981',
                  color: 'white',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: completionRating === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 0.2s ease-out',
                }}
              >
                Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {recommendations && (
        <div 
          className={isRecommendationsAnimating ? 'fade-enter' : ''}
          style={{
            opacity: isRecommendationsAnimating ? 1 : 0,
            transition: 'opacity 0.3s ease-out',
          }}
        >
          <div style={{
            background: dark ? '#1F2937' : '#F9FAFB',
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
          }}>
            <h4 style={{
              fontSize: 14,
              fontWeight: 600,
              color: t.textPrimary,
              margin: '0 0 8px',
              fontFamily: 'var(--font-sans)',
            }}>
              Why these recommendations?
            </h4>
            <p style={{
              fontSize: 13,
              color: t.textMuted,
              margin: 0,
              lineHeight: 1.5,
              fontFamily: 'var(--font-sans)',
            }}>
              {recommendations.reasoning}
            </p>
          </div>

          <div 
            className="stagger-children"
            style={{
              display: 'grid',
              gap: 16,
            }}
          >
            {recommendations.activities.map((activity) => (
              <div
                key={activity.id}
                className="hover-lift"
                style={{
                  background: t.bg,
                  borderRadius: 12,
                  padding: 20,
                  border: `1px solid ${t.border}`,
                  transition: 'all 0.2s ease-out',
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: 12,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 24 }}>{activity.icon}</span>
                    <div>
                      <h4 style={{
                        fontSize: 16,
                        fontWeight: 600,
                        color: t.textPrimary,
                        margin: '0 0 4px',
                        fontFamily: 'var(--font-sans)',
                      }}>
                        {activity.title}
                      </h4>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <span style={{
                          fontSize: 12,
                          color: t.textMuted,
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {activity.duration}
                        </span>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: getDifficultyColor(activity.difficulty),
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                          fontFamily: 'var(--font-sans)',
                        }}>
                          {activity.difficulty}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p style={{
                  fontSize: 14,
                  color: t.textMuted,
                  margin: '0 0 16px',
                  lineHeight: 1.5,
                  fontFamily: 'var(--font-sans)',
                }}>
                  {activity.description}
                </p>

                {activity.instructions && (
                  <div style={{ marginBottom: 16 }}>
                    <h5 style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: t.textPrimary,
                      margin: '0 0 8px',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      How to do it:
                    </h5>
                    <ul style={{
                      margin: 0,
                      paddingLeft: 20,
                      color: t.textMuted,
                      fontSize: 13,
                      lineHeight: 1.4,
                    }}>
                      {activity.instructions.map((instruction, index) => (
                        <li key={index} style={{ marginBottom: 4 }}>
                          {instruction}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div style={{
                  display: 'flex',
                  gap: 8,
                }}>
                  <button
                    onClick={() => handleActivityStart(activity.id)}
                    className="hover-lift focus-ring"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: '#10B981',
                      color: 'white',
                      border: 'none',
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      transition: 'all 0.2s ease-out',
                    }}
                  >
                    Start Activity
                  </button>
                  <button
                    onClick={() => {
                      setSelectedActivity(activity.id);
                      setShowCompletion(true);
                    }}
                    className="hover-lift focus-ring"
                    style={{
                      padding: '8px 16px',
                      borderRadius: 8,
                      background: 'transparent',
                      color: t.textMuted,
                      border: `1px solid ${t.border}`,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontFamily: 'var(--font-sans)',
                      transition: 'all 0.2s ease-out',
                    }}
                  >
                    Mark as Done
                  </button>
                  {activity.externalLink && (
                    <button
                      onClick={() => window.open(activity.externalLink, '_blank')}
                      className="hover-lift focus-ring"
                      style={{
                        padding: '8px 16px',
                        borderRadius: 8,
                        background: 'transparent',
                        color: '#3B82F6',
                        border: `1px solid #3B82F6`,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        fontFamily: 'var(--font-sans)',
                        transition: 'all 0.2s ease-out',
                      }}
                    >
                      Learn More
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity History */}
          {recentCompletions.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <h4 style={{
                fontSize: 16,
                fontWeight: 600,
                color: t.textPrimary,
                margin: '0 0 12px',
                fontFamily: 'var(--font-sans)',
              }}>
                Recent Activity History
              </h4>
              
              <div style={{
                background: dark ? '#1F2937' : '#F9FAFB',
                borderRadius: 12,
                padding: 16,
              }}>
                {recentCompletions.slice(0, 3).map((completion) => (
                  <div key={completion.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: `1px solid ${t.border}`,
                  }}>
                    <div>
                      <span style={{
                        fontSize: 13,
                        fontWeight: 600,
                        color: t.textPrimary,
                        fontFamily: 'var(--font-sans)',
                      }}>
                        {recommendations.activities.find(a => a.id === completion.activityId)?.title || completion.activityId}
                      </span>
                      <div style={{ fontSize: 11, color: t.textMuted }}>
                        {completion.completedAt.toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}>
                      <div style={{ display: 'flex' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <span
                            key={star}
                            style={{
                              color: star <= completion.effectiveness ? '#F59E0B' : t.border,
                              fontSize: 14,
                            }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}