export const validateQuestion = (question, section) => {
  const errors = [];

  if (!question.question_text || question.question_text.trim().length === 0) {
    errors.push("question_text is required");
  }

  if (!question.choices || !Array.isArray(question.choices)) {
    errors.push("choices must be an array");
  } else {
    const requiredCount = 4;
    if (question.choices.length !== requiredCount) {
      errors.push(`choices must have exactly ${requiredCount} options, got ${question.choices.length}`);
    }

    // Verify each choice is non-empty
    for (let i = 0; i < question.choices.length; i++) {
      if (!question.choices[i] || question.choices[i].trim().length === 0) {
        errors.push(`choice at index ${i} is empty`);
      }
    }
  }

  if (!question.correct_answer || question.correct_answer.trim().length === 0) {
    errors.push("correct_answer is required");
  } else if (question.choices && Array.isArray(question.choices)) {
    // Check correct_answer is one of the choice prefixes (A, B, C, D) or matches a choice
    const validLetters = ["A", "B", "C", "D"];
    const answer = question.correct_answer.toUpperCase().trim();
    const firstLetter = answer.charAt(0);

    if (!validLetters.includes(firstLetter)) {
      errors.push(`correct_answer '${question.correct_answer}' must start with A, B, C, or D`);
    } else {
      // Verify the answer letter maps to an existing choice
      const idx = validLetters.indexOf(firstLetter);
      if (idx >= question.choices.length) {
        errors.push(`correct_answer '${question.correct_answer}' references a choice that doesn't exist`);
      }
    }
  }

  if (!question.explanation || question.explanation.trim().length === 0) {
    errors.push("explanation is required");
  }

  if (!question.topic || question.topic.trim().length === 0) {
    errors.push("topic is required");
  }

  if (!question.difficulty || !["easy", "medium", "hard"].includes(question.difficulty)) {
    errors.push("difficulty must be easy, medium, or hard");
  }

  // Section-specific validation
  if (section === "math") {
    if (!question.choices || question.choices.length !== 4) {
      errors.push("Math questions must have exactly 4 choices");
    }
  }

  // Passage validation for reading/science
  if (["reading", "science"].includes((section || "").toLowerCase())) {
    if (question.passage_id !== undefined && question.passage_id !== null) {
      // If passage_id provided but passage content is empty in context — we just check it's not empty string
      if (typeof question.passage_id === "string" && question.passage_id.trim().length === 0) {
        errors.push("passage_id cannot be an empty string");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const validateBatch = (questions, section) => {
  const valid = [];
  const invalid = [];

  for (const question of questions) {
    const result = validateQuestion(question, section);
    if (result.valid) {
      valid.push(question);
    } else {
      invalid.push({ ...question, _validationErrors: result.errors });
    }
  }

  return { valid, invalid };
};
