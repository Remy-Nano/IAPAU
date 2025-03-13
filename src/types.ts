export type Student = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  studentId: string;
}

export type AIModel = {
  id: string;
  name: string;
  description: string;
  provider: string;
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
// }