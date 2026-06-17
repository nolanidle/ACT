export const diagnosticPrompt = (test, sections, countPerSection) => {
  const totalQuestions = sections.length * countPerSection;
  const sectionList = sections.join(", ");

  const systemMessage = `You are an expert ${test} test content creator with 20+ years of experience writing standardized test questions. You create pedagogically sound, original practice questions that accurately reflect the style and difficulty of the official ${test} test. You NEVER reproduce or closely paraphrase official ${test} test materials.

Return ONLY valid JSON. No markdown. No backticks. No preamble. No trailing text after the JSON.`;

  const userMessage = `Generate a ${test} diagnostic assessment with ${totalQuestions} total questions (${countPerSection} per section) covering these sections: ${sectionList}.

Generate 100% original content. Never reproduce or closely paraphrase official ACT test materials.

Distribution: ${countPerSection} questions per section across ${sections.join(", ")}.
Difficulty: mix of easy (30%), medium (50%), hard (20%).
For English/Reading: include realistic passage excerpts (150-300 words) and group 3-5 questions per passage.
For Math: include a mix of topics (algebra, geometry, statistics, trigonometry).
For Science: include data interpretation and experimental design questions with brief data descriptions.

Return exactly this JSON structure:

{
  "questions": [
    {
      "section": "english",
      "topic": "Punctuation",
      "difficulty": "medium",
      "passage": "The full passage text goes here. This is required for English and Reading questions. For Math and Science, set to null.",
      "passage_questions": true,
      "question_text": "The complete question stem goes here.",
      "question_latex": null,
      "choices": ["A. First option", "B. Second option", "C. Third option", "D. Fourth option"],
      "correct_answer": "A",
      "explanation": "Detailed explanation of why A is correct and why B, C, D are wrong.",
      "visual_json": null
    }
  ]
}

Rules:
- section must be one of: ${sections.map((s) => s.toLowerCase()).join(", ")}
- difficulty must be one of: easy, medium, hard
- choices must be an array of exactly 4 strings, each prefixed with "A. ", "B. ", "C. ", or "D. "
- correct_answer must be exactly "A", "B", "C", or "D"
- passage is the full text of any reading passage; null for standalone questions
- question_latex is a LaTeX string for math notation; null if not needed
- visual_json is structured data for charts or diagrams; null if not needed
- All questions must be original — do not reproduce any official ACT content
- Generate exactly ${totalQuestions} questions total`;

  return [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage },
  ];
};
