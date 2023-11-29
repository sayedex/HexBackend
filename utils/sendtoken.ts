// Create Token and saving in cookie

const sendToken = (user:any, statusCode:any, res:any) => {
    const token = user.getJWTToken();
  
    // options for cookie
    const options = {
      expires: new Date(
        Date.now() + 10 * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
    };
  
    res.status(statusCode).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });
  };
  
export default sendToken;
  