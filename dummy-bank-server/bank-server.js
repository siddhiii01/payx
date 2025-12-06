import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const payments = new Map();  // token → payment object

//generating token
app.post('/create-payment',(req, res) => {
    const {amount,  redirectUrl, userId} = req.body; //getting from paytm server
    
    if(!amount || !redirectUrl){
        return res.status(400).json({error: "amount and redirectUrl required"})
    }

    //creating token
   const payment_token =crypto.randomBytes(60).toString('hex');

    // Prints random bytes of generated data
    // console.log("The random bytes of data generated is: ", token);

    //now i have to create a payment url 
    const paymentUrl = `http://localhost:3001/pay/${payment_token}`;

    payments.set(payment_token, {
        payment_token,
        amount,
        userId,
        status: "pending",
        redirectUrl
    });

    console.log("Current payments:", Array.from(payments.entries()))
    console.log('Bank: Created payment', { payment_token, amount, redirectUrl });
    
    //sending back to paytm server 
    res.json({
        payment_token,
        paymentUrl,
        
    });

    //and send both to the paytm backend -> how should o dp this??

});

app.get("/pay/:id", (req,res) => {
   res.send(`on page given by dummy server pay${req.params.id}`)
});
// Later we'll add:
// GET /pay/:token     → show approval page
// POST /success/:token, /failure/:token → update + call webhook

// You're NOT saving the payment anywhere!
// This is the biggest issue.
// When PayTM calls you, you generate token + URL, but you don't remember:
// amount
// userId
// redirectUrl (webhook URL)
// status
// → When user later visits /pay/:token, your server will have no idea what payment this is!
// You're not receiving important data from PayTM
// PayTM must send: amount, userId (optional), and most importantly redirectUrl (where to notify later)
// No storage → We need an in-memory store (for now, no DB)

app.listen(3001, () => {
    console.log(`DUMMY BANK SERVER IS LISTENING ON PORT 5000`)
});