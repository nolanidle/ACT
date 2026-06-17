export const studyPlanPrompt = (weakSkills, targetDate) => {
  const today = new Date();
  const target = targetDate ? new Date(targetDate) : null;
  const weeksAvailable = target
    ? Math.max(1, Math.ceil((target - today) / (7 * 24 * 60 * 60 * 1000)))
    : 8;

  const weakSkillsList = weakSkills
    .map((s) => `- ${s.test} ${s.section} — ${s.topic} (accuracy: ${s.accuracy || 0}%)`)
    .join("\n");

  const systemMessage = `You are an expert ACT prep coach and curriculum designer. You create personalized, realistic, and effective study plans that help students improve their ACT scores. Your plans are specific, actionable, and motivating. You understand how to prioritize weak areas while maintaining breadth of coverage.

Return ONLY valid JSON. No markdown. No backticks. No preamble. No trailing text after the JSON.`;

  const userMessage = `Create a personalized ACT study plan for a student.

Student's Weak Areas (prioritize these):
${weakSkillsList || "No specific weak areas identified — create a balanced review plan."}

Test Date: ${targetDate || "Not specified — plan for 8 weeks"}
Weeks Available: ${weeksAvailable}

Create a week-by-week study plan. Each week should have daily tasks (Mon-Fri, weekend review).

Return exactly this JSON structure:

{
  "plan_overview": {
    "total_weeks": ${weeksAvailable},
    "target_date": "${targetDate || null}",
    "focus_areas": ["list of primary focus areas in priority order"],
    "daily_time_minutes": 45,
    "strategy": "Brief description of the overall study approach"
  },
  "weeks": [
    {
      "week_number": 1,
      "theme": "Week theme (e.g., 'English Foundations')",
      "goals": ["Goal 1 for this week", "Goal 2 for this week"],
      "days": {
        "monday": {
          "title": "Daily focus title",
          "tasks": [
            {
              "type": "lesson",
              "section": "english",
              "topic": "Punctuation",
              "duration_minutes": 20,
              "description": "What the student should do"
            },
            {
              "type": "quiz",
              "section": "english",
              "topic": "Punctuation",
              "question_count": 10,
              "difficulty": "medium",
              "duration_minutes": 15,
              "description": "Practice quiz description"
            }
          ]
        },
        "tuesday": { "title": "...", "tasks": [] },
        "wednesday": { "title": "...", "tasks": [] },
        "thursday": { "title": "...", "tasks": [] },
        "friday": { "title": "...", "tasks": [] },
        "weekend": {
          "title": "Weekend Review",
          "tasks": [
            {
              "type": "review",
              "description": "Review the week's material and take a short mixed quiz",
              "duration_minutes": 60
            }
          ]
        }
      },
      "weekly_tip": "A specific test-taking or study tip for this week's content"
    }
  ],
  "milestones": [
    {
      "week": 2,
      "milestone": "Complete your first diagnostic assessment",
      "check": "Have you taken a full practice diagnostic?"
    }
  ],
  "motivational_message": "A personalized, encouraging message for the student about their journey"
}

Rules:
- Generate exactly ${weeksAvailable} weeks (or up to 8 if no target date)
- Prioritize the identified weak areas in early weeks
- task type must be one of: lesson, quiz, review, diagnostic, exam
- Each day should have 2-4 tasks totaling 35-55 minutes
- Gradually increase difficulty across weeks
- Include at least one diagnostic or practice exam in the plan
- Be specific with topics — reference the actual weak areas listed above
- Make the plan achievable and motivating, not overwhelming`;

  return [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage },
  ];
};
