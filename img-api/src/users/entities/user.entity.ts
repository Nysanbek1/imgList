import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import bcrypt from 'node_modules/bcryptjs';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  password!: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre<UserDocument>('save', async function () {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this;

  if (!user.isModified('password')) {
    return {};
  }

  try {
    const salt = await bcrypt.genSalt(10);
    // Хэшируем пароль и заменяем исходный текст хэшем
    user.password = await bcrypt.hash(user.password, salt);
  } catch {
    return console.log(this.errors);
  }
});
