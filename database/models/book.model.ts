import {model, models, Schema} from 'mongoose';
import {IBook} from "@/types";

const BookSchema = new Schema<IBook>({
    clerkId: {type: String, required: true},
    title: {type: String, required: true},
    slug: {type: String, required: true, unique: true, lowercase: true, trim: true},
    author: {type: String, required: true},
    persona: {type: String},
    fileURL: {type: String, required: true},
    fileBlobKey: {type: String, required: true},
    coverURL: {type: String},
    coverBlobKey: {type: String, required: true},
    fileSize: {type: Number, required: true},
    totalSegments: {type: Number, default: 0},
}, {timestamps: true});

const Book = models.book || model<IBook>('Book', BookSchema);

export default Book;