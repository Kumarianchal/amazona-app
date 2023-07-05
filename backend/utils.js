import jwt from 'jsonwebtoken';
export const generateToken = (user) => {
    return jwt.sign(                        //sign the user info with JWT secret to generate web toten
        {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin,
        },
        process.env.JWT_SECRET,         //jwt secret is an environment variable 
        {
            expiresIn: '30d', 
        }
    );
};
//middleware
export const isAuth=(req,res,next)=>{
    const authorization=req.headers.authorization;
    if(authorization){
        const token=authorization.slice(7, authorization.length);  //Bearer XXXX   so , to remove first 7 characters we have used slice
        jwt.verify(
          token,
          process.env.JWT_SECRET,
          (err, decode)=>{
            if(err){
                res.status(401).send({message:'Invalid Token'});
            }
            else{         //decode is the decrypted version of the token that includes user information
                req.user=decode;
                next();    //by calling next we go to the order routes to new Order()  function
            }
          }  
        );
    }else{
        res.status(401).send({message: 'No Token'});
    }
};