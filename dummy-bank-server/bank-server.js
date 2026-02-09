import dotenv from "dotenv";
import express from "express";
import crypto from "crypto";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const BANK_BASE = process.env.BANK_BASE_URL || 'https://pyx-dummy-bank-server.onrender.com';

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const payments = new Map();  // token → payment object

// Create PaymentT
app.post('/create-payment',(req, res) => {

    console.log("BANK RECEIVED BODY:", req.body);
    console.log("BANK HAS userReturnUrl?:", !!req.body.userReturnUrl);
    console.log("BANK HAS webhookUrl?:", !!req.body.webhookUrl);
    console.log("BANK HAS redirectUrl?:", !!req.body.redirectUrl);
    //redirctUrl -> is the webhook url where the bank will notify the result of payment to paytm
    const {amount,  webhookUrl, userReturnUrl, userId, provider} = req.body; //getting from paytm server
    if(!amount || !webhookUrl || !userReturnUrl){
        return res.status(400).json({error: "amount, webhookUrl, and userReturnUrl required"})
    }
   // 1. Generate unique token
   const payment_token =crypto.randomBytes(60).toString('hex');
    // console.log("The random bytes of data generated is: ", token);

    // 2. Create the full payment URL (this is where the user will be redirected to approve
    //here the paymentUrl will first go to paytm then it will send to frontend
    //and the frontend will try to redirect the browser to that URL.
    const paymentUrl = `${process.env.BANK_BASE}/pay/${payment_token}`; //we need to create this here since this is the bank server this will show the Approval Page

    // 3. Store in Map
    payments.set(payment_token, {
        payment_token,
        amount,
        userId,
        provider,
        status: "pending",
        webhookUrl,
        userReturnUrl 
    });

    console.log("Current payments:", Array.from(payments.entries()))
    console.log('Bank: Created payment', { payment_token, amount, webhookUrl });

    //returns back to paytm server 
    res.json({
        payment_token, //paytm need this to track the token
        paymentUrl, // paytm will need this to redirect the user to bank approval page
        
    });
});

//THIS WILL SHOW PAYMENT PAGE WHETER THE PAYMENT HAS TO BE APPROVED OR DECLINED
app.get("/pay/:token", (req,res) => {
    const {token} = req.params //for extracting token 
    const payment = payments.get(token);
    if(!payment){
        return res.status(404).json({message: "Invalid or expired payment link"})
    }

   res.render('payment', {amount: payment.amount /100, userId: payment.userId, provider: payment.provider, token, })
});

//THIS IS FOR APRROVING THE PAYMENT
app.post('/success/:token', async (req, res) => {
    const {token} = req.params; //getting token from the url
    const payment = payments.get(token);
    //console.log("payment", payment)
    if(!payment){
        return res.status(404).json({message: "Payment not found"})
    }

    //update the payment to Suceess
    payment.status = "Success";
    payments.set(token, payment);

    //calling paytm webhook
    try {
        const webhookResponse  = await axios.post(payment.webhookUrl, {
            token, 
            userId: payment.userId,
            amount: payment.amount,
            status: "Success"
        });
        console.log("Webhook sent: Payment successful for token", token, webhookResponse );

    } catch(error){
        console.log("Failed to send webhook: ", error.message)
    }

    // Redirect user to PayX status page with params
    res.redirect(`${payment.userReturnUrl}?token=${token}&status=Success`);
    //showing confirmation page to user
    // res.render('confirmation', {
    //     amount: payment.amount,
    //     token,
    //     status: "Success",
    // }) 
});

//THIS IS FOR DECLINING THE PAYMENT
app.post('/failure/:token', async (req, res) => {
    const {token} = req.params;
    const payment = payments.get(token)
    if(!payment){
        res.status(400).json({message: "Payment not found"});
    }
    
    //update the payment to Failed
    payment.status="Failed"
    payments.set(token, payment);

    //calling webhook paytm
    try {
        const webhookResponse  = await axios.post(payment.redirectUrl, {
            token, 
            userId: payment.userId,
            amount: payment.amount,
            status: "Failed"
        }, );
        console.log("Webhook sent: Payment failed for token", token, webhookResponse );
         
    } catch(error) {
        console.error("Failed to send webhook:", error.message);
    }

    console.log("Rendiering failed page")
    //showing confirmation to user
    // res.render('confirmation', {
    //     status: "Failed",
    //     amount: payment.amount,
    //     token
    // });
    // Redirect user to PayX status page with params
    res.redirect(`${payment.userReturnUrl}?token=${token}&status=Failed`);
    
})

app.listen(3001, () => {
    console.log(`DUMMY BANK SERVER IS LISTENING ON PORT 3001`)
});