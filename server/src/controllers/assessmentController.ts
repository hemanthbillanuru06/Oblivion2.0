import { Response } from 'express';
import { Quiz, QuizAttempt } from '../models/Quiz.js';
import { Assignment, AssignmentSubmission } from '../models/Assignment.js';
import { Course } from '../models/Course.js';
import { AuthRequest } from '../middleware/auth.js';
import { recalculateAndSyncCourseProgress } from '../services/progressService.js';
import mongoose from 'mongoose';

// Get Quizzes for Course (Omits correct answers unless user is instructor of the course or admin)
export const getCourseQuizzes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ success: false, message: 'Course not found.' });
      return;
    }

    const isAuthorizedInstructorOrAdmin =
      req.user && (course.instructor.toString() === req.user._id.toString() || req.user.role === 'admin');

    let quizzesQuery = Quiz.find({ courseId });

    if (isAuthorizedInstructorOrAdmin) {
      // Include correct answers
      quizzesQuery = quizzesQuery.select('+questions.correctAnswerIndex');
    }

    const quizzes = await quizzesQuery.lean();

    res.status(200).json({ success: true, quizzes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Quiz by ID
export const getQuizById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id);

    if (!quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found.' });
      return;
    }

    // Check previous attempts
    let previousAttempts: any[] = [];
    if (req.user) {
      previousAttempts = await QuizAttempt.find({
        studentId: req.user._id,
        quizId: quiz._id,
      }).sort({ createdAt: -1 });
    }

    res.status(200).json({
      success: true,
      quiz,
      previousAttempts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit Quiz Attempt (Backend computes and verifies the score)
export const submitQuizAttempt = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const { selectedAnswers } = req.body; // Array of selected option indices: [0, 2, 1, ...]

    // Explicitly select the hidden correctAnswerIndex
    const quiz = await Quiz.findById(id).select('+questions.correctAnswerIndex');
    if (!quiz) {
      res.status(404).json({ success: false, message: 'Quiz not found.' });
      return;
    }

    if (!Array.isArray(selectedAnswers)) {
      res.status(400).json({ success: false, message: 'selectedAnswers must be an array of option indices.' });
      return;
    }

    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const reviewDetails: any[] = [];

    quiz.questions.forEach((q, index) => {
      const studentAnswer = selectedAnswers[index];
      const isCorrect = studentAnswer === q.correctAnswerIndex;
      if (isCorrect) {
        correctCount += 1;
      }

      reviewDetails.push({
        question: q.question,
        options: q.options,
        selectedAnswer: studentAnswer,
        correctAnswer: q.correctAnswerIndex,
        isCorrect,
        explanation: q.explanation || '',
      });
    });

    const scorePercentage = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercentage >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      studentId: req.user._id,
      quizId: quiz._id,
      courseId: quiz.courseId,
      selectedAnswers,
      score: scorePercentage,
      totalQuestions,
      correctAnswersCount: correctCount,
      passed,
    });

    // If quiz is attached to a lesson and passed, mark that lesson complete
    if (quiz.lessonId && passed) {
      await recalculateAndSyncCourseProgress(req.user._id, quiz.courseId, quiz.lessonId);
    }

    res.status(200).json({
      success: true,
      message: passed ? 'Congratulations, you passed the quiz!' : 'Quiz submitted. Passing score not reached.',
      attempt,
      reviewDetails,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create Quiz (Instructor/Admin)
export const createQuiz = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId, title, description, passingScore, questions, isFinalQuiz } = req.body;

    const quiz = await Quiz.create({
      courseId,
      lessonId,
      title,
      description: description || '',
      passingScore: passingScore || 70,
      questions,
      isFinalQuiz: !!isFinalQuiz,
    });

    res.status(201).json({ success: true, quiz });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assignments
export const getCourseAssignments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const assignments = await Assignment.find({ courseId }).lean();
    res.status(200).json({ success: true, assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { id } = req.params;
    const { submissionText, attachmentUrl } = req.body;

    const assignment = await Assignment.findById(id);
    if (!assignment) {
      res.status(404).json({ success: false, message: 'Assignment not found.' });
      return;
    }

    const submission = await AssignmentSubmission.findOneAndUpdate(
      { assignmentId: id, studentId: req.user._id },
      {
        assignmentId: id,
        studentId: req.user._id,
        courseId: assignment.courseId,
        submissionText,
        attachmentUrl: attachmentUrl || '',
        status: 'submitted',
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Assignment submitted successfully!',
      submission,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const gradeAssignment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { submissionId } = req.params;
    const { grade, feedback } = req.body;

    const submission = await AssignmentSubmission.findById(submissionId);
    if (!submission) {
      res.status(404).json({ success: false, message: 'Submission not found.' });
      return;
    }

    submission.grade = Number(grade);
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedBy = new mongoose.Types.ObjectId(req.user._id);

    await submission.save();

    res.status(200).json({ success: true, message: 'Assignment graded successfully.', submission });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
