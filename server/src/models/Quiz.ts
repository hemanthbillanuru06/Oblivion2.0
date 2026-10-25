import mongoose, { Document, Schema } from 'mongoose';

export interface IQuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface IQuiz extends Document {
  courseId: mongoose.Types.ObjectId;
  lessonId?: mongoose.Types.ObjectId;
  title: string;
  description: string;
  passingScore: number; // e.g. 70 (%)
  questions: IQuizQuestion[];
  isFinalQuiz: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswerIndex: { type: Number, required: true, select: false }, // protected by default in queries
    explanation: { type: String, default: '' },
  },
  { _id: true }
);

const quizSchema = new Schema<IQuiz>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    lessonId: { type: Schema.Types.ObjectId, ref: 'Lesson', index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    passingScore: { type: Number, default: 70, min: 0, max: 100 },
    questions: [quizQuestionSchema],
    isFinalQuiz: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<IQuiz>('Quiz', quizSchema);

export interface IQuizAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  quizId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  selectedAnswers: number[];
  score: number;
  totalQuestions: number;
  correctAnswersCount: number;
  passed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    selectedAnswers: [{ type: Number }],
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswersCount: { type: Number, required: true },
    passed: { type: Boolean, required: true },
  },
  { timestamps: true }
);

export const QuizAttempt = mongoose.model<IQuizAttempt>('QuizAttempt', quizAttemptSchema);
