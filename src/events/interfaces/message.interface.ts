export interface IMessage {
    content: string;
    date: Date;
}

export interface IPostMessage {
    userId: string;
    payload: IMessage;
}