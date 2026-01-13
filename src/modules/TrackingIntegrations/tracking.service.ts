import { Tracking } from "./tracking.model";
import { ITracking } from "./tracking.interface";

// Get the single tracking document, or create it if not exists
const getTrackingSettings = async () => {
  let settings = await Tracking.findOne();
  if (!settings) {
    settings = await Tracking.create({});
  }
  return settings;
};

const updateTrackingSettings = async (payload: Partial<ITracking>) => {
  let settings = await Tracking.findOne();
  if (!settings) {
    settings = await Tracking.create(payload);
  } else {
    settings = await Tracking.findByIdAndUpdate(settings._id, payload, {
      new: true,
      runValidators: true,
    });
  }
  return settings;
};

export const TrackingServices = {
  getTrackingSettings,
  updateTrackingSettings,
};
