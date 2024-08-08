
import mongoose, { Schema } from "mongoose";

const slotSchema = new Schema({
    date: {
        type: Date,
    },
    time: {
        type: String,
    },
    slots:
     [
        {
            time: String,
            availablity: Boolean
        }
     ]
});

const Slot = mongoose.model("Slot", slotSchema);

export default Slot;
