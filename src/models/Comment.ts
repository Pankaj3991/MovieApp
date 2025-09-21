import { Schema, model, models, Document, Types } from 'mongoose';

export interface IComment extends Document {
  user_id: Types.ObjectId;
  movie_id: Types.ObjectId;
  body: string;
  created_at: Date;
}

const CommentSchema = new Schema<IComment>({
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  movie_id: {
    type: Schema.Types.ObjectId,
    ref: 'Movie',
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Comment = models.Comment || model<IComment>('Comment', CommentSchema);
export default Comment;
