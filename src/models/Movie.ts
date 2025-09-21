import { Schema, model, models, Document, Types } from 'mongoose';

export interface IMovie extends Document {
  title: string;
  description: string;
  added_by: Types.ObjectId; // reference to User
  created_at: Date;
}

const MovieSchema = new Schema<IMovie>({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  added_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Movie = models.Movie || model<IMovie>('Movie', MovieSchema);
export default Movie;
