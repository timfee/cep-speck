declare module "@testing-library/react" {
  import type { ReactElement } from "react";

  interface RenderResult {
    rerender(ui: ReactElement): void;
    unmount(): void;
    container: HTMLElement;
  }

  type RoleQueryOptions = {
    name?: string | RegExp;
  };

  type LabelTextQueryOptions = {
    selector?: string;
  };

  interface Queries {
    getByRole(role: string, options?: RoleQueryOptions): HTMLElement;
    queryByRole(role: string, options?: RoleQueryOptions): HTMLElement | null;
    getByLabelText(
      labelText: string | RegExp,
      options?: LabelTextQueryOptions
    ): HTMLElement;
  }

  export function render(
    ui: ReactElement,
    options?: { container?: HTMLElement }
  ): RenderResult;

  export const screen: Queries;

  export function within(element: HTMLElement): Queries;
}
