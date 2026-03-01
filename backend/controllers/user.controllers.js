import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-password"); 

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json(user);

  } catch (error) {
    return res.status(500).json({
      msg: "Failed to fetch current user",
    });
  }
};


export const updateUserLocation = async(req, res) => {
  try {
    const {lat, lng} = req.body;
    const user = await User.findByIdAndUpdate(req.userId, {
      location:{
        type : 'Point',
        coordinates:[lng, lat]
      }
    }, {new : true});
    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    return res.status(200).json({msg : "Location updated"})
    

  } catch (error) {
    return res.status(500).json({
      msg: "Failed to update user location",
    });
  }
}
