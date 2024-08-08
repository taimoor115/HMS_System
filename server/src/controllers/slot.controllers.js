// import Slot from "../models/slot.models";
// import User from "../models/user.models";
// import ExpressError from "../utils/ExpressError";


// export const slots = async(req,res, next) => {
//     const {date, time} = req.body;
//     const validTime = [ 
//         { time: '10:00', available: true },
//         { time: '11:00', available: true },
//         { time: '12:00', available: true },
//         { time: '13:00', available: true },
//         { time: '14:00', available: true },
//         { time: '15:00', available: true },
//         { time: '16:00', available: true },
//         { time: '17:00', available: true },
//         { time: '18:00', available: true },
//         { time: '19:00', available: true }
//       ];


//       const selectedDate = new Date(date);

//       const now = new Date();
//       if(selectedDate <= now) {
//         return next(new ExpressError(400, "Please selected future date"))
//     }


//     const selectedHour = parseInt(time.split(':')[0], 10);
//     if(selectedHour < 10 || selectedHour >= 18 || !validTime.includes(time)) {
//         return next(new ExpressError(400, "The interview must be in between 10am to 7pm"))
//     }
    
//     const findDate = await Slot.findOne({date});

//     console.log("findDate", findDate);

//     if(!findDate) {
//         const updatedSlots = validTime.map((slot) =>  slot.time === time ? {...slot, available: false} : slot)
//         const slot = new Slot({date,time, updatedSlots})
//         await slot.save();

        
//     } else {
        
//     }
// }

