declare module "react" {
  interface FormEvent<T = Element> {
    readonly target: EventTarget & T;
    readonly currentTarget: EventTarget & T;
  }
}
