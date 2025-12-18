import Gig from "../models/gigs.model.js";
import PerformerProfile from "../models/performerProfile.model.js";

export const closeExpiredGigs = async () => {
  const now = new Date();

  try {
    const expiredGigs = await Gig.find({
      status: "open",
      "eventDate.start": { $lte: now },
    }).select("_id");

    if (!expiredGigs.length) return;

    const expiredGigIds = expiredGigs.map((g) => g._id);

    await Gig.updateMany(
      { _id: { $in: expiredGigIds } },
      { $set: { status: "closed" } }
    );

    await PerformerProfile.updateMany(
      { appliedGigs: { $in: expiredGigIds } },
      { $pull: { appliedGigs: { $in: expiredGigIds } } }
    );

    console.log(
      `Closed ${expiredGigIds.length} expired gigs and cleaned performer applications`
    );
  } catch (error) {
    console.error("Error closing expired gigs:", error);
  }
};
