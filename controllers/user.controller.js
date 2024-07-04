import bcrypt from "bcrypt";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/User.js";
import { nanoid } from "nanoid";
import Notification from "../models/Notification.js";

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

const genenrateUsername = async (email) => {
  let username = email.split("@")[0];
  let user = await User.findOne({ "personal_info.username": username });
  if (user) {
    username = username + nanoid(3);
  }

  return username;
};

const formateDatatoSend = (user) => {
  const access_token = user.generateToken();

  return {
    access_token,
    profile_img: user.personal_info.profile_img,
    username: user.personal_info.username,
    fullname: user.personal_info.fullname,
    email: user.personal_info.email,
  };
};

const SignUp = async (req, res) => {
  const { fullname, email, password } = req.body;
  if (fullname.length < 3) {
    return ApiResponse(res, 400, "Fullname must be at least 3 characters long");
  }

  if (!email.match(emailRegex)) {
    return ApiResponse(res, 400, "Invalid email address");
  }

  if (!password.match(passwordRegex)) {
    return ApiResponse(
      res,
      400,
      "Password must contain at least one uppercase letter, one lowercase letter and one number"
    );
  }

  bcrypt.hash(password, 10, async (err, hash) => {
    if (err) {
      return ApiResponse(
        res,
        500,
        "An error occurred while hashing the password"
      );
    }
    let username = await genenrateUsername(email);
    const user = new User({
      personal_info: {
        fullname,
        email,
        password: hash,
        username,
      },
    });

    user
      .save()
      .then((user) => {
        return ApiResponse(
          res,
          201,
          "User created successfully",
          formateDatatoSend(user)
        );
      })
      .catch((err) => {
        console.log(err.message);

        if (err.code === 11000) {
          return ApiResponse(res, 400, "User with this email already exists");
        }

        return ApiResponse(
          res,
          500,
          "An error occurred while creating the user"
        );
      });
  });
};

const SignIn = async (req, res) => {
  const { email, password } = req.body;
  let user = await User.findOne({ "personal_info.email": email });
  if (!user) {
    return ApiResponse(res, 400, "User with this email does not exist");
  }

  bcrypt.compare(password, user.personal_info.password, (err, result) => {
    if (err) {
      return ApiResponse(res, 500, "An error occurred while logging in");
    }

    if (!result) {
      return ApiResponse(res, 400, "Invalid password");
    }

    return ApiResponse(
      res,
      200,
      "User signed in successfully",
      formateDatatoSend(user)
    );
  });
};

const SearchUser = async (req, res) => {
  const { query } = req.body;
  User.find(
    {
      $or: [
        { "personal_info.fullname": { $regex: query, $options: "i" } },
        { "personal_info.username": { $regex: query, $options: "i" } },
      ],
    },
    "personal_info.fullname personal_info.profile_img personal_info.username"
  )
    .limit(10)
    .then((users) => {
      if (!users.length) {
        return ApiResponse(res, 404, "No user found");
      }
      return ApiResponse(res, 200, "Users found", users);
    })
    .catch((err) => {
      console.log("Error occurred while searching user: ", err.message);
      return ApiResponse(res, 500, "Error occurred while searching user");
    });
};

const GetUser = async (req, res) => {
  let { username } = req.body;
  try {
    const user = await User.findOne({
      "personal_info.username": username,
    }).select("-personal_info.password -blogs");

    if (!user) {
      return ApiResponse(res, 404, "User not found");
    }
    return ApiResponse(res, 200, "User found", user);
  } catch (error) {
    console.log("Error occurred while getting user: ", err.message);
    return ApiResponse(res, 500, "Error occurred while getting user");
  }
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const { _id } = req.user;
  const user = await User.findById(_id);

  if (!user) {
    return ApiResponse(res, 404, "User not found");
  }

  bcrypt.compare(
    currentPassword,
    user.personal_info.password,
    async (err, result) => {
      if (err) {
        return ApiResponse(
          res,
          500,
          "An error occurred while changing password"
        );
      }

      if (!result) {
        return ApiResponse(res, 400, "Invalid current password");
      }

      if (!newPassword.match(passwordRegex)) {
        return ApiResponse(
          res,
          400,
          "Password must contain at least one uppercase letter, one lowercase letter and one number"
        );
      }

      bcrypt.hash(newPassword, 10, async (err, hash) => {
        if (err) {
          return ApiResponse(
            res,
            500,
            "An error occurred while hashing the password"
          );
        }

        user.personal_info.password = hash;
        user
          .save()
          .then((user) => {
            return ApiResponse(res, 200, "Password changed successfully");
          })
          .catch((err) => {
            return ApiResponse(
              res,
              500,
              "An error occurred while changing password"
            );
          });
      });
    }
  );
};

const changeProfileImg = async (req, res) => {
  const { _id } = req.user;
  const { profileImgUrl } = req.body;

  try {
    const user = await User.findById(_id);

    if (!user) {
      return ApiResponse(res, 404, "User not found");
    }

    user.personal_info.profile_img = profileImgUrl;
    const UpdatedUser = await user.save();
    return ApiResponse(
      res,
      200,
      "Profile image changed successfully",
      UpdatedUser
    );
  } catch (error) {
    return ApiResponse(
      res,
      500,
      "An error occurred while changing profile image"
    );
  }
};

const updateProfile = async (req, res) => {

  const { _id } = req.user;
  const {username,bio,social_links} = req.body;
  try {
    if(username < 3){
      return ApiResponse(res, 400, "Username must be at least 3 characters long");
    }

    

    
      const updatedUser = await User.findOneAndUpdate({_id},{
        "personal_info.username": username,
        "personal_info.bio": bio,
        social_links
      })
      .select("-personal_info.password -blogs");

      if(!updatedUser){
        return ApiResponse(res, 404, "User not found");
      }

      return ApiResponse(res, 200, "Profile updated successfully", updatedUser);
   
  } catch (error) {
    return ApiResponse(
      res,
      500,
      "An error occurred while updating profile"
    );
  }
}

const newNotification = async (req, res) => {
  const { _id } = req.user;
  
  try {
     const notification =  await  Notification.exists({notification_for: _id, seen: false,user: {$ne: _id}});
      
      if(!notification){
        return ApiResponse(res, 200, "No notification found",{new_notification: false});
      }

      return ApiResponse(res, 200, "Notification found",{new_notification: true});

  } catch (error) {
    console.log("Error occurred while getting notification: ", error.message);
    return ApiResponse(
      res,
      500,
      "An error occurred while getting notification"
    );
  }
}

const notifications = async (req, res) => {
  const { _id } = req.user;
  let {page,filter} = req.body;
  let max_limit = 10;
  let findQuery = {notification_for: _id,user: {$ne: _id}};

  let skip = (page - 1) * max_limit;  
  try {
    if(filter !== 'all'){
      findQuery.type = filter;
    }

    const notifications = await Notification.find(findQuery)
    .skip(skip)
    .limit(max_limit)
    .populate('blog','title blog_id')
    .populate('user','personal_info.fullname personal_info.profile_img personal_info.username')
    .populate('comment','content')
    .sort({createdAt: -1})
    .select('-notification_for -__v')

    if(!notifications.length){
      return ApiResponse(res, 200, "No notification found",{notifications:[]});
    }
    return ApiResponse(res, 200, "Notifications found", notifications);
  } catch (error) {
    console.log("Error occurred while getting notification: ", error.message);
    return ApiResponse(
      res,
      500,
      "An error occurred while getting notification"
    );
  }
}

const notificationCount = async (req, res) => {
  const { _id } = req.user;
  let {page,filter} = req.body;
  let findQuery = {notification_for: _id,user: {$ne: _id}};
  try {
    if(filter !== 'all'){
      findQuery.type = filter;
    }

    let  notifications = await Notification.countDocuments(findQuery)
    if(!notifications){
      notifications = 0;
      return ApiResponse(res, 200, "No notification found",{totalDocs:notifications});
    }
    return ApiResponse(res, 200, "Notifications found", {totalDocs:notifications});
  } catch (error) {
    console.log("Error occurred while getting notification: ", error.message);
    return ApiResponse(
      res,
      500,
      "An error occurred while getting notification"
    );
  }
}
export {notificationCount,notifications, newNotification,updateProfile,SignUp, SignIn, SearchUser, GetUser, changePassword, changeProfileImg};
