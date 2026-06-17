export const quizPrompt = (test, section, topic, difficulty, length, lessonContext = null) => {
  const systemMessage = `You are an expert ${test} test content creator with deep expertise in the ${section} section, specifically in ${topic}. You write original, pedagogically effective practice questions that help students master the ACT. You NEVER reproduce or closely paraphrase official ${test} test materials.

Return ONLY valid JSON. No markdown. No backticks. No preamble. No trailing text after the JSON.`;

  const lessonCtx = lessonContext
    ? `\n\nAdditional context from recent lesson on this topic:\n${lessonContext}`
    : "";

  const userMessage = `Generate a ${test} ${section} quiz on the topic "${topic}" with ${length} questions at ${difficulty} difficulty level.${lessonCtx}

Generate 100% original content. Never reproduce or closely paraphrase official ACT test materials.

${
  section.toLowerCase() === "english" || section.toLowerCase() === "reading"
    ? `Include 1-2 relevant passages (150-250 words each) and base multiple questions on each passage.`
    : ""
}
${
  section.toLowerCase() === "math"
    ? `Include a variety of math problem types relevant to "${topic}". Use question_latex for mathematical expressions.`
    : ""
}
${
  section.toLowerCase() === "science"
    ? `Include brief experimental scenarios or data descriptions as passages for the questions.`
    : ""
}

Return exactly this JSON structure:

{
  "questions": [
    {
      "section": "${section.toLowerCase()}",
      "topic": "${topic}",
      "difficulty": "${difficulty}",
      "passage": "Full passage text if applicable, otherwise null",
      "passage_questions": false,
      "question_text": "The complete question stem.",
      "question_latex": null,
      "choices": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
      "correct_answer": "A",
      "explanation": "Step-by-step explanation of the correct answer and why distractors are wrong.",
      "visual_json": null
    }
  ]
}

Rules:
- section must be: ${section.toLowerCase()}
- topic must be: ${topic}
- difficulty must be: ${difficulty}
- choices must be exactly 4 strings prefixed with "A. ", "B. ", "C. ", "D. "
- correct_answer must be exactly "A", "B", "C", or "D"
- All ${length} questions must focus specifically on "${topic}"
- Vary question formats and difficulty slightly within ${difficulty} to challenge the student
- Explanations must be thorough and educational
- Generate exactly ${length} questions`;

  return [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage },
  ];
};
