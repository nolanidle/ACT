export const lessonPrompt = (test, section, topic, difficulty, length = 6) => {
  const systemMessage = `You are a master ${test} tutor and curriculum designer specializing in the ${section} section. You create clear, engaging, and pedagogically effective lessons that help students deeply understand concepts and improve their scores. Your lessons are encouraging, student-centered, and use real-world examples where appropriate.

Return ONLY valid JSON. No markdown. No backticks. No preamble. No trailing text after the JSON.`;

  const blockCountGuidance =
    length <= 4
      ? "2 explanation blocks, 1 example, 1 interactive question, 1 strategy tip, 1 summary"
      : length <= 7
      ? "2 explanation blocks, 2 examples, 2 interactive questions, 1 strategy tip, 1 summary"
      : "3 explanation blocks, 2 examples, 3 interactive questions, 2 strategy tips, 1 summary";

  const userMessage = `Create a ${test} ${section} lesson on the topic "${topic}" at ${difficulty} difficulty level. Target approximately ${length} content blocks.

Suggested block distribution: ${blockCountGuidance}

The lesson should:
1. Start with a clear conceptual explanation
2. Show worked examples with step-by-step breakdowns
3. Include interactive practice questions that test understanding
4. Provide actionable test-taking strategies
5. End with a concise summary of key points

Return exactly this JSON structure:

{
  "title": "Engaging lesson title that reflects the topic",
  "topic": "${topic}",
  "blocks": [
    {
      "type": "explanation",
      "content": "Clear, detailed explanation of the concept. Use plain text — explain as if tutoring a student one-on-one. Can include multiple paragraphs."
    },
    {
      "type": "example",
      "content": "Description of the example scenario or problem context",
      "question": "The actual example question or problem statement",
      "answer": "Full step-by-step solution walkthrough"
    },
    {
      "type": "interactive_question",
      "question_text": "A practice question for the student to answer",
      "choices": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
      "correct_answer": "A",
      "hint": "A helpful hint that guides without giving away the answer",
      "explanation": "Detailed explanation of why the correct answer is right and why others are wrong"
    },
    {
      "type": "strategy_tip",
      "content": "A specific, actionable test-taking strategy or memory trick relevant to this topic"
    },
    {
      "type": "summary",
      "content": "Concise bullet-point summary of the 3-5 most important things to remember about this topic"
    }
  ]
}

Rules:
- type must be one of: explanation, example, interactive_question, strategy_tip, summary
- Each interactive_question must have exactly 4 choices prefixed with "A. ", "B. ", "C. ", "D. "
- correct_answer for interactive_question must be "A", "B", "C", or "D"
- Content must be specific to "${topic}" in ${test} ${section}
- Use ${difficulty} difficulty level throughout
- Make explanations thorough and educational — students are learning, not just drilling
- Strategy tips should be specific and actionable, not generic`;

  return [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage },
  ];
};
