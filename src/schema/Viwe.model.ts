import { Schema } from "mongoose";
import { ViewGroup } from "../libs/enums/viewEnum";
import mongoose from "mongoose";

const viewSchema = new Schema({
  viewGroup: {
    type: String,
    enum: ViewGroup,
    required: true,
  },
  memberId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Member",
  },
  viewRefId: {
    type: Schema.Types.ObjectId,
    required: true,
  },

},
  { timestamps: true }
);

export default mongoose.model("View", viewSchema);
