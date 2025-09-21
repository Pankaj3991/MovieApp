import { Schema, model, models, Document, Types } from 'mongoose';

export interface IVote extends Document {
  user_id: Types.ObjectId;
  movie_id: Types.ObjectId;
  vote_type: 'up' | 'down' | '+1' | '-1';
  created_at: Date;
}

const VoteSchema = new Schema<IVote>({
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
  vote_type: {
    type: String,
    enum: ['up', 'down', '+1', '-1'],
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Vote = models.Vote || model<IVote>('Vote', VoteSchema);
export default Vote;
