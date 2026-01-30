import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import Vote from '../models/Vote.js';
import Profile from '../models/Profile.js';

// ============ Questions ============

export async function createQuestion(userId, data) {
  const { title, body, tags } = data;

  const question = await Question.create({
    title,
    body,
    tags: tags || [],
    author: userId,
  });

  // Increment user's question count in profile
  await Profile.findOneAndUpdate(
    { user: userId },
    { $inc: { 'stats.questionsAsked': 1 } }
  );

  return question.populate('author', 'username');
}

export async function getQuestionById(questionId, userId = null) {
  const question = await Question.findById(questionId)
    .populate('author', 'username')
    .populate('acceptedAnswer')
    .lean();

  if (!question || question.status === 'deleted') {
    return null;
  }

  // Increment view count
  await Question.incrementView(questionId);

  // Get user's vote if logged in
  if (userId) {
    const userVote = await Vote.findUserVote(userId, 'question', questionId);
    question.userVote = userVote ? userVote.value : 0;
  }

  return question;
}

export async function searchQuestions(query, options = {}, userId = null) {
  const result = await Question.search(query, options);

  // Get user's votes for these questions
  if (userId && result.questions.length > 0) {
    const questionIds = result.questions.map((q) => q._id);
    const voteMap = await Vote.getUserVotesForTargets(
      userId,
      'question',
      questionIds
    );
    result.questions = result.questions.map((q) => ({
      ...q,
      userVote: voteMap[q._id.toString()] || 0,
    }));
  }

  return result;
}

export async function updateQuestion(questionId, userId, data) {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error('Question not found');
  }

  if (question.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to edit this question');
  }

  const { title, body, tags } = data;

  if (title) question.title = title;
  if (body) question.body = body;
  if (tags) question.tags = tags;

  await question.save();
  return question.populate('author', 'username');
}

export async function deleteQuestion(questionId, userId, isModerator = false) {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error('Question not found');
  }

  if (!isModerator && question.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this question');
  }

  // Soft delete
  question.status = 'deleted';
  await question.save();

  // Also soft delete all answers
  await Answer.updateMany(
    { question: questionId },
    { status: 'deleted' }
  );

  return { success: true };
}

export async function closeQuestion(questionId, userId, reason) {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error('Question not found');
  }

  // Only author or moderator can close
  if (question.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to close this question');
  }

  question.status = 'closed';
  question.closedReason = reason;
  question.closedAt = new Date();

  await question.save();
  return question;
}

// ============ Answers ============

export async function createAnswer(questionId, userId, body) {
  const question = await Question.findById(questionId);

  if (!question || question.status === 'deleted') {
    throw new Error('Question not found');
  }

  if (question.status === 'closed') {
    throw new Error('Cannot answer a closed question');
  }

  const answer = await Answer.create({
    question: questionId,
    body,
    author: userId,
  });

  // Update question's answer count
  await Question.updateAnswerCount(questionId, 1);

  // Increment user's answer count in profile
  await Profile.findOneAndUpdate(
    { user: userId },
    { $inc: { 'stats.answersGiven': 1 } }
  );

  return answer.populate('author', 'username');
}

export async function getAnswersForQuestion(questionId, options = {}, userId = null) {
  const answers = await Answer.getAnswersForQuestion(questionId, options);

  // Get user's votes for these answers
  if (userId && answers.length > 0) {
    const answerIds = answers.map((a) => a._id);
    const voteMap = await Vote.getUserVotesForTargets(userId, 'answer', answerIds);
    return answers.map((a) => ({
      ...a,
      userVote: voteMap[a._id.toString()] || 0,
    }));
  }

  return answers;
}

export async function updateAnswer(answerId, userId, body) {
  const answer = await Answer.findById(answerId);

  if (!answer || answer.status === 'deleted') {
    throw new Error('Answer not found');
  }

  if (answer.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to edit this answer');
  }

  answer.body = body;
  await answer.save();
  return answer.populate('author', 'username');
}

export async function deleteAnswer(answerId, userId, isModerator = false) {
  const answer = await Answer.findById(answerId);

  if (!answer || answer.status === 'deleted') {
    throw new Error('Answer not found');
  }

  if (!isModerator && answer.author.toString() !== userId.toString()) {
    throw new Error('Not authorized to delete this answer');
  }

  // Soft delete
  answer.status = 'deleted';
  await answer.save();

  // Update question's answer count
  await Question.updateAnswerCount(answer.question, -1);

  // If this was the accepted answer, clear it
  await Question.findByIdAndUpdate(answer.question, {
    $unset: { acceptedAnswer: '' },
  });

  return { success: true };
}

export async function acceptAnswer(answerId, userId) {
  const answer = await Answer.findById(answerId).populate('question');

  if (!answer || answer.status === 'deleted') {
    throw new Error('Answer not found');
  }

  const question = answer.question;

  // Only question author can accept
  if (question.author.toString() !== userId.toString()) {
    throw new Error('Only the question author can accept an answer');
  }

  // Clear any previously accepted answer
  if (question.acceptedAnswer) {
    await Answer.setAccepted(question.acceptedAnswer, false);
  }

  // Set this answer as accepted
  await Answer.setAccepted(answerId, true);

  // Update question
  question.acceptedAnswer = answerId;
  await question.save();

  return { success: true };
}

export async function unacceptAnswer(questionId, userId) {
  const question = await Question.findById(questionId);

  if (!question) {
    throw new Error('Question not found');
  }

  if (question.author.toString() !== userId.toString()) {
    throw new Error('Only the question author can unaccept an answer');
  }

  if (question.acceptedAnswer) {
    await Answer.setAccepted(question.acceptedAnswer, false);
    question.acceptedAnswer = null;
    await question.save();
  }

  return { success: true };
}

// ============ Voting ============

export async function voteOnQuestion(questionId, userId, value) {
  const question = await Question.findById(questionId);

  if (!question || question.status === 'deleted') {
    throw new Error('Question not found');
  }

  // Can't vote on own question
  if (question.author.toString() === userId.toString()) {
    throw new Error('Cannot vote on your own question');
  }

  const result = await Vote.castVote(userId, 'question', questionId, value);
  await Question.updateVoteScore(questionId, result.scoreDelta);

  const updatedQuestion = await Question.findById(questionId);
  return {
    action: result.action,
    newScore: updatedQuestion.voteScore,
  };
}

export async function voteOnAnswer(answerId, userId, value) {
  const answer = await Answer.findById(answerId);

  if (!answer || answer.status === 'deleted') {
    throw new Error('Answer not found');
  }

  // Can't vote on own answer
  if (answer.author.toString() === userId.toString()) {
    throw new Error('Cannot vote on your own answer');
  }

  const result = await Vote.castVote(userId, 'answer', answerId, value);
  await Answer.updateVoteScore(answerId, result.scoreDelta);

  const updatedAnswer = await Answer.findById(answerId);
  return {
    action: result.action,
    newScore: updatedAnswer.voteScore,
  };
}

// ============ Tags ============

export async function getPopularTags(limit = 20) {
  return Question.getPopularTags(limit);
}

// ============ User Stats ============

export async function getUserQAStats(userId) {
  const [questions, answers, acceptedAnswers] = await Promise.all([
    Question.countDocuments({ author: userId, status: { $ne: 'deleted' } }),
    Answer.countDocuments({ author: userId, status: 'active' }),
    Answer.countDocuments({ author: userId, status: 'active', isAccepted: true }),
  ]);

  return {
    questionsAsked: questions,
    answersGiven: answers,
    acceptedAnswers,
  };
}
