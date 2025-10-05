import { Webhook } from 'svix';
import User from '../models/UserModel.js';

const handleSvixWebhook = async (req, res) => {
  const webhook_secret = process.env.WEB_HOOK_SECRET;

  if (!webhook_secret) {
    return res.status(400).json({ message: "Webhook secret not found" });
  }

  const payload = JSON.stringify(req.body);
  const headers = req.headers;
  // console.log('payload', payload);
  // console.log('headers', headers);

  const wh = new Webhook(webhook_secret);
  const svix_id = headers['svix-id'];
  const svix_timestamp = headers['svix-timestamp'];
  const svix_signature = headers['svix-signature'];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ message: "Missing svix headers" });
  }

  try {
    const event = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    });

    // console.log('event', event);

    if (event.type === 'user.created') {
      const { id, email_addresses } = event.data;
      const email = email_addresses[0].email_address;
      const username = email.split('@')[0];

      const newUser = new User({
        user_id: id,
        email,
        username,
      });

      await newUser.save();
      // console.log('user created', newUser);
    }

    res.status(200).json({ message: "Webhook received" });

  } catch (error) {
    console.log(error);
    return res.status(400).json({ message: "Invalid svix signature" });
  }
};

const getUserData = async(req,res) =>{
  const userId =  req.user.id;
  // console.log(userId);
  const user = await User.findOne({user_id:userId});
  // console.log(user);
  res.status(200).json({success:true , user:user});
}

export {handleSvixWebhook , getUserData};
