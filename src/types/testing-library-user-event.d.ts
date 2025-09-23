declare module "@testing-library/user-event" {
  export interface UserEvent {
    click(
      element: Element | Window | Document,
      options?: unknown
    ): Promise<void>;
    type(
      element: Element,
      text: string,
      options?: { delay?: number }
    ): Promise<void>;
    selectOptions(
      element: Element,
      values: string | string[] | HTMLOptionElement | HTMLOptionElement[]
    ): Promise<void>;
    clear(element: Element): Promise<void>;
  }

  export interface UserEventModule {
    setup(options?: unknown): UserEvent;
  }

  const userEvent: UserEventModule & UserEvent;

  export default userEvent;
}
