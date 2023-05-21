export enum Role {
  User = "user",
  Assistant = "assistant",
  System = "system",
}

export type Message = {
  role: Role;
  content: string;
};

export enum FinishReason {
  /** API returned complete model output */
  Stop = "stop",
  /** Incomplete model output due to max_tokens parameter or token limit */
  Length = "length",
  /** Omitted content due to a flag from our content filters */
  ContentFilter = "content_filter",
  /** API response still in progress or incomplete */
  Null = "null",
}

export type Choice = {
  index: number;
  message: Message;
  finish_reason: FinishReason;
};

export type Usage = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
};

export type Completion = {
  id: string;
  object: "chat.completion";
  created: number;
  choices: Choice[];
  usage: Usage;
};

export type ChoiceChunk = {
  index: number;
  delta: Partial<Message>;
  finish_reason: FinishReason;
};

export type CompletionChunk = {
  id: string;
  object: "chat.completion.chunk";
  created: number;
  choices: ChoiceChunk[];
  usage: Usage;
};
