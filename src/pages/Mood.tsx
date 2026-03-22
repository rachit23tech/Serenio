/**
 * Mood.tsx — Mood check-in with random activity suggestions
 * Quote generator removed
 * Route: /mood
 */

import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { useTheme } from "../context/ThemeContext";
import { useHistory, MoodLevel } from "../context/HistoryContext";
import { getTheme } from "../tokens";

const MOODS: { id: MoodLevel; emoji: string; label: string; bg: string; ring: string }[] = [
  { id: "struggling", emoji: "😔", label: "Struggling", bg: "#FFCDD2", ring: "#E57373" },
  { id: "low",        emoji: "😟", label: "Low",        bg: "#FFE0B2", ring: "#FFB74D" },
  { id: "okay",       emoji: "😐", label: "Okay",       bg: "#FFF9C4", ring: "#F9A825" },
  { id: "good",       emoji: "🙂", label: "Good",       bg: "#C8E6C9", ring: "#66BB6A" },
  { id: "great",      emoji: "😊", label: "Great",      bg: "#B2DFDB", ring: "#26A69A" },
];

interface Activity {
  icon: string;
  title: string;
  desc: string;
  quote: string;
  color: string;
  lightBg: string;
}

const ACTIVITIES: Record<MoodLevel, Activity[]> = {
  struggling: [
    { icon: "🫁", title: "Box Breathing",        desc: "Inhale 4s → Hold 4s → Exhale 4s. Repeat 3 times.",             quote: "Breath is the anchor to the present moment.",                    color: "#5B7FE8", lightBg: "#EEF2FF" },
    { icon: "🎵", title: "Weightless",            desc: "By Marconi Union — scientifically proven to reduce anxiety.",   quote: "Music can change the world because it can change people.",        color: "#A855F7", lightBg: "#F5F3FF" },
    { icon: "☕", title: "Make a warm drink",     desc: "Tea, coffee or hot chocolate. Just sit with it slowly.",        quote: "Sometimes the smallest things take up the most room in your heart.", color: "#D97706", lightBg: "#FFFBEB" },
    { icon: "🛁", title: "Warm shower",           desc: "Let the water wash the heaviness away. Take your time.",        quote: "You don't have to earn rest. You just need it.",                  color: "#0891B2", lightBg: "#ECFEFF" },
    { icon: "🧸", title: "Comfort show",          desc: "Put on your favourite comfort show and just be.",               quote: "It's okay to need comfort. That's human.",                        color: "#DB2777", lightBg: "#FDF2F8" },
    { icon: "📞", title: "Call someone safe",     desc: "Text or call someone who makes you feel understood.",           quote: "You don't have to go through this alone.",                        color: "#1D4ED8", lightBg: "#EFF6FF" },
    { icon: "🕯️", title: "Dim the lights",        desc: "Light a candle or dim your room. Let your eyes rest.",          quote: "Peace begins with a gentle pause.",                               color: "#92400E", lightBg: "#FFFBEB" },
    { icon: "🧘", title: "Body scan meditation",  desc: "Lie down. Notice each part of your body from toes to head.",    quote: "Stillness is where creativity and solutions to problems are found.", color: "#0284C7", lightBg: "#F0F9FF" },
    { icon: "✍️", title: "Write it out",           desc: "Write exactly how you feel. No grammar, no filter.",            quote: "Journaling is like whispering to yourself.",                      color: "#7C3AED", lightBg: "#F5F3FF" },
    { icon: "🌿", title: "Step outside briefly",  desc: "Even 2 minutes of fresh air can shift your nervous system.",    quote: "Nature does not hurry, yet everything is accomplished.",           color: "#059669", lightBg: "#ECFDF5" },
    { icon: "🫂", title: "Self hug",              desc: "Wrap your arms around yourself. Hold for 20 seconds.",          quote: "You deserve the same compassion you give to others.",             color: "#BE185D", lightBg: "#FDF2F8" },
    { icon: "🎨", title: "Doodle freely",         desc: "Draw anything. No rules, no talent needed.",                    quote: "Creativity is intelligence having fun.",                          color: "#EA580C", lightBg: "#FFF7ED" },
    { icon: "🍵", title: "Mindful eating",        desc: "Eat one thing slowly. Notice every taste and texture.",         quote: "The present moment is the only moment available to us.",          color: "#065F46", lightBg: "#ECFDF5" },
    { icon: "💤", title: "Rest without guilt",    desc: "Close your eyes for 10 minutes. You don't need to sleep.",      quote: "Rest is productive. Your body is working even when you're still.", color: "#4338CA", lightBg: "#EEF2FF" },
    { icon: "🌸", title: "Look at something beautiful", desc: "A photo, a plant, the sky. Let your eyes soften.",       quote: "Beauty is everywhere. Sometimes we just need to slow down to see it.", color: "#C026D3", lightBg: "#FDF4FF" },
  ],
  low: [
    { icon: "🚶", title: "10 min slow walk",      desc: "No destination. Just move your body gently outside.",           quote: "Walking is man's best medicine.",                                 color: "#059669", lightBg: "#ECFDF5" },
    { icon: "📓", title: "Journal it out",         desc: "Write 3 things on your mind. Don't filter yourself.",           quote: "Writing is thinking on paper.",                                   color: "#7C3AED", lightBg: "#F5F3FF" },
    { icon: "🎵", title: "Fix You",               desc: "By Coldplay — let yourself feel it fully.",                     quote: "Music gives a soul to the universe.",                             color: "#A855F7", lightBg: "#F5F3FF" },
    { icon: "🧘", title: "Light stretching",       desc: "5 minutes of gentle stretches. The floor works perfectly.",     quote: "The body benefits from movement, the mind benefits from stillness.", color: "#0284C7", lightBg: "#F0F9FF" },
    { icon: "🍳", title: "Cook something simple",  desc: "Make a simple meal. The process is grounding.",                 quote: "Cooking is love made visible.",                                   color: "#EA580C", lightBg: "#FFF7ED" },
    { icon: "🌅", title: "Watch the sky",          desc: "Sit by a window and watch clouds or the sky for 5 minutes.",    quote: "Look up. The sky is always there for you.",                       color: "#0369A1", lightBg: "#F0F9FF" },
    { icon: "📺", title: "Watch something funny",  desc: "Comedy, memes, anything that makes you smile a little.",        quote: "Laughter is sunshine in any life.",                               color: "#D97706", lightBg: "#FFFBEB" },
    { icon: "🎮", title: "Play a simple game",     desc: "Puzzle, phone game, anything that occupies your mind.",         quote: "Play is the highest form of research.",                           color: "#7C3AED", lightBg: "#F5F3FF" },
    { icon: "🧹", title: "Tidy one small thing",   desc: "One drawer, one surface. Small order calms the mind.",          quote: "Outer order contributes to inner calm.",                          color: "#065F46", lightBg: "#ECFDF5" },
    { icon: "🐾", title: "Pet an animal",          desc: "If you have a pet, spend 10 minutes just with them.",           quote: "Animals are such agreeable friends.",                             color: "#92400E", lightBg: "#FFFBEB" },
    { icon: "📸", title: "Take one photo",         desc: "Find one beautiful thing around you and photograph it.",        quote: "Photography takes an instant out of time.",                       color: "#0891B2", lightBg: "#ECFEFF" },
    { icon: "🫧", title: "Wash your face",         desc: "Cold water on your face. Simple reset for your nervous system.", quote: "Small acts of self-care add up to big healing.",                  color: "#1D4ED8", lightBg: "#EFF6FF" },
    { icon: "🌿", title: "Water your plants",      desc: "If you have plants, tend to them. If not, just look at green.", quote: "Caring for something outside yourself is healing.",               color: "#059669", lightBg: "#ECFDF5" },
    { icon: "📚", title: "Read just one page",     desc: "One page of anything. Fiction, non-fiction, poetry.",           quote: "A reader lives a thousand lives.",                                color: "#4338CA", lightBg: "#EEF2FF" },
    { icon: "🎙️", title: "Talk to Serenio",        desc: "Switch to the Voice tab and just speak freely.",               quote: "Sometimes saying it out loud makes it lighter.",                  color: "#DB2777", lightBg: "#FDF2F8" },
  ],
  okay: [
    { icon: "🍳", title: "Try a new recipe",      desc: "Cook something you've never made before today.",                quote: "Cooking is about creating something delicious for someone else.", color: "#EA580C", lightBg: "#FFF7ED" },
    { icon: "📚", title: "Read 10 pages",          desc: "Any book. Just 10 pages. That's more than enough.",            quote: "Reading gives us someplace to go when we have to stay where we are.", color: "#0369A1", lightBg: "#F0F9FF" },
    { icon: "🎵", title: "Good Days",             desc: "By SZA — smooth, uplifting and just right for okay days.",     quote: "Music is what feelings sound like.",                              color: "#A855F7", lightBg: "#F5F3FF" },
    { icon: "🧹", title: "Tidy one small space",   desc: "Your desk or a drawer. Small order = calm mind.",              quote: "Outer order contributes to inner calm.",                          color: "#065F46", lightBg: "#ECFDF5" },
    { icon: "🎨", title: "Try sketching",          desc: "Draw anything for 10 minutes. No judgment, just fun.",         quote: "Every artist was first an amateur.",                              color: "#BE185D", lightBg: "#FDF2F8" },
    { icon: "🌿", title: "Go outside",             desc: "A 15 minute walk with no phone. Just observe.",               quote: "In every walk with nature, one receives more than he seeks.",     color: "#059669", lightBg: "#ECFDF5" },
    { icon: "📝", title: "Make a list",            desc: "Write 3 things you want to do this week. Just 3.",             quote: "A goal without a plan is just a wish.",                           color: "#7C3AED", lightBg: "#F5F3FF" },
    { icon: "☕", title: "Café visit",             desc: "Go sit in a café alone. Watch people. Enjoy the noise.",       quote: "Sometimes you need to be alone to recharge.",                     color: "#92400E", lightBg: "#FFFBEB" },
    { icon: "🎬", title: "Watch a documentary",   desc: "Learn something new. Let curiosity take over for an hour.",     quote: "The more you know, the more you realize you don't know.",        color: "#1D4ED8", lightBg: "#EFF6FF" },
    { icon: "🧩", title: "Do a puzzle",            desc: "Physical or digital. Give your brain a gentle challenge.",     quote: "Life is a puzzle — rejoice in putting it together.",              color: "#D97706", lightBg: "#FFFBEB" },
    { icon: "💌", title: "Write a letter",         desc: "To your future self or someone you care about.",               quote: "Letters are among the most significant memorials a person can leave.", color: "#DB2777", lightBg: "#FDF2F8" },
    { icon: "🧁", title: "Bake something",         desc: "Even simple — cookies, banana bread. Process is the point.",   quote: "Baking is love made edible.",                                     color: "#C026D3", lightBg: "#FDF4FF" },
    { icon: "🎧", title: "Podcast walk",           desc: "Pick a podcast episode and walk while listening.",             quote: "Learning something new every day is a superpower.",               color: "#0891B2", lightBg: "#ECFEFF" },
    { icon: "🌸", title: "Rearrange your space",  desc: "Move a few things around. A fresh layout refreshes the mind.",  quote: "Change your environment, change your energy.",                    color: "#4338CA", lightBg: "#EEF2FF" },
    { icon: "📞", title: "Check in on someone",   desc: "Text a friend asking how they're doing. Connection heals.",     quote: "We rise by lifting others.",                                      color: "#059669", lightBg: "#ECFDF5" },
  ],
  good: [
    { icon: "☕", title: "Go out for coffee",      desc: "Treat yourself to your favourite drink outside today.",         quote: "Happiness is a cup of coffee and a good book.",                   color: "#92400E", lightBg: "#FFFBEB" },
    { icon: "📞", title: "Call someone",           desc: "Reach out to a friend or family member you miss.",             quote: "Connection is why we're here.",                                   color: "#1D4ED8", lightBg: "#EFF6FF" },
    { icon: "🎵", title: "Golden Hour",            desc: "By JVKE — perfectly matches your good day vibe.",              quote: "Music is the shorthand of emotion.",                              color: "#A855F7", lightBg: "#F5F3FF" },
    { icon: "🏃", title: "Quick workout",          desc: "20 min run or home workout to keep the energy going.",         quote: "Exercise is a celebration of what your body can do.",             color: "#DC2626", lightBg: "#FEF2F2" },
    { icon: "📸", title: "Capture the day",        desc: "Take photos of things that made you smile today.",             quote: "A good photograph is one that communicates a fact.",              color: "#0891B2", lightBg: "#ECFEFF" },
    { icon: "🎨", title: "Create something",       desc: "Draw, paint, write, craft. Good energy fuels creativity.",     quote: "Creativity is intelligence having fun.",                          color: "#EA580C", lightBg: "#FFF7ED" },
    { icon: "🌿", title: "Nature walk",            desc: "A longer walk today. Explore somewhere new.",                  quote: "The world is beautiful. Go see it.",                              color: "#059669", lightBg: "#ECFDF5" },
    { icon: "📖", title: "Start that book",        desc: "The book you've been meaning to read. Today's the day.",       quote: "Today a reader, tomorrow a leader.",                              color: "#4338CA", lightBg: "#EEF2FF" },
    { icon: "🍽️", title: "Try a new restaurant",  desc: "Go eat somewhere you've never tried before.",                  quote: "Food is our common ground, a universal experience.",              color: "#D97706", lightBg: "#FFFBEB" },
    { icon: "💌", title: "Write gratitude",        desc: "Write 5 things you're grateful for right now.",                quote: "Gratitude turns what we have into enough.",                       color: "#DB2777", lightBg: "#FDF2F8" },
    { icon: "🎯", title: "Tackle that task",       desc: "Do the one thing you've been putting off. Good mood = power.", quote: "Action is the foundational key to all success.",                  color: "#7C3AED", lightBg: "#F5F3FF" },
    { icon: "🧁", title: "Treat someone",          desc: "Buy or make something nice for someone today.",                quote: "The best way to cheer yourself is to cheer someone else.",        color: "#C026D3", lightBg: "#FDF4FF" },
    { icon: "🎬", title: "Movie night",            desc: "Plan a movie night with friends or solo — fully enjoy it.",    quote: "Cinema is a mirror by which we often see ourselves.",             color: "#0369A1", lightBg: "#F0F9FF" },
    { icon: "🏊", title: "Try something physical", desc: "Swimming, cycling, yoga — use this good energy wisely.",       quote: "Take care of your body. It's the only place you have to live.",   color: "#065F46", lightBg: "#ECFDF5" },
    { icon: "🌅", title: "Watch the sunset",       desc: "Step outside tonight and watch the sky change colours.",       quote: "Every sunset is an opportunity to reset.",                        color: "#BE185D", lightBg: "#FDF2F8" },
  ],
  great: [
    { icon: "💃", title: "Dance it out",           desc: "Put on your favourite song and just let go completely.",       quote: "Dance is the hidden language of the soul.",                       color: "#DB2777", lightBg: "#FDF2F8" },
    { icon: "🎯", title: "Plan something exciting", desc: "A trip, a dinner, an adventure — something to look forward to.", quote: "A goal is a dream with a deadline.",                            color: "#7C3AED", lightBg: "#F5F3FF" },
    { icon: "🎵", title: "Blinding Lights",        desc: "By The Weeknd — pure energy for your incredible day.",         quote: "Music expresses that which cannot be put into words.",            color: "#A855F7", lightBg: "#F5F3FF" },
    { icon: "💌", title: "Spread the joy",         desc: "Text someone and genuinely tell them you appreciate them.",    quote: "Happiness is only real when shared.",                             color: "#0891B2", lightBg: "#ECFEFF" },
    { icon: "🚀", title: "Start that big project", desc: "Great energy = best time to start something meaningful.",      quote: "The secret of getting ahead is getting started.",                 color: "#1D4ED8", lightBg: "#EFF6FF" },
    { icon: "🤸", title: "Full workout",           desc: "Push yourself today — your body and energy are aligned.",      quote: "Your body can do it. It's your mind you need to convince.",       color: "#DC2626", lightBg: "#FEF2F2" },
    { icon: "🌍", title: "Explore somewhere new",  desc: "A new neighbourhood, park or place you've never been.",       quote: "The world is a book. Those who do not travel read only one page.", color: "#059669", lightBg: "#ECFDF5" },
    { icon: "🎤", title: "Sing out loud",          desc: "Sing your favourite song at full volume. No shame.",           quote: "To sing is to love and to affirm.",                               color: "#C026D3", lightBg: "#FDF4FF" },
    { icon: "📸", title: "Document this day",      desc: "Take photos. Record a video. Remember how great today feels.", quote: "One day you'll look back and realise today was one of those days.", color: "#D97706", lightBg: "#FFFBEB" },
    { icon: "🧁", title: "Celebrate yourself",     desc: "Buy yourself something small. You deserve it today.",          quote: "You are enough, you have enough, you do enough.",                 color: "#BE185D", lightBg: "#FDF2F8" },
    { icon: "🤝", title: "Help someone",           desc: "Offer help to someone — a colleague, stranger or friend.",    quote: "No act of kindness, however small, is ever wasted.",              color: "#065F46", lightBg: "#ECFDF5" },
    { icon: "📚", title: "Learn something new",    desc: "Watch a TED talk, read an article, start a new topic.",       quote: "An investment in knowledge pays the best interest.",              color: "#4338CA", lightBg: "#EEF2FF" },
    { icon: "🌅", title: "Wake up early tomorrow", desc: "Plan to catch the sunrise. Give tomorrow the same energy.",   quote: "Each morning we are born again. What we do today matters most.",  color: "#92400E", lightBg: "#FFFBEB" },
    { icon: "🎨", title: "Make something creative", desc: "Channel this great energy into art, writing or music.",      quote: "Creativity is the way I share my soul with the world.",           color: "#EA580C", lightBg: "#FFF7ED" },
    { icon: "🍽️", title: "Cook for someone",       desc: "Invite someone over and cook a meal together.",               quote: "Food tastes better when shared with people you love.",            color: "#0369A1", lightBg: "#F0F9FF" },
  ],
};

function getLast7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i)); return d;
  });
}
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function Mood() {
  const { dark } = useTheme();
  const t = getTheme(dark);
  const { moodLog, logMood } = useHistory();
  const [selected, setSelected] = useState<MoodLevel | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);
  const days = getLast7Days();

  const getMoodForDay = (day: Date) =>
    moodLog.find((m) => m.date.toDateString() === day.toDateString())?.mood ?? null;
  const getMoodEmoji = (mood: MoodLevel | null) =>
    mood ? MOODS.find((m) => m.id === mood)?.emoji ?? "" : "";
  const getMoodBg = (mood: MoodLevel | null) =>
    mood ? MOODS.find((m) => m.id === mood)?.bg ?? "#E0E0E0" : dark ? "#2A2535" : "#F0ECE6";

  const handleMoodSelect = (mood: MoodLevel) => {
    setSelected(mood);
    logMood(mood);
    const list = ACTIVITIES[mood];
    setActivity(list[Math.floor(Math.random() * list.length)]);
  };

  const shuffleActivity = () => {
    if (!selected) return;
    const list = ACTIVITIES[selected];
    setActivity(list[Math.floor(Math.random() * list.length)]);
  };

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex" }}>
      <Sidebar active="mood" />
      <main style={{
        flex: 1, marginLeft: 240,
        display: "flex", flexDirection: "column",
        alignItems: "center", padding: "48px 24px 60px", overflowY: "auto",
      }}>
        <div style={{ width: "100%", maxWidth: 580 }}>

          {/* Header */}
          <div style={{ marginBottom: 32, textAlign: "center" }}>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: t.textPrimary, margin: "0 0 6px", fontFamily: "'Nunito',sans-serif" }}>
              How are you feeling today?
            </h1>
            <p style={{ fontSize: 14, color: t.textMuted, fontFamily: "'Nunito',sans-serif" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>

          {/* Mood picker */}
          <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 12, flexWrap: "wrap" }}>
            {MOODS.map((m) => {
              const isSelected = selected === m.id;
              return (
                <button key={m.id} onClick={() => handleMoodSelect(m.id)} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  background: "none", border: "none", cursor: "pointer", fontFamily: "'Nunito',sans-serif",
                }}>
                  <div style={{
                    width: 64, height: 64, borderRadius: "50%", background: m.bg, fontSize: 28,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: isSelected ? `0 0 0 3px ${m.ring}, 0 4px 16px ${m.ring}55` : "none",
                    transform: isSelected ? "scale(1.15)" : "scale(1)",
                    opacity: selected && !isSelected ? 0.4 : 1,
                    transition: "all 0.2s",
                  }}>{m.emoji}</div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: isSelected ? t.textPrimary : t.textMuted, transition: "color 0.2s" }}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {selected && (
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "#66BB6A", fontWeight: 600, fontFamily: "'Nunito',sans-serif" }}>
                ✓ Mood saved automatically
              </p>
            </div>
          )}

          {/* Random Activity Card */}
          {activity && (
            <div style={{
              borderRadius: 20, padding: "24px 28px", marginBottom: 20,
              background: dark ? "rgba(255,255,255,0.04)" : activity.lightBg,
              border: `1.5px solid ${dark ? "rgba(255,255,255,0.08)" : activity.color + "44"}`,
              boxShadow: t.cardShadow,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: "50%", flexShrink: 0,
                  background: dark ? "rgba(255,255,255,0.08)" : activity.color + "22",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                }}>
                  {activity.icon}
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, margin: "0 0 3px", color: activity.color, textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "'Nunito',sans-serif" }}>
                    Try this today
                  </p>
                  <p style={{ fontSize: 18, fontWeight: 700, margin: 0, color: dark ? "#F1F5F9" : activity.color, fontFamily: "'Nunito',sans-serif" }}>
                    {activity.title}
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 14, color: t.textPrimary, lineHeight: 1.65, margin: "0 0 16px", fontFamily: "'Nunito',sans-serif" }}>
                {activity.desc}
              </p>

              <div style={{ padding: "12px 16px", borderRadius: 12, background: dark ? "rgba(255,255,255,0.04)" : activity.color + "11", borderLeft: `3px solid ${activity.color}` }}>
                <p style={{ fontSize: 13, color: dark ? "#CBD5E1" : activity.color, margin: 0, lineHeight: 1.6, fontStyle: "italic", fontFamily: "'Nunito',sans-serif" }}>
                  "{activity.quote}"
                </p>
              </div>

              <button onClick={shuffleActivity} style={{
                marginTop: 16, display: "flex", alignItems: "center", gap: 6,
                padding: "8px 18px", borderRadius: 50,
                background: dark ? "rgba(255,255,255,0.08)" : activity.color + "18",
                color: dark ? "#CBD5E1" : activity.color,
                border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : activity.color + "44"}`,
                fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Nunito',sans-serif",
              }}>
                🔀 Try a different activity
              </button>
            </div>
          )}

          {/* 7-day history */}
          <div style={{ borderRadius: 20, padding: "24px 28px", background: t.card, border: `1px solid ${t.border}`, boxShadow: t.cardShadow }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: t.textPrimary, margin: "0 0 20px", fontFamily: "'Nunito',sans-serif" }}>
              7 Day Mood History
            </h2>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 8 }}>
              {days.map((day, i) => {
                const mood = getMoodForDay(day);
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, flex: 1 }}>
                    <div style={{ width: 44, height: 44, borderRadius: "50%", background: getMoodBg(mood), fontSize: 22, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                      {getMoodEmoji(mood)}
                    </div>
                    <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'Nunito',sans-serif" }}>
                      {DAY_LABELS[day.getDay() === 0 ? 6 : day.getDay() - 1]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}