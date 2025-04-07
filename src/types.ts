<<<<<<< HEAD
export type UserRole = "student" | "examiner" | "admin";

export type User = {
  id: string;
  email: string;
  role: UserRole;
};

export type Student = User & {
  firstName: string;
  lastName: string;
  studentId: string;
};

export type Examiner = User & {
  firstName: string;
  lastName: string;
};

export type Admin = User & {
  firstName: string;
  lastName: string;
};
=======
export type Student = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
}
>>>>>>> 32df47abaeac27ff8b21431d4e544eebc011a238

export type AIModel = {
  id: string;
  name: string;
  description: string;
  provider: string;
<<<<<<< HEAD
};

export type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  model: string;
};

export type ChatHistory = {
  [modelId: string]: Message[];
};
=======
}

export type Message = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  model: string;
}

export type ChatHistory = {
  [modelId: string]: Message[];
}
>>>>>>> 32df47abaeac27ff8b21431d4e544eebc011a238

// export type Metric = {
//   modelId: string;
//   promptStartTime: Date;
//   promptEndTime: Date;
//   responseStartTime: Date;
//   responseEndTime: Date;
//   promptLength: number;
//   messageCount: number;
//   promptDuration: number;
//   responseDuration: number;
<<<<<<< HEAD
// }
=======
// }
>>>>>>> 32df47abaeac27ff8b21431d4e544eebc011a238
