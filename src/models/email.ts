export class Email extends String {
  constructor(email: string) {
    super(email);
  }

  public validate(): boolean {
    const email = this.toString();
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  }
}