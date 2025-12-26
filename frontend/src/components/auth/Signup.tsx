import {useForm} from "react-hook-form";
import axios from "axios";
import {registerSchema} from "shared_schemas";
import type {  SignupCredentials } from "shared_schemas";
import { zodResolver } from "@hookform/resolvers/zod";


export const Signup = () => {
    const {
        register, //A function that connects an input field to the form system.
        handleSubmit, //Wraps submit function.
        formState: {
            errors, //validation errors, keyed by field name.
            isSubmitting //Boolean value
        }, 
        reset,
    } = useForm<SignupCredentials>({resolver: zodResolver(registerSchema)});//Whenever the form is validated or submitted, validate it using THIS Zod schema.
    // const [submittedData, setSubmittedData] = useState<SignupCredentials | null>(null);
  
   
    //This will ONLY run after form submission, not while typing.
    const onSubmit = async (data:SignupCredentials) => {

        try{
            //HTTP POST request
            //await pauses until server responds
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/signup`,
                data, //request body -> Axios Json payload sending back to the backend -> it is an object
                //data is not JS object it is a Json string 
                //{withCredentials: true} // VERY IMPORTANT! Allows cookies to be sent/received
                
            );
            console.log("server response:", response.data);
            // setSubmittedData(data) //to save it to our state
            // console.log("submitted:", data),
            reset(); // this clears all inputs

        } catch(error: any){
            console.log("Signup failed");
        }
      
    }
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <h2>Create an Account</h2>
            <input 
                placeholder="Enter name" 
                {...register("name")}
            />
            {errors.name && <p>{errors.name.message}</p>}
        
            <input 
                placeholder="Enter email" 
                {...register("email")}
            />
            {errors.email && <p>{errors.email.message}</p>}

            <input 
                placeholder="Enter phone number" 
                {...register("phoneNumber")}
            />
            {errors.phoneNumber && <p>{errors.phoneNumber.message}</p>}

            <input 
                placeholder="Enter Password"
                type="password"
                {...register("password")}
            />
            {errors.password && <p>{errors.password?.message}</p>}

            <button disabled={isSubmitting}>{isSubmitting ? "Signing up...": "Continue"}</button>
            <p>
                Already a user?
                <a href="/login">Login with your Paytm account</a>
            </p>
        </form>

    );
}

// Network calls are asynchronous → we must wait.