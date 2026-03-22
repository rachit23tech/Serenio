/**
 * ExerciseModal.tsx - Interactive guided exercise modal
 */

import { useState, useEffect } from 'react';
import { useWellness } from '../context/WellnessContext';
import { useTheme } from '../context/ThemeContext';
import { getTheme } from '../tokens';
import type { GuidedExercise } from '../types/wellness';

interface ExerciseModalProps {
  exercise: GuidedExercise;
  isOpen: boolean;
  onClose: () => void;
}

export default function ExerciseModal({ exercise, isOpen, onClose }: ExerciseModalProps) {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { updateExercise } = useWellness();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isComplete, setIsComplete] = useState(false);

  // Initialize answers from existing exercise data
  useEffect(() => {
    if (exercise) {
      const initialAnswers: Record<number, string> = {};
      exercise.steps.forEach((step) => {
        if (step.userInput) {
          initialAnswers[step.stepNumber - 1] = step.userInput;
        }
      });
      setAnswers(initialAnswers);
      
      // If exercise was completed, show completion state
      if (exercise.completedAt) {
        setIsComplete(true);
      }
    }
  }, [exercise]);

  if (!isOpen) return null;

  const currentStepData = exercise.steps[currentStep];
  const totalSteps = exercise.steps.length;

  const handleAnswerChange = (value: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentStep]: value
    }));
  };

  const handleNext = () => {
    // Save current answer to the exercise
    const updatedSteps = exercise.steps.map((step, index) => {
      if (index === currentStep) {
        return { ...step, userInput: answers[currentStep] };
      }
      return step;
    });

    updateExercise(exercise.id, { steps: updatedSteps });

    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete the exercise
      const completedExercise = {
        steps: updatedSteps,
        completedAt: new Date(),
      };
      updateExercise(exercise.id, completedExercise);
      setIsComplete(true);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Save current progress before closing
    if (answers[currentStep]) {
      const updatedSteps = exercise.steps.map((step, index) => {
        if (index === currentStep) {
          return { ...step, userInput: answers[currentStep] };
        }
        return step;
      });
      updateExercise(exercise.id, { steps: updatedSteps });
    }
    onClose();
  };

  const handleRestart = () => {
    setIsComplete(false);
    setCurrentStep(0);
    setAnswers({});
    // Clear completion status
    updateExercise(exercise.id, { completedAt: undefined });
  };

  return (
    <div 
      className="fade-enter"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 20,
      }}
    >
      <div 
        className="scale-enter"
        style={{
          background: t.bg,
          borderRadius: 20,
          padding: 32,
          maxWidth: 600,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          border: `1px solid ${t.border}`,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}>
          <div>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: t.textPrimary,
              margin: '0 0 8px',
              fontFamily: 'var(--font-sans)',
            }}>
              {exercise.name}
            </h2>
            <p style={{
              fontSize: 14,
              color: t.textMuted,
              margin: 0,
              fontFamily: 'var(--font-sans)',
            }}>
              {exercise.description} • {exercise.durationMinutes} min
            </p>
          </div>
          <button
            onClick={handleClose}
            className="hover-scale focus-ring"
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              border: 'none',
              background: t.card,
              color: t.textMuted,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
              fontWeight: 'bold',
              transition: 'all 0.15s ease-out',
            }}
          >
            ×
          </button>
        </div>

        {isComplete ? (
          /* Completion State */
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{
              fontSize: 48,
              marginBottom: 16,
            }}>
              ✅
            </div>
            <h3 style={{
              fontSize: 20,
              fontWeight: 600,
              color: t.textPrimary,
              marginBottom: 12,
              fontFamily: 'var(--font-sans)',
            }}>
              Exercise Complete!
            </h3>
            <p style={{
              fontSize: 16,
              color: t.textMuted,
              marginBottom: 32,
              fontFamily: 'var(--font-sans)',
            }}>
              Great job completing the {exercise.name} exercise. Take a moment to reflect on your responses.
            </p>
            
            {/* Show summary of answers */}
            <div style={{
              background: t.card,
              borderRadius: 12,
              padding: 20,
              marginBottom: 24,
              textAlign: 'left',
            }}>
              <h4 style={{
                fontSize: 16,
                fontWeight: 600,
                color: t.textPrimary,
                marginBottom: 16,
                fontFamily: 'var(--font-sans)',
              }}>
                Your Responses:
              </h4>
              {exercise.steps.map((step, index) => (
                step.userInput && (
                  <div key={step.stepNumber} style={{ marginBottom: 12 }}>
                    <p style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: t.textPrimary,
                      margin: '0 0 4px',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {step.title}:
                    </p>
                    <p style={{
                      fontSize: 14,
                      color: t.textMuted,
                      margin: 0,
                      fontFamily: 'var(--font-sans)',
                      fontStyle: 'italic',
                    }}>
                      {step.userInput}
                    </p>
                  </div>
                )
              ))}
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={handleRestart}
                style={{
                  padding: '12px 24px',
                  borderRadius: 8,
                  background: 'transparent',
                  color: t.textMuted,
                  border: `1px solid ${t.border}`,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Do Again
              </button>
              <button
                onClick={handleClose}
                style={{
                  padding: '12px 24px',
                  borderRadius: 8,
                  background: '#10B981',
                  color: 'white',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Finish
              </button>
            </div>
          </div>
        ) : (
          /* Exercise Steps */
          <>
            {/* Progress Bar */}
            <div style={{
              background: t.card,
              borderRadius: 8,
              padding: 4,
              marginBottom: 24,
            }}>
              <div style={{
                width: `${((currentStep + 1) / totalSteps) * 100}%`,
                height: 8,
                background: '#10B981',
                borderRadius: 4,
                transition: 'width 0.3s ease',
              }} />
            </div>

            {/* Step Counter */}
            <p style={{
              fontSize: 14,
              color: t.textMuted,
              marginBottom: 24,
              fontFamily: 'var(--font-sans)',
            }}>
              Step {currentStep + 1} of {totalSteps}
            </p>

            {/* Current Step */}
            <div>
              <h3 style={{
                fontSize: 18,
                fontWeight: 600,
                color: t.textPrimary,
                marginBottom: 12,
                fontFamily: 'var(--font-sans)',
              }}>
                {currentStepData.title}
              </h3>
              
              <p style={{
                fontSize: 16,
                color: t.textMuted,
                marginBottom: 24,
                lineHeight: 1.6,
                fontFamily: 'var(--font-sans)',
              }}>
                {currentStepData.prompt}
              </p>

              <textarea
                value={answers[currentStep] || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your response here..."
                style={{
                  width: '100%',
                  minHeight: 120,
                  padding: 16,
                  borderRadius: 8,
                  border: `1px solid ${t.border}`,
                  background: t.card,
                  color: t.textPrimary,
                  fontSize: 14,
                  fontFamily: 'var(--font-sans)',
                  resize: 'vertical',
                  outline: 'none',
                }}
              />
            </div>

            {/* Navigation Buttons */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 32,
            }}>
              <button
                onClick={handlePrevious}
                disabled={currentStep === 0}
                style={{
                  padding: '12px 24px',
                  borderRadius: 8,
                  background: 'transparent',
                  color: currentStep === 0 ? t.textMuted : t.textPrimary,
                  border: `1px solid ${t.border}`,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={!answers[currentStep]?.trim()}
                style={{
                  padding: '12px 24px',
                  borderRadius: 8,
                  background: !answers[currentStep]?.trim() ? t.textMuted : '#10B981',
                  color: 'white',
                  border: 'none',
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: !answers[currentStep]?.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {currentStep === totalSteps - 1 ? 'Complete' : 'Next'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}