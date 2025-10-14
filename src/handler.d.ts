declare global {
  type WithUserId<T> = T & {
    user_id: string;
  };

  interface Handler<InputType, ReturnType> {
    execute(params: WithUserId<InputType>): Promise<ReturnType>;
  }
}

export {};
