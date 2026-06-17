export const explanationPrompt = (questionText, selectedAnswer, correctAnswer, choices) => {
  const isCorrect = selectedAnswer === correctAnswer;
  const studentFeedback = isCorrect
    ? `The student selected ${selectedAnswer}, which is correct.`
    : `The student selected ${selectedAnswer}, but the correct answer is ${correctAnswer}.`;

  const choicesList = Array.isArray(choices)
    ? choices.map((c, i) => `  ${c}`).join("\n")
    : choices;

  const systemMessage = `You are a patient, expert ACT tutor. Your role is to help students deeply understand why an answer is correct or incorrect. You provide clear, encouraging, step-by-step explanations that build understanding — not just reveal answers. You analyze each answer choice and explain the reasoning behind it.

Return ONLY valid JSON. No markdown. No backticks. No preamble. No trailing text after the JSON.`;

  const userMessage = `A student just answered this ACT practice question. ${studentFeedback}

Question:
${questionText}

Answer Choices:
${choicesList}

Correct Answer: ${correctAnswer}
Student's Answer: ${selectedAnswer}

Provide a comprehensive step-by-step explanation. Return exactly this JSON structure:

{
  "is_correct": ${isCorrect},
  "student_answer": "${selectedAnswer}",
  "correct_answer": "${correctAnswer}",
  "summary": "One or two sentence summary of the key concept being tested",
  "step_by_step": [
    "Step 1: ...",
    "Step 2: ...",
    "Step 3: ..."
  ],
  "why_correct": "Detailed explanation of why ${correctAnswer} is the correct answer",
  "why_wrong": {
    ${choices
      .filter((c) => {
        const letter = c.charAt(0);
        return letter !== correctAnswer;
      })
      .map((c) => {
        const letter = c.charAt(0);
        return `"${letter}": "Explanation of why choice ${letter} is incorrect"`;
      })
      .join(",\n    ")}
  },
  "concept": "The underlying ACT skill or concept being tested",
  "strategy_tip": "A specific strategy to use for similar questions in the future",
  "encouragement": "${isCorrect ? "Positive reinforcement for getting it right" : "Encouraging message to help the student learn from this mistake"}"
}

Make the explanation thorough, clear, and educational. Assume the student genuinely wants to understand the material, not just memorize the answer.`;

  return [
    { role: "system", content: systemMessage },
    { role: "user", content: userMessage },
  ];
};
