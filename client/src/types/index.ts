export type UserRole = 'student' | 'instructor' | 'admin';
export type AccountStatus = 'active' | 'suspended';
export type InstructorStatus = 'none' | 'pending' | 'approved' | 'rejected';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type CourseStatus = 'draft' | 'published' | 'archived';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type ResourceFileType = 'pdf' | 'notes' | 'presentation' | 'code' | 'exercise' | 'doc' | 'ebook' | 'other';
export type ResourceAccess = 'public' | 'students_only' | 'paid_only';

export interface IUser {
  id: string;
  _id?: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage: string;
  bio?: string;
  headline?: string;
  accountStatus: AccountStatus;
  instructorStatus: InstructorStatus;
  instructorApplicationReason?: string;
  bookmarks?: {
    courses: string[] | any[];
    resources: string[] | any[];
  };
}

export interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
}

export interface ICourse {
  _id: string;
  title: string;
  slug: string;
  subtitle?: string;
  description: string;
  thumbnail: string;
  instructor: {
    _id: string;
    name: string;
    profileImage?: string;
    headline?: string;
    bio?: string;
  };
  category: string;
  tags: string[];
  difficulty: DifficultyLevel;
  price: number;
  isFree: boolean;
  currency: string;
  estimatedDuration: string;
  learningObjectives: string[];
  prerequisites: string[];
  status: CourseStatus;
  approvalStatus: ApprovalStatus;
  averageRating: number;
  totalReviews: number;
  totalEnrolled: number;
  createdAt: string;
}

export interface ILessonResource {
  title: string;
  url: string;
  fileType: string;
  fileSize?: string;
}

export interface ILesson {
  _id: string;
  courseId: string;
  moduleId: string;
  title: string;
  description?: string;
  type: 'video' | 'text' | 'quiz' | 'assignment';
  videoUrl?: string;
  content?: string;
  duration: number;
  isRequired: boolean;
  order: number;
  resources: ILessonResource[];
  quizId?: string;
  assignmentId?: string;
  isCompleted?: boolean;
}

export interface IModule {
  _id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  lessons: ILesson[];
}

export interface IEnrollment {
  _id: string;
  studentId: string;
  courseId: ICourse;
  status: 'active' | 'completed' | 'cancelled';
  enrollmentDate: string;
  lastAccessedLesson?: ILesson;
  lastAccessedAt?: string;
  completedLessonsCount: number;
  totalLessonsCount: number;
  progressPercentage: number;
  isCompleted: boolean;
  completionDate?: string;
}

export interface IResource {
  _id: string;
  title: string;
  description: string;
  uploaderId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  fileUrl: string;
  fileName: string;
  fileType: ResourceFileType;
  fileSize: string;
  category: string;
  tags: string[];
  access: ResourceAccess;
  downloadCount: number;
  createdAt: string;
}

export interface ICertificate {
  _id: string;
  certificateId: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  grade?: string;
  isValid: boolean;
  courseId?: ICourse;
}

export interface IReview {
  _id: string;
  studentId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  courseId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface IQuizQuestion {
  _id?: string;
  question: string;
  options: string[];
  correctAnswerIndex?: number;
  explanation?: string;
}

export interface IQuiz {
  _id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  description?: string;
  passingScore: number;
  questions: IQuizQuestion[];
  isFinalQuiz: boolean;
}

export interface IQuizAttempt {
  _id: string;
  quizId: string;
  courseId: string;
  score: number;
  totalQuestions: number;
  correctAnswersCount: number;
  passed: boolean;
  createdAt: string;
}

export interface IPaymentTransaction {
  _id: string;
  transactionId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod?: string;
  courseId: {
    _id: string;
    title: string;
    thumbnail: string;
    slug: string;
  };
  createdAt: string;
}
