import mongoose, { Schema, Document } from 'mongoose';

export interface ICalculatorHistory extends Document {
  calculatorType: 'income-tax' | 'gst' | 'emi' | 'hra' | 'tds';
  inputData: Record<string, any>;
  result: Record<string, any>;
  userId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const CalculatorHistorySchema = new Schema<ICalculatorHistory>(
  {
    calculatorType: {
      type: String,
      enum: ['income-tax', 'gst', 'emi', 'hra', 'tds'],
      required: [true, 'Calculator type is required'],
    },
    inputData: {
      type: Schema.Types.Mixed,
      required: [true, 'Input data is required'],
    },
    result: {
      type: Schema.Types.Mixed,
      required: [true, 'Result is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Indexes
CalculatorHistorySchema.index({ calculatorType: 1 });
CalculatorHistorySchema.index({ userId: 1 });
CalculatorHistorySchema.index({ createdAt: -1 });

export const CalculatorHistory = mongoose.model<ICalculatorHistory>('CalculatorHistory', CalculatorHistorySchema);

