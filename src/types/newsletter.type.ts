export interface INewsletterSubscriber {
  _id: string;
  email: string;
  status: "subscribed" | "unsubscribed";
  subscribedAt: string;
  unsubscribedAt?: string;
}
