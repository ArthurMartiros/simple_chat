import { Type } from "class-transformer";
import { IsDate, IsDateString, IsDefined, IsNotEmpty, IsString, ValidateNested } from "class-validator";
import { IMessage, IPostMessage } from "../interfaces/message.interface";

export class Message implements IMessage {
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    content: string;
    @IsDateString()
    @IsDefined()
    date: Date;
}

export class PostMessage implements IPostMessage {
    @IsNotEmpty()
    @IsString()
    @IsDefined()
    userId: string;
    @ValidateNested()
    @Type(() => Message)
    @IsDefined()
    payload: Message;
}